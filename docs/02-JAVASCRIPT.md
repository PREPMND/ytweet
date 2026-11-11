# 2 — The JavaScript This Project Depends On

> Language-level concepts, each anchored to real code in this repo.
> If you can explain every section here from the code, you can handle a
> JavaScript interview round.

---

## 2.1 ES modules: imports are hoisted and evaluated first

This caused the single most confusing bug in the codebase.

```js
// back/src/index.js — THE ORIGINAL, BROKEN
import dotenv from "dotenv";
import { connectRedis } from "./redis/redis.js";   // ← evaluated NOW

dotenv.config({ path: "./.env" });                 // ← runs LATER
```

```js
// back/src/redis/redis.js
const client = createClient({ url: process.env.REDIS_URL });  // undefined!
```

### Why

An ES module is processed in three phases:

1. **Construction** — parse, resolve every `import` specifier, fetch the files.
2. **Instantiation** — allocate the bindings, wire exports to imports.
3. **Evaluation** — run the module bodies, **in depth-first post-order**.

Crucially, *every imported module body runs to completion before a single
statement of the importing module runs*. Imports are not statements that
execute in place. They are declarations, hoisted like `function`.

So the real order was:

```
redis.js body     → process.env.REDIS_URL is undefined → localhost:6379
app.js body       → cors({ origin: undefined })
cloudinary.js     → cloudinary.config({ cloud_name: undefined })
index.js body     → dotenv.config()      ← far too late
```

The symptom: `ECONNREFUSED 127.0.0.1:6379` even though `REDIS_URL` pointed at
Upstash. `createClient` defaults to localhost when `url` is `undefined`.

### The fix

Put `dotenv.config()` in its own module and import it **first**. Module bodies
evaluate in source order, so this is deterministic:

```js
// back/src/index.js — FIXED
import env, { assertRequiredEnv } from "./env.js";   // dotenv runs here
import { MongoConnection } from "./db/index.js";
import { connectRedis } from "./redis/redis.js";     // env is populated now
```

### Why CommonJS didn't have this problem

```js
const dotenv = require("dotenv");
dotenv.config();                       // runs HERE
const redis = require("./redis.js");   // runs AFTER
```

`require()` is a *function call* — synchronous, in place. `import` is a static
declaration resolved before execution. This is the difference that lets ESM do
tree-shaking and circular-import resolution, and it is the difference that bit
us.

**Interview answer:** "ESM imports are hoisted and the dependency graph is
evaluated depth-first before the importing module's body. So any module that
reads `process.env` at the top level sees it before `dotenv.config()` runs
unless you load dotenv in a module that is imported first — or use
`node --env-file` / `node -r dotenv/config`."

---

## 2.2 Optional chaining stops at the `?.`, not after it

```js
// BROKEN — back/src/controllers/user.controller.js
const avatarLocalPath     = req.files?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverImage[0]?.path;
```

`?.` only guards the link it sits on. `req.files?.avatar` is safe, but the
`[0]` that follows is **not**. Cover image is optional, so registering without
one threw:

```
TypeError: Cannot read properties of undefined (reading '0')
```

...a 500 on a perfectly valid request.

```js
// FIXED
const avatarLocalPath     = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
```

### Short-circuiting

When the left side is `null`/`undefined`, the **whole chain** short-circuits to
`undefined` — the rest is never evaluated:

```js
data?.user.avatar
// data == null      → undefined        (`.user.avatar` skipped entirely)
// data = {user:null} → TypeError!       (data is fine, so `.user` evaluates)
```

That second case is exactly why the navbar crashed for a user whose session
had half-expired, and why it now reads `data?.user?.avatar`.

---

## 2.3 `??` vs `||`

```js
// back/src/middlewares/cache.middleware.js
`user:${req.user?._id ?? "public"}`
```

| | falls back on |
|---|---|
| `\|\|` | every falsy value: `0`, `""`, `false`, `NaN`, `null`, `undefined` |
| `??` | only `null` and `undefined` |

The bug this prevents, straight from the practice code:

```js
if (minViews) filter.views.$gte = Number(minViews);   // ?minViews=0 ignored!
```

`0` is falsy, so "at least 0 views" silently disappeared. For numeric query
parameters the test must be `!== undefined`:

```js
if (minViews !== undefined) filter.views.$gte = Number(minViews);
```

`??` cannot be mixed with `&&`/`||` without parentheses — that is a syntax
error by design, because the precedence would be ambiguous.

---

## 2.4 Closures — what the rate limiter and the cache middleware are

```js
// back/src/middlewares/ratelimiter.middleware.js
export const rateLimiter = ({ limit = 30, windowSeconds = 20 } = {}) => {
    return async (req, res, next) => {
        //     ↑ this inner function still sees `limit` and `windowSeconds`
        //       after rateLimiter() has already returned
    };
};

export const rateLimit     = rateLimiter();
export const authRateLimit = rateLimiter({ limit: 10, windowSeconds: 60 });
```

A **closure** is a function plus the lexical environment it was created in.
`rateLimit` and `authRateLimit` are two separate function objects, each
holding its own captured `limit`. This is the standard "middleware factory"
pattern — `cache(300)` and `validatePagination({ maxLimit: 24 })` are the
same idea.

Note `= {}` on the parameter: without it, calling `rateLimiter()` with no
argument would destructure `undefined` and throw.

### The classic closure interview question

```js
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0);  // 3 3 3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0);  // 0 1 2
```

`var` is function-scoped: one binding, shared by all three closures, read
after the loop finished. `let` is block-scoped and the spec re-binds it per
iteration, so each closure captures its own `i`.

React's stale-closure bugs are this exact mechanism — see part 5.

---

## 2.5 `this` and why arrow functions break Mongoose hooks

```js
// back/src/models/user.models.js
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;      // `this` = the document
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
```

These **must** be `function` declarations. An arrow function has no `this` of
its own — it closes over the `this` of the enclosing scope, which at module
level is `undefined` in ESM. Mongoose calls the hook with the document as
`this`, and an arrow function ignores that entirely.

`this` is determined by **how a function is called**:

| Call form | `this` |
|---|---|
| `obj.fn()` | `obj` |
| `fn()` | `undefined` (strict / ESM) |
| `fn.call(x)` / `.apply` / `.bind(x)` | `x` |
| `new Fn()` | the new instance |
| arrow | lexical — inherited, never rebindable |

---

## 2.6 Promises, async/await, and the two "swallowed error" bugs

### `Promise.all` vs `Promise.allSettled`

```js
// back/src/controllers/video.controller.js — two independent queries
const [videos, total] = await Promise.all([
    Video.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
    Video.countDocuments(filter),
]);
```

Running them sequentially would take `t1 + t2`. In parallel it is
`max(t1, t2)`. They do not depend on each other, so there is no reason to wait.

`Promise.all` rejects as soon as **any** input rejects. For shutdown, where
each cleanup should be attempted regardless, use `allSettled`:

```js
// back/src/index.js
await Promise.allSettled([disconnectRedis(), MongoDisconnect()]);
```

| | behaviour |
|---|---|
| `all` | first rejection wins; others keep running but are ignored |
| `allSettled` | waits for all; returns `{status, value \| reason}[]` |
| `race` | first to settle, fulfilled or rejected |
| `any` | first to *fulfil*; rejects with `AggregateError` only if all reject |

### Fire-and-forget, deliberately

```js
// A view counter must never slow down or break playback.
Video.updateOne({ _id: video._id }, { $inc: { views: 1 } }).catch(() => {});
```

The `.catch()` is **mandatory**. An unhandled rejection in Node crashes the
process by default from Node 15 onwards. The `void` keyword used elsewhere
(`void indexVideo(videoDoc)`) documents "I am intentionally not awaiting this"
— it does not handle errors, so the function itself must never reject.

### The bug: throwing from a non-wrapped async handler

```js
// BROKEN — this route HUNG instead of erroring
export const PracticeVideo = async (req, res) => {
    try { /* ... */ }
    catch (error) { throw new apiError(400, "Could'nt fetch"); }
};
```

Express 4 does not understand promises. When an `async` handler rejects,
Express never sees it: no response is sent, the socket stays open, and the
client waits until it times out. Meanwhile Node logs an unhandled rejection.

The fix is one word — wrap it:

```js
export const PracticeVideo = asyncHandler(async (req, res) => { ... });
```

### The other bug: `catch` that destroys the error

```js
catch (error) {
    throw new apiError(401, "The buildVideoQuery helper went through an error");
}
```

The original error — a `CastError`, a timeout, a typo — is gone. Production
gives you a meaningless 401 and no stack. Either let it propagate, or attach
the cause:

```js
catch (error) {
    throw new apiError(500, `Query build failed: ${error.message}`, [], error.stack);
}
```

---

## 2.7 The event loop (and why ordering questions get asked)

```js
console.log("1");
setTimeout(() => console.log("2"), 0);     // macrotask
Promise.resolve().then(() => console.log("3"));  // microtask
queueMicrotask(() => console.log("4"));
console.log("5");
// 1 5 3 4 2
```

The rule: **the entire microtask queue is drained between every macrotask.**
Promise callbacks, `queueMicrotask` and `process.nextTick` are microtasks;
timers, I/O and `setImmediate` are macrotasks.

Node's phases, in order: timers → pending callbacks → poll → check
(`setImmediate`) → close callbacks. `process.nextTick` jumps the queue ahead of
promises.

Practical consequence for this codebase: a long synchronous loop (a huge
`JSON.stringify`, an unbounded `Video.find()` with no `.limit()`) blocks the
*entire* server — Node is single-threaded for JavaScript. That is why the
`Trending` endpoint returning the whole collection was a real availability
risk, not just a slow query.

---

## 2.8 Spread, rest, and shallow copies

```js
// Adding a derived field without mutating the source document
videos.docs = videos.docs.map((v) => ({
    ...v,
    durationFormatted: formatDuration(v.duration),
}));
```

`...` copies **one level**. Nested objects are shared by reference:

```js
const a = { user: { name: "x" } };
const b = { ...a };
b.user.name = "y";
a.user.name;        // "y"  — same object!
```

For a real deep copy use `structuredClone(a)` (built into Node 17+ and modern
browsers).

This matters in React: `setState({ ...state })` only triggers a re-render if
the top-level reference changes, and only propagates a nested change if you
copy that level too.

```js
// frontend — correct nested update
setLoadedThumbs((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
//                        ↑ returning the SAME reference skips the re-render
```

That guard is deliberate: returning `prev` unchanged tells React nothing
happened, avoiding an infinite render loop from the `ref` callback.

---

## 2.9 `Object.hasOwn` and the mass-assignment fix

```js
// back/src/controllers/video.controller.js
const UPDATABLE_FIELDS = ["title", "description", "isPublished"];

for (const field of UPDATABLE_FIELDS) {
    if (Object.hasOwn(req.body, field) && req.body[field] !== undefined) {
        video[field] = req.body[field];
    }
}
```

This replaced `Object.assign(video, req.body)`, which let a client send
`{"views": 999999, "owner": "<someone else>"}` and have it written.

`Object.hasOwn(obj, key)` is the modern replacement for
`Object.prototype.hasOwnProperty.call(obj, key)`. Plain `obj.hasOwnProperty(k)`
is unsafe because an object can be created with `Object.create(null)` (no
prototype, so no method) or can have `hasOwnProperty` overwritten by an
attacker-controlled key.

It also beats `key in obj`, which walks the prototype chain — so
`"toString" in {}` is `true`.

---

## 2.10 Regex injection — user input is not a pattern

```js
// BROKEN
{ title: { $regex: search, $options: "i" } }
```

A user typing `(((((` makes Mongo throw. A user typing `.*` or
`(a+)+$` turns the query into a full collection scan or a catastrophic
backtracking hang (ReDoS).

```js
// FIXED
function escapeRegex(value = "") {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
```

`$&` in a replacement string means "the whole match", so each metacharacter is
prefixed with a backslash. Same principle as SQL parameterisation: **never
concatenate user input into a language you then execute.**

---

## 2.11 `Intl` — formatting without a date library

```js
// frontend/src/utils/format.jsx
new Intl.NumberFormat(undefined, { notation: "compact" }).format(1234);  // "1.2K"
new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
    .format(-3, "hour");                                                  // "3 hours ago"
```

Built into every modern browser and into Node. Zero bundle cost, and it
follows the user's locale automatically. Reaching for `moment` (290 kB) or
even `date-fns` to render "3 hours ago" is a bundle-size answer worth having
ready.

`undefined` as the first argument means "use the runtime's default locale" —
better than hardcoding `"en-US"`.

---

## 2.12 Labelled quick-reference

| Concept | Where in this repo |
|---|---|
| ESM hoisting | `back/src/env.js`, `index.js` |
| Optional chaining depth | `registerUser`, `navbar.jsx` |
| `??` vs `\|\|` | `cache.middleware.js`, numeric filters |
| Closures / factories | `rateLimiter`, `cache`, `validatePagination` |
| `this` binding | `user.models.js` hooks and methods |
| `Promise.all` / `allSettled` | `video.controller.js`, `index.js` |
| Unhandled rejection | `PracticeVideo` before the fix |
| Event loop | fire-and-forget view counter |
| Shallow copy | `setLoadedThumbs`, `videos.docs.map` |
| `Object.hasOwn` | `updateVideo` whitelist |
| Regex escaping | `escapeRegex` in `video.controller.js` |
| `Intl` | `utils/format.jsx` |

---

Next: **[03 — Node & Express](./03-NODE-EXPRESS.md)**
