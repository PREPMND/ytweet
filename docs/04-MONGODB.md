# 4 — MongoDB & Mongoose

---

## 4.1 The data model

```
User                      Video                   Subscription
──────────                ──────────              ──────────────
_id                       _id                     _id
username   (unique, idx)  title                   subscriber ─┐ unique
email      (unique)       description             channel    ─┘ compound
fullName                  videoFile  (Cloudinary)
avatar                    thumbnail
coverImage                duration   (seconds)    Message
password   (bcrypt)       views                   ──────────────
refreshToken              isPublished             _id
watchHistory  [Video]     owner ──────▶ User      sender    ──▶ User
watchLater    [Video]     createdAt               receiver  ──▶ User
notInterested [Video]                             conversationId (idx)
isOnline                                          text
lastSeen                                          messageType
                                                  status (sent|seen)
```

### Embed or reference?

| Relation | Choice | Why |
|---|---|---|
| Video → owner | **reference** | A user has unbounded videos; embedding would duplicate the profile into every video and make an avatar change a mass update. |
| User → watchHistory | **reference array, capped at 100** | Bounded by `$slice`, read with the user, never queried in reverse. |
| User → watchLater | **reference array** | Small, personal, always read with the user. Nobody asks "who saved this video?". |
| Subscription | **separate collection** | A many-to-many that must be queried from *both* directions (my subs, my subscribers) and counted. |
| Message | **separate collection** | Unbounded growth. Embedding would hit the 16 MB document limit. |

**The 16 MB document limit is the hard constraint behind all of this.** Any
unbounded list must be its own collection, or capped.

### Why `conversationId` is derived, not stored

```js
export const buildConversationId = (user1, user2) =>
    [String(user1), String(user2)].sort().join("_");
```

Sorting makes it symmetric: A→B and B→A produce the same key. So there is no
`Conversation` collection to create, look up, or keep in sync — the key is a
pure function of the participants. One indexed field answers "give me this
thread".

The trade-off: it does not generalise to group chats. For those you *would*
need a real `Conversation` document with a participants array. Worth saying
out loud in an interview — it shows you know the limit of your own design.

---

## 4.2 Indexes

```js
// back/src/models/video.models.js
videoSchema.index({ isPublished: 1, createdAt: -1 });   // the feed
videoSchema.index({ isPublished: 1, views: -1 });       // trending
videoSchema.index({ owner: 1, createdAt: -1 });         // channel page
videoSchema.index({ title: "text", description: "text" });

// back/src/models/subscription.models.js
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });
subscriptionSchema.index({ channel: 1 });
```

### The ESR rule

Compound index field order: **Equality, Sort, Range.**

The feed query is `{ isPublished: true }` sorted by `createdAt: -1`.
`isPublished` is the equality match, `createdAt` is the sort → index
`{ isPublished: 1, createdAt: -1 }`. Getting the order wrong means Mongo must
fetch and sort in memory, and an in-memory sort over 32 MB **fails outright**.

A compound index also serves any **prefix** of itself:
`{a:1, b:1, c:1}` covers `{a}` and `{a,b}` — but not `{b}` or `{b,c}`.

### Why the unique index on Subscription matters

Without it, a double-click on Subscribe creates two documents and
`$size: "$subscribers"` is permanently wrong. Application-level
"check-then-insert" cannot prevent this — two requests can both read "not
subscribed" before either writes. **Only the database can enforce it**, which
is why the controller catches error code `11000`:

```js
try {
    await Subscription.create(filter);
    subscribed = true;
} catch (err) {
    if (err?.code !== 11000) throw err;   // duplicate key — someone won the race
    subscribed = true;
}
```

That is a textbook check-then-act race, and the textbook fix.

---

## 4.3 The aggregation pipeline

```js
// back/src/controllers/socket.controller.js — the inbox
Message.aggregate([
    { $match:  { $or: [{ sender: userId }, { receiver: userId }] } },
    { $sort:   { createdAt: -1 } },
    { $group:  { _id: "$conversationId",
                 lastMessage: { $first: "$$ROOT" },
                 unreadCount: { $sum: { $cond: [ ... , 1, 0] } } } },
    { $addFields: { otherUser: { $cond: [...] } } },
    { $lookup: { from: "users", localField: "otherUser", foreignField: "_id",
                 as: "otherUser",
                 pipeline: [{ $project: { username: 1, avatar: 1, ... } }] } },
    { $unwind: "$otherUser" },
    { $project: { ... } },
    { $sort:   { createdAt: -1 } },
])
```

Stage by stage:

| Stage | Does |
|---|---|
| `$match` | filter — **put it first** so it can use an index |
| `$sort` + `$group`+`$first` | the "latest per group" idiom |
| `$cond` inside `$sum` | conditional counting — 1 when unread, else 0 |
| `$addFields` | computed field, keeps all existing ones (`$project` does not) |
| `$lookup` | left outer join |
| `$unwind` | array → one document per element |

### Three rules worth memorising

1. **`$match` as early as possible.** Only a `$match` at the very start can
   use an index; after `$group` the documents are synthetic.
2. **`$lookup` always returns an array**, even for a one-to-one join. Flatten
   it with `$unwind` or `{ $first: "$field" }`.
3. **`$project` inside the `$lookup` sub-pipeline**, not after. Projecting
   afterwards means the full joined documents (including `password` and
   `refreshToken`) were already pulled into memory.

### `$unwind` silently drops documents

```js
{ $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } }
```

Default `$unwind` removes any document whose array is empty. In the feed, a
video whose owner row was deleted would **vanish from the feed with no error**.
`preserveNullAndEmptyArrays: true` keeps it. This is one of the most common
real-world aggregation bugs.

### The bug: `pipeline` must be an array

```js
// BROKEN — back/src/controllers/user.controller.js
$lookup: {
    from: "videos", localField: "watchHistory", foreignField: "_id",
    as: "watchhistory",
    pipeline: { $lookup: { ... } }        // ← an OBJECT
}
```

`pipeline` takes an **array of stages**. Passing an object made the whole
watch-history endpoint error out. The nested `$addFields` was also misplaced
*inside* the inner `$project` pipeline, where it could not see `$owner`.

```js
// FIXED
pipeline: [
    { $lookup: { from: "users", localField: "owner", foreignField: "_id",
                 as: "owner",
                 pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }] } },
    { $addFields: { owner: { $first: "$owner" } } },
]
```

---

## 4.4 Pagination: skip/limit vs cursor

```js
Video.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
```

`skip(n)` **walks and discards** n documents. At page 1000 with limit 20 the
database reads 20,020 documents to return 20. It is O(n) in the offset.

There is a second, subtler problem: if a new video is inserted between the
user loading page 1 and page 2, everything shifts down and they see the same
item twice.

**Cursor (keyset) pagination** fixes both:

```js
// Instead of ?page=3, pass the last item you saw:
Video.find({ ...filter, createdAt: { $lt: new Date(req.query.before) } })
     .sort({ createdAt: -1 })
     .limit(limit)
```

O(log n) via the index, and stable under inserts. The cost is that you lose
"jump to page 7" — which is exactly the right trade for an infinite-scroll
feed. The chat history already uses this shape (`?before=<ISO date>`).

### The unstable-sort bug

```js
switch (sort) {
    case "latest": sortOption = { createdAt: -1 }; break;
    case "oldest": sortOption = { createdAt:  1 }; break;
    // no default → sortOption = {}
}
```

An unrecognised `?sort=` value produced `{}` — "natural order", which MongoDB
does **not** guarantee to be consistent between queries. Combined with
skip/limit, that means duplicated and missing rows across pages. The fix
validates against an allow-list and always falls back to `latest`:

```js
const sort = SORT_MAP[req.query.sort] ? req.query.sort : "latest";
```

---

## 4.5 Mongoose hooks — and the one I got wrong

```js
// back/src/models/user.models.js
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});
```

**In Mongoose 9 an `async` pre-hook receives NO `next` callback.** The returned
promise *is* the completion signal — resolving means continue, throwing means
abort the save. I initially "fixed" this by adding `next()`, and it failed
immediately with:

```
TypeError: next is not a function
```

So the original `return` was correct. The lesson: a non-async hook takes
`next`; an async hook returns a promise. Never mix them.

### Why `isModified` is load-bearing

`generateAccessAndRefreshTokens` calls `user.save()` to store a new refresh
token. Without the `isModified("password")` guard, *that* save would re-hash
the already-hashed password — and the user could never log in again. One line
standing between working auth and a permanently locked account.

### `save()` vs `findByIdAndUpdate()`

```js
user.password = newPassword;
await user.save();                 // ✅ hook runs → hashed
```

```js
await User.findByIdAndUpdate(id, { password: newPassword });   // ❌ no hook
```

Update operators talk to the database directly; document middleware never
runs. **A plaintext password would be stored.** This single distinction is a
very common interview question, and a very common real breach.

Note the deliberate exception:

```js
await user.save({ validateBeforeSave: false });   // storing refreshToken only
```

Skipping validation here avoids re-running required-field validators for a
write that touches one unrelated field.

---

## 4.6 `.lean()`

```js
Video.find(filter).limit(limit).lean()
```

By default Mongoose hydrates every result into a full document with getters,
setters, virtuals and change tracking. `.lean()` returns plain objects
instead — typically **3–5× faster and far less memory**.

Use it for read-only responses. Do *not* use it when you need `.save()`, a
virtual, or an instance method like `isPasswordCorrect`.

Note `getVideoById` deliberately does **not** use `.lean()`, because it calls
`video.toObject()` and relies on `populate` behaviour.

---

## 4.7 Atomic operators

```js
Video.updateOne({ _id }, { $inc: { views: 1 } });
```

Never read-modify-write a counter:

```js
const v = await Video.findById(id);
v.views += 1;            // ← two concurrent requests both read 10
await v.save();          //   both write 11; one view is lost
```

`$inc` is applied atomically by the server.

```js
// Most-recent-first watch history, capped at 100
User.updateOne({ _id }, { $pull: { watchHistory: videoId } })
User.updateOne({ _id }, { $push: { watchHistory:
    { $each: [videoId], $position: 0, $slice: 100 } } })
```

`$pull` then `$push` because MongoDB cannot do both to one array in a single
update. `$position: 0` puts it at the front; `$slice: 100` caps the array so
it can never grow unbounded.

```js
$addToSet   // insert only if absent — IDEMPOTENT, so double-clicks are safe
$push       // always appends — duplicates possible
$unset      // removes the field entirely
$set        // sets it, including to null
```

The logout controller uses `$unset: { refreshToken: 1 }` rather than
`$set: { refreshToken: undefined }` — the latter is a no-op in some driver
versions, leaving the old refresh token valid after "logging out".

---

Next: **[05 — React & the frontend](./05-REACT.md)**
