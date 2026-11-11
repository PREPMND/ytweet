# 9 — Design Decisions

Every non-obvious choice, with the alternative that was rejected and why.
This is the part interviewers probe hardest: anyone can write code, fewer can
explain the trade-off they chose.

---

## 9.1 Backend

### Keep `asyncHandler` even though Express 5 handles promises

Express 5 auto-forwards rejected promises, so the wrapper is technically
redundant. Kept because it is explicit, costs nothing, and the codebase mixes
wrapped and unwrapped handlers — a single convention is worth more than the
six lines saved.

### Redis fails open, authorisation fails closed

| Component | On failure | Why |
|---|---|---|
| Redis cache | serve uncached | it is an optimisation |
| Rate limiter | let the request through | locking everyone out is worse than brief over-permissiveness |
| Elasticsearch | fall back to Mongo regex | degraded search beats no search |
| `verifyJWT` | **reject** | an auth check that fails open is not a check |

The rule: **fail open for availability concerns, fail closed for security
concerns.** Being able to state that distinction is the point.

### An in-memory fallback rather than just skipping the cache

A `Map` with TTLs is ~80 lines. The alternative — `if (!redis) return next()`
— means a Redis outage removes rate limiting entirely, which is exactly when
you are most likely to be under load. The fallback is per-instance rather than
shared, which is a real limitation, and `/health` surfaces which mode you are
in so it is never silent.

### Preserve `test` as the database name

The `DBNAME` bug meant all real data lives in the default `test` database.
"Fixing" it properly would have pointed the app at an empty database and
appeared to delete everything. The fix makes the name **explicit and correct**
while keeping the same target.

*Principle: a correctness fix that moves live data is a migration, not a fix.*

### `POST /videos/any` kept as an alias

```js
export const any = getVideosByOwner;
```

The old name is meaningless, but the frontend calls it. Aliasing lets the
implementation improve without a coordinated deploy. (The response shape did
change, which broke the watch page — a reminder that renaming is safe and
reshaping is not. The consumer now accepts both.)

### Watch history on the user, messages in their own collection

Both are "a list of things". The difference is **bounded vs unbounded**.
Watch history is capped at 100 with `$slice`, always read with the user, and
never queried in reverse — so embedding ids is right. Messages grow without
limit and would eventually hit the 16 MB document ceiling.

### `conversationId` derived, not stored

`[a, b].sort().join("_")` is symmetric, needs no extra collection, and cannot
drift out of sync. The cost: it does not generalise to group chats, which
would need a real `Conversation` document. A deliberate trade for a 1-to-1
messaging product.

### Rate limit by user when known, IP otherwise

IP-only punishes everyone behind a shared NAT (a school, an office, a mobile
carrier). User-only is unusable for login, which is pre-authentication.
`req.user?._id ?? req.ip` covers both — and `trust proxy` makes the IP real.

### Tighter limits on credential endpoints

30/20s for reads, 10/60s for login and register. Those are the brute-force
surface, and they should be slow; a feed endpoint should not be.

---

## 9.2 Frontend

### Route structure: two layouts, not one

| Layout | Pages | Why |
|---|---|---|
| `MainLayout` | feed, channel, watch, saved, search, settings, inbox | needs the navbar |
| `AuthLayout` | login, register, **chat view** | full-bleed, no chrome |

The chat view is the interesting one. It renders its *own* `fixed top-0`
header and `fixed bottom-0` composer, so a navbar above it would double up.
The inbox (`/message`) is a normal list and keeps the navbar.

### `<Protected>` renders a panel instead of redirecting

A hard redirect loses the URL the user wanted, and makes "log in and come
back" impossible. Rendering in place preserves the route, passes
`state.from` to the login page, and the URL stays shareable.

It also distinguishes **three** states, not two:

```
loading  → spinner         (NOT the signed-out panel)
no user  → toast + panel
user     → the page
```

Collapsing loading into "signed out" makes the panel flash on every refresh
before the session check returns — a small thing that makes an app feel broken.

### Toasts over a DOM `CustomEvent`, not React context

```js
window.dispatchEvent(new CustomEvent("app-toast", { detail: { ... } }));
```

Because the axios interceptor needs to raise toasts and it lives **outside**
the component tree. A context-based API would force every non-React module to
receive a callback. The interceptor already dispatched a `rate-limit` event
that nothing listened for — this gave it a home.

### The feed, channels and watch pages stay public

Only personal pages are gated. A social platform whose content requires login
has no discovery path and no shareable links. `optionalJWT` lets the watch
page record history when it knows who you are, without requiring it.

### Optimistic hide for "Not interested", server round trip for "Watch later"

"Not interested" is low-stakes and benefits from feeling instant, so the card
disappears immediately and rolls back on error. "Watch later" shows a toast on
confirmation because the user expects to find it in a list afterwards —
claiming success before the server agrees would be a lie if it failed.

### "Save to playlist" is disabled, not fake

Playlists need a collection with name, ordering and privacy. That schema does
not exist. A button that silently does nothing is worse than a disabled one,
and a disabled one is more honest than a fake success toast.

### Fixed-height meta block, pinned views/age row

CSS grid rows size to their tallest item. Without a reservation, a one-line
title made its card shorter and the whole row shifted as thumbnails and titles
streamed in. The skeleton uses the identical `h-[102px]`, so swapping
placeholder for data causes **zero** layout shift.

The title itself is *not* fixed-height — the channel name sits naturally
underneath it — and only the views/age row is absolutely positioned at the
bottom. That keeps the natural reading rhythm while giving the eye a stable
line to scan across cards.

### Skeletons over spinners

A spinner says "something is happening". A skeleton says "content of *this
shape* is arriving", and if it matches the real layout it eliminates layout
shift. Used for the feed, search results and the Saved list; the spinner is
kept only for "fetching the next page", where the layout is already stable.

### CSS variables alongside the `darkMode` prop

The components thread a `darkMode` boolean through props. Rewriting all of
them to Tailwind's `dark:` variant would have been a large, risky change.
Instead `:root` / `body.dark` tokens give plain CSS one source of truth while
the prop-driven classes stay untouched — the two systems coexist and
`document.body.className` already drove the switch.

### `.input` deliberately ignores dark mode

It is used only on the register form, which always renders on a white card
over a photo. Making it follow the theme produced white text on white.
**A component that always renders on a fixed background should not follow a
global theme.**

### `prefers-reduced-motion` honoured globally

The app leans on transitions, hover-to-play previews and particle backgrounds.
For people with vestibular disorders that is actively unpleasant, and it is
three lines of CSS.

### Visible focus rings restored

Tailwind's preflight removes the UA outline and none of the custom buttons
added one back, so keyboard navigation was invisible. A `:focus-visible` rule
restores it without showing a ring on mouse clicks.

---

## 9.3 Performance

### Dead imports were the whole problem

Route-level `React.lazy` is the textbook answer and it helped — but it took
the bundle from 1,207 kB to 910 kB. Deleting two never-rendered imports took
it to **273 kB**.

The lesson is to **measure before optimising**. The obvious fix was worth 25%;
the unglamorous one was worth 70%.

### `loading="lazy"` kept, `fetchPriority="low"` removed

`loading="lazy"` is correct: it defers off-screen images and the browser
starts them ~1250 px ahead. `fetchPriority="low"` layered an *additional*
deprioritisation on top, which is what made thumbnails arrive visibly late
while scrolling.

### The view counter is fire-and-forget

```js
Video.updateOne({ _id }, { $inc: { views: 1 } }).catch(() => {});
```

Awaiting it would add a database round trip to every page load for a number
nobody checks for exactness. At scale this should be batched in Redis and
flushed periodically — the `.catch()` is mandatory either way, since an
unhandled rejection crashes Node.

---

## 9.4 Known limitations (say these before you are asked)

1. **No tests.** The single highest-value next step. One integration test on
   `/refreshtoken` would have caught the worst bug in the repo.
2. **Socket.IO is unauthenticated.** Anyone can emit `register-user` with any
   id. Needs a JWT handshake middleware.
3. **Prop drilling in `App.jsx`.** Eight pieces of state threaded through
   three levels. Needs split contexts.
4. **`isLoggedIn` duplicates the query cache.** Derived state that can drift.
5. **`KEYS videos:*` for invalidation.** O(n) and blocking. Needs a
   generation counter.
6. **`skip`/`limit` pagination.** O(offset), and unstable under inserts.
7. **Uploads proxy through the API.** A 200 MB video occupies a server for the
   whole transfer. Signed direct-to-Cloudinary uploads are the single biggest
   available win.
8. **The login background is a 4.1 MB JPEG.** Should be a resized WebP/AVIF
   with a `<picture>` fallback — probably under 150 kB.
9. **No CSRF tokens.** Mitigated by `sameSite`, but defence in depth would add
   them.
10. **No pagination on the inbox.** `getConversations` aggregates every message
    the user has ever sent or received on each load.
11. **Presence is in-process.** Breaks across multiple instances without the
    Socket.IO Redis adapter.
12. **No structured logging.** `console.log` is not queryable; pino/winston
    with request ids would be.

Being able to list these unprompted is worth more than having fixed half of
them silently. It demonstrates you know where the bodies are.

---

Next: **[10 — Interview Q&A](./10-QA.md)**
