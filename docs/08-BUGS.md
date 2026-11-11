# 8 — Every Bug, Explained

Each entry: what it was, why it happened, the fix, and the transferable
lesson. These make excellent "tell me about a bug you found" answers.

Severity: 🔴 broke a feature outright · 🟠 security/data · 🟡 correctness ·
🔵 performance/UX

---

## Backend

### 🔴 1. `refreshAccessToken` threw on every call

**`back/src/controllers/user.controller.js`**

```js
res.cookie("refreshToken", token, { ... });          // `token` undefined
return res.status(200)
    .cookie("accessToken", accessToken, options)     // `options` undefined
```

Two `ReferenceError`s → 500 on every refresh. Because the axios interceptor
treats a failed refresh as "logged out", **every session silently died the
moment the access token expired.** The README's "persistent login sessions"
never worked.

*Lesson:* ESLint's `no-undef` catches this for free. The project has ESLint
configured for the frontend but it was never run against the backend.

---

### 🔴 2. `dotenv.config()` ran after every module had already read `process.env`

**`back/src/index.js`**

ESM imports are hoisted and evaluated before the importing module's body (see
§2.1). So `redis.js`, `app.js` and `cloudinary.js` all read `process.env` while
it was still empty:

- Redis connected to `localhost:6379` instead of Upstash → `ECONNREFUSED`
- `cors({ origin: undefined })` → no `Access-Control-Allow-Origin` header
- `cloudinary.config({ cloud_name: undefined })` → uploads broken

*Fix:* `back/src/env.js`, imported first.
*Lesson:* `import` is a hoisted declaration, not an in-place statement.

---

### 🔴 3. `updateUserAvatar` / `updateUserCoverImage` always returned 400

```js
const avatarLocalPath = req.files?.path;     // ❌ always undefined
```

`multer.single(name)` populates **`req.file`**; only `.fields()`/`.array()`
populate `req.files`. The endpoint could never succeed.

*Lesson:* `.single` → `req.file`. `.fields`/`.array` → `req.files`.

---

### 🔴 4. `getUserChannelProfile` read `req.body` on a GET route

```js
const { username } = req.body;     // route is GET /c/:username
```

GET requests have no body → always 404. *Fix:* accept `req.params.username`
with the body as a fallback.

---

### 🔴 5. `getWatchHistory`: `pipeline` must be an array

```js
pipeline: { $lookup: { ... } }     // ❌ object where an array is required
```

Plus `user[0].watchhistory` with no guard (crash when the aggregation returned
nothing) and a case mismatch against the `as:` alias.

---

### 🔴 6. Unreachable + non-functional socket routes

```js
routerSocket.get("/:receiverId", getMessages);
routerSocket.get("/generateConvoId", getConversationId);   // never reached
```

Express matches in order, so `/:receiverId` swallowed it. And
`getConversationId` was `(user1, user2) => string` — a utility, not a handler.
Called as `(req, res)` it returned a string and never responded, hanging the
request.

*Lesson:* static routes before dynamic ones; a handler must call
`res`/`next`, never just return.

---

### 🔴 7. `PracticeVideo` / `Trending` hung instead of erroring

Plain `async` handlers that `throw` inside `catch`. Express 4 cannot see a
rejected promise, so no response was ever sent. The navbar typeahead hits
`Trending`, so any error meant a hung request per keystroke.

*Fix:* wrap in `asyncHandler`.

---

### 🟠 8. Mass assignment in `updateVideo`

```js
Object.assign(video, req.body);
await video.save();
```

A client could send `{"views": 999999}`, `{"owner": "<another user>"}` or
`{"_id": ...}`. *Fix:* an explicit `UPDATABLE_FIELDS` whitelist.

*Lesson:* never spread a request body onto a model. Whitelist, never blacklist.

---

### 🟠 9. Unescaped user input in `$regex`

```js
{ title: { $regex: search, $options: "i" } }
```

`(((((` throws; `.*` or `(a+)+$` causes a full scan or catastrophic
backtracking (ReDoS). *Fix:* `escapeRegex()`.

---

### 🟠 10. Upload filenames were attacker-controlled and collided

```js
filename: (req, file, cb) => cb(null, file.originalname)
destination: (req, file, cb) => cb(null, "./public")
```

Two simultaneous `video.mp4` uploads overwrote each other, `../` in a name
could escape the directory, and `./public` was being served by
`express.static`. *Fix:* random names, a non-served `tmp/uploads`, a MIME
allow-list and a size cap.

---

### 🟠 11. Login leaked which accounts exist

"User Not Found, you may register" vs "Invalid Password" lets anyone
enumerate users. *Fix:* identical 401 + "Invalid credentials" for both.

---

### 🟠 12. `{ email: undefined }` in the login query

`findOne({ $or: [{ email: undefined }, { username }] })` — MongoDB reads
`{field: undefined}` as "field does not exist", which can match an unintended
document. *Fix:* build `$or` from present values only.

---

### 🟡 13. `apiError` destroyed every stack trace

```js
constructor(..., stack = " ") { if (stack) this.stack = stack; }
```

`" "` is truthy. **Every error in the app** had its stack replaced with a
space. *Fix:* default to `undefined`.

---

### 🟡 14. `getVideoById` dereferenced before the null check

```js
video.durationFormatted = formatDuration(video.duration);
if (!video) return res.status(404)...      // ← too late
```

Any missing id threw "Cannot set property of null" → 500 instead of 404. (It
was also a no-op: assigning an arbitrary property to a Mongoose document
without `toObject()` does nothing.)

---

### 🟡 15. `DBNAME` was silently ignored

`${MONGODB_URL}/${DBNAME}` appended the name after the query string. The
driver used its default database, `test`. *Fix:* `{ dbName }` as an option,
keeping `test` so no data was orphaned.

---

### 🟡 16. SocketConn wrote to a different database

It connected with no `dbName`, so presence updates could land in a different
database from the one the API reads. *Fix:* same `dbName` on both.

---

### 🟡 17. Duplicate subscriptions

No unique index, and a check-then-insert race. Two fast clicks created two
documents and the subscriber count was permanently wrong. *Fix:* unique
compound index + handle error `11000`.

---

### 🟡 18. `searchElastic` referenced an unimported variable

Guaranteed `ReferenceError`. *Fix:* import it, and fall back to Mongo when
Elasticsearch is absent.

---

### 🟡 19. `validatePagination` produced a string status code

```js
next(new apiError(`${error.status}`, ...));   // "undefined"
```

Status codes must be numbers; this fell through to 500 with a nonsense
message. The middleware was also never actually mounted on any route.

---

### 🔵 20. Redis could take the whole API down

`await connectRedis()` at boot threw on any Redis problem. *Fix:* never
throws, in-memory fallback, `/health` reports the mode.

---

### 🔵 21. The cache blocked responses and cached errors

`res.json` was replaced with an `async` function that awaited Redis **before**
sending, and it cached 4xx/5xx bodies for the full TTL. *Fix:* respond first,
cache after, success only.

---

### 🔵 22. `Trending` returned the entire collection

The comment said "pagination, sort by views"; the code was `Video.find(filter)`
with no `.limit()`. The navbar typeahead called it on every search.

---

### 🔵 23. No `views` increment and no watch history

Both fields existed in the schema and were never written. Every video showed
"0 views" forever.

---

### 🔵 24. Unstable sort + skip/limit

An unrecognised `?sort=` gave `{}` — natural order, which MongoDB does not
guarantee between queries. Rows could duplicate or disappear across pages.

---

### 🔵 25. Cloudinary assets were never deleted

Deleting a video removed the document but left the video and thumbnail in
Cloudinary forever. Same for replaced avatars (the code literally said
`//todo delete old image`).

---

### 🔵 26. `SIGTERM` was not handled

Only `SIGINT`, and it called `process.exit()` immediately. Docker, Kubernetes
and Render all send `SIGTERM` — so every deploy killed in-flight requests.

---

## Frontend

### 🔴 27. `searchUsers` was called but never defined

`pages/searchIndv.jsx` called `searchUsers(query)` with no import and no such
function anywhere. `ReferenceError` on the first keystroke. *Fix:* added
`GET /users/search` and wired it up.

---

### 🔴 28. `videos.map is not a function` blanked the watch page

`/videos/any` returned a paginated envelope while the page expected a bare
array. With no error boundary, this unmounted the **entire** React tree →
blank white screen. *Fix:* accept both shapes, always hand `setVideos` an
array, and add an `ErrorBoundary`.

---

### 🔴 29. Every page except `/` had no navigation

Only `/` was inside `MainLayout`. Open a video and there was no way back
except the browser button. *Fix:* restructured the route tree — app pages
under `MainLayout`, only `/login`, `/register` and the full-screen chat bare.

---

### 🟠 30. Passwords rendered in plain text

`type='text'` on the password field in both login and register. Visible to
anyone looking at the screen, and no password manager would offer to save it.

---

### 🟠 31. Protected pages rendered for signed-out users

Every request inside them 401'd, leaving a blank screen and a console full of
errors — or a hard `window.location` redirect that threw away app state.
*Fix:* a `<Protected>` gate that toasts and shows a "Log in" panel.

---

### 🔵 32. 1.2 MB JS bundle from two never-rendered imports

```js
import Aurora from "../assets/aurora.jsx";         // → ogl
import { GridScan } from "../assets/gridscan.jsx"; // → three, face-api, postprocessing
```

A static `import` bundles the module whether or not you use the binding.
Roughly 600 kB downloaded by every visitor for components that were never on
screen.

**330 kB gzip → 78 kB gzip**, combined with route-level `React.lazy`.

---

### 🔵 33. Search fired a request per keystroke

No debounce → 429 after about ten characters. *Fix:* 350 ms debounce +
`placeholderData` so the dropdown does not flash empty.

---

### 🔵 34. Infinite scroll watched the wrong element

`ref={loadMoreRef}` on every card; a ref holds one value, and reassigning
`.current` does not re-run the observer effect. *Fix:* one sentinel below the
grid.

---

### 🔵 35. Thumbnail pop-in while scrolling

Three causes: `fetchPriority="low"` deprioritised every thumbnail; the `<img>`
was unmounted and remounted by the hover preview, forcing a re-decode; and
there was no placeholder. *Fix:* drop `fetchPriority`, keep the image mounted
and layer the video over it, fade in over a shimmer.

---

### 🔵 36. Cached images stayed invisible

`onLoad` can fire **before** React attaches the handler for a cached image, so
the element stayed at `opacity-0` forever. *Fix:* a `ref` callback checking
`complete && naturalWidth > 0`, plus `onError`.

---

### 🔵 37. Layout shift in the feed grid

Grid rows size to their tallest item, so a short title made its card shorter
and the row shifted as data arrived. *Fix:* fixed-height meta block with the
views/age row pinned, and a skeleton of identical height.

---

### 🔵 38. A "Please log in" modal every 5 minutes

A `setInterval` nagged anonymous visitors forever. The feed is public. *Fix:*
prompt on an actual 401, and only if there *was* a session.

---

### 🔵 39. ~90 redundant requests per page for anonymous visitors

Every page calls `/currentuser` → 401 → refresh → 401 → repeat on every
navigation. *Fix:* a 30-second circuit breaker, cleared on login.

---

### 🔵 40. Stale `currentUser` cache after login

`staleTime: 60s` meant the cached *signed-out* result was still served after a
successful login, so the navbar and `Protected` still thought nobody was
logged in. *Fix:* `invalidateQueries(["currentUser"])` before navigating.

---

### 🔵 41. Persisted theme pointed at a 404

The chat wallpaper was persisted as an **asset URL**, and Vite fingerprints
asset URLs per build. *Fix:* validate against the themes that currently exist
and fall back.

---

### 🔵 42. `JSON.parse` in a `useState` initialiser

`JSON.parse("undefined")` throws, and a throw in a state initialiser blanks
the whole app. `localStorage` itself also throws in private mode. *Fix:*
try/catch both.

---

### 🔵 43. Menu actions were `console.log` stubs

"Watch later", "Share", "Not interested", "Report" all logged and did nothing.
*Fix:* real `watchLater` / `notInterested` persistence, a Saved page, native
share with a clipboard fallback, and honest messaging for playlists (which
need a schema that does not exist yet).

---

### 🔵 44. Unreadable text in dark mode

Tailwind's preflight sets `color: inherit` on form controls, so adding
`body { color: var(--text) }` made the login inputs white-on-white. The
create-video page hardcoded `text-neutral-800` on a container that sits on
black, and its buttons had no text colour at all. *Fix:* explicit colours on
always-light cards, theme-aware classes everywhere else.

---

### 🔵 45. `useEffectEvent` imported from stable React

Experimental, not exported — silently `undefined` because React is CJS and
Vite's interop does not throw on a missing named export.

---

### 🔵 46. Dead files and duplicated CSS

Four empty `.jsx` files; two `input[type="file"]` blocks where the second
silently overrode the first; the login background is a **4.1 MB JPEG**
(still outstanding — see part 9).

---

## The pattern

Most of these fall into five buckets:

1. **Evaluation order** — ESM hoisting, route order, null check after use.
2. **Wrong API shape** — `req.file` vs `req.files`, body vs params, object vs
   array, array vs envelope.
3. **Missing validation** — regex, mass assignment, filenames, sort values.
4. **Error paths never exercised** — the refresh endpoint, every `catch` that
   threw from an unwrapped async handler.
5. **Fire-and-forget without a fallback** — Redis, Cloudinary cleanup, caches
   that were never invalidated.

Bucket 4 is the one worth internalising: **the happy path was tested by hand
and the error paths never were.** A single integration test hitting
`/refreshtoken` would have caught the worst bug in the repository.

---

Next: **[09 — Design decisions](./09-DESIGN-DECISIONS.md)**
