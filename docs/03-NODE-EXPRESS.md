# 3 — Node & Express

---

## 3.1 `asyncHandler` — the single most important 6 lines

```js
// back/src/utils/asyncHandler.js
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    };
};
```

### The problem it solves

Express 4's router wraps each handler in a `try/catch`. That catches
**synchronous** throws only:

```js
app.get("/a", (req, res) => { throw new Error("caught"); });          // ✅ 500
app.get("/b", async (req, res) => { throw new Error("NOT caught"); }); // ❌ hangs
```

An `async` function never throws to its caller — it returns a rejected
promise. Express ignores the return value, so the rejection is unobserved: no
response is ever sent, the connection hangs until the client times out, and
Node logs `UnhandledPromiseRejection`.

### How the wrapper fixes it

`Promise.resolve(x)` normalises *anything* into a promise. `.catch(next)`
forwards the rejection into Express's error pipeline, where the global error
handler turns it into a JSON response.

`Promise.resolve` rather than just `.catch` on the call matters: it works
whether the handler is `async`, returns a promise, or returns nothing at all.

### Express 5 note

Express 5 (which this project uses — `"express": "^5.2.1"`) forwards rejected
promises to `next` automatically. So `asyncHandler` is now belt-and-braces
rather than strictly required. **Say this in an interview** — knowing *why* it
existed and that v5 changed it is the interesting part.

### The bug it would have prevented

```js
// BROKEN: plain async, throws inside catch
export const Trending = async (req, res) => {
    try { /* ... */ }
    catch (error) { throw new apiError(401, "Cannot fetch"); }
};
```

The navbar's typeahead hits this route. Any error meant a hung request per
keystroke. One word — `asyncHandler(...)` — fixed it.

---

## 3.2 The error pipeline

```js
// back/src/utils/apiError.js
class apiError extends Error {
    constructor(statusCode, message = "Something Went Wrong", errors = [], stack) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;

        if (stack) this.stack = stack;
        else Error.captureStackTrace(this, this.constructor);
    }
}
```

### The bug in the original

```js
constructor(statusCode, message, errors = [], stack = " ") {   // ← note the space
    ...
    if (stack) { this.stack = stack; }      // " " is TRUTHY
    else { Error.captureStackTrace(...); }
}
```

`" "` is a non-empty string, therefore truthy. **Every error in the entire
application** had its stack trace replaced with a single space. Debugging
anything in production would have been impossible.

Defaulting to `undefined` restores `Error.captureStackTrace`, which also omits
the constructor frame so the trace starts at the actual throw site.

### Error-handling middleware

```js
// back/src/app.js
application.use((err, req, res, next) => { ... });
```

Express identifies an error handler **by arity** — a function with exactly
four parameters. Three parameters makes it ordinary middleware, and your error
handler silently never runs. You cannot drop the unused `next`.

It must also be registered **last**, after all routes, because Express walks
the stack in registration order.

### 404s as errors

```js
application.use((req, res, next) => {
    next(new apiError(404, `Route ${req.method} ${req.originalUrl} not found`));
});
```

A middleware with no path matches everything. Placed after all routes, it only
runs when nothing matched. Routing it through `apiError` means a 404 has the
same response shape as every other failure — the frontend never needs a
special case.

---

## 3.3 Route ordering

```js
// back/src/routes/socket.route.js
routerSocket.get("/convo", getConversations);
routerSocket.get("/conversation-id", getConversationId);
routerSocket.get("/:receiverId", getMessages);   // ← wildcard LAST
```

Express matches **top to bottom, first match wins**. The original had
`/:receiverId` registered before `/generateConvoId`, so `GET /generateConvoId`
was captured by the param route with `receiverId = "generateConvoId"` — the
endpoint was unreachable.

**Rule: static paths before dynamic ones.** React Router v6+ is different — it
*ranks* routes by specificity rather than using source order — but Express is
strictly ordered.

The same file also had:

```js
routerSocket.get("/generateConvoId", getConversationId);
```

where `getConversationId` was `(user1, user2) => ...` — a *utility*, not an
Express handler. Called as `(req, res)` it would compute
`[req, res].sort().join("_")` and return a string. Returning a value from a
handler does nothing; the request hangs forever. Handlers must call
`res.send`/`res.json`/`next`.

---

## 3.4 CORS with credentials

```js
// back/src/app.js
cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true);          // curl, same-origin
        if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
})
```

### The rules you must know

1. `Access-Control-Allow-Origin: *` is **forbidden** with
   `Access-Control-Allow-Credentials: true`. The browser rejects the response.
   So the origin has to be echoed back from an allow-list.
2. The server must send `Access-Control-Allow-Credentials: true`, *and* the
   client must send `withCredentials: true`. Both, or cookies are dropped.
3. Non-simple requests (PATCH, DELETE, JSON content-type, custom headers)
   trigger a **preflight** `OPTIONS`. If preflight fails, the real request is
   never sent.
4. Requests with no `Origin` header (curl, server-to-server, same-origin) are
   not subject to CORS at all.

### What was broken

```js
cors({ origin: process.env.CORS_ORIGIN, credentials: true })
```

Because of the ESM hoisting bug (part 2.1), `process.env.CORS_ORIGIN` was
`undefined` at module-evaluation time. `cors` then produced no
`Access-Control-Allow-Origin` header and every browser request failed.

Verify it from a terminal:

```bash
curl -i -X OPTIONS http://localhost:8000/api/v1/users/login -H "Origin: http://localhost:5173" -H "Access-Control-Request-Method: POST"
```

You want `204` plus `Access-Control-Allow-Origin: http://localhost:5173` and
`Access-Control-Allow-Credentials: true`.

**CORS is enforced by the browser, not the server.** It is not a security
boundary against scripted clients — it protects *users* from other *sites*
reading their authenticated responses.

---

## 3.5 File uploads: multer → Cloudinary → unlink

```js
// back/src/middlewares/multer.middleware.js
filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 10);
    const safeExt = /^\.[a-z0-9]+$/.test(ext) ? ext : "";
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${safeExt}`);
}
```

### Two bugs in the original

```js
filename(req, file, cb) { cb(null, file.originalname); }
destination(req, file, cb) { cb(null, "./public"); }
```

1. **Collisions.** Two users uploading `video.mp4` at the same moment
   overwrite each other. User A gets User B's file.
2. **Path traversal.** `originalname` is attacker-controlled. A name like
   `../../src/app.js` can escape the directory. (Multer sanitises this in
   recent versions, but relying on that is not a defence you want to explain.)

Files also went to `./public`, which `express.static("public")` was serving —
so every upload was briefly a publicly-readable URL on the API host.

### Disk vs memory storage

| | pros | cons |
|---|---|---|
| `diskStorage` | constant memory, handles 200 MB video | needs cleanup, needs disk |
| `memoryStorage` | no cleanup, simple | a 200 MB upload is 200 MB of RAM |

Video uploads mean disk storage is the only sane choice here.

### Guaranteed cleanup with `finally`

```js
// back/src/utils/cloudinary.js
try {
    return await cloudinary.uploader.upload(localfilepath, { resource_type: "auto", folder });
} catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
} finally {
    await removeLocal(localfilepath);     // runs on BOTH paths
}
```

The original called `fs.unlinkSync` in both the `try` and the `catch`. If the
file was already gone, the `catch` block's own unlink threw `ENOENT`, masking
the real upload error. `finally` + a `.catch(() => {})` on the unlink makes
cleanup unconditional and silent.

It also now **throws** instead of returning `null`, so the caller can report
*why* ("Cloudinary not configured") rather than a generic "upload failed".

---

## 3.6 Graceful shutdown

```js
// back/src/index.js
async function shutdown(signal) {
    if (shuttingDown) return;            // SIGINT twice shouldn't double-run
    shuttingDown = true;

    server.close(async () => {           // stop accepting NEW connections,
        await Promise.allSettled([       // let in-flight ones finish
            disconnectRedis(),
            MongoDisconnect(),
        ]);
        process.exit(0);
    });

    setTimeout(() => process.exit(1), 10000).unref();   // hard cap
}

process.on("SIGINT",  () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
```

The original was `process.on("SIGINT", () => process.exit())` — instant exit,
killing in-flight requests and leaving sockets to Mongo and Redis open.

- `server.close(cb)` stops new connections; the callback fires once existing
  ones drain.
- `.unref()` on the timeout means that timer alone will not keep the process
  alive — if everything closes in 200 ms, we exit in 200 ms.
- **SIGTERM is what Docker/Kubernetes/Render send.** Handling only SIGINT
  means your container is `SIGKILL`ed after the grace period.

---

## 3.7 Middleware order in `app.js`

```js
application.use(cors(...));                       // 1 — before anything that can fail
application.use(express.json({ limit: "16kb" })); // 2 — parse JSON bodies
application.use(express.urlencoded({ extended: true, limit: "16kb" }));
application.use(cookieParser());                  // 3 — req.cookies

application.get("/health", ...);                  // 4 — cheap, unauthenticated

application.use("/api/v1/users", router);         // 5 — routes
application.use("/api/v1/videos", routerVideo);
application.use("/api/v1/socket", routerSocket);

application.use(notFoundHandler);                 // 6 — nothing matched
application.use(errorHandler);                    // 7 — four args, LAST
```

Order is semantics, not style:

- **CORS first.** An error thrown before CORS runs produces a response with no
  CORS headers, and the browser reports it as a generic "network error" rather
  than your actual 500.
- **Body parsers before routes**, or `req.body` is `undefined`.
- `limit: "16kb"` caps JSON bodies — the default is 100 kb, and an unbounded
  parser is a trivial memory-exhaustion vector. Files bypass this entirely
  because multer handles `multipart/form-data`.
- `express.static("public")` was **removed**: it was serving the upload temp
  directory.
- `app.set("trust proxy", 1)` was added so `req.ip` is the real client IP
  behind Render's load balancer — otherwise the rate limiter buckets every
  user under the proxy's single IP.

---

## 3.8 Config validation at boot

```js
// back/src/env.js
export function assertRequiredEnv() {
    const required = [
        ["MONGODB_URL", env.MONGODB_URL],
        ["ACCESS_TOKEN_SECURITY", env.ACCESS_TOKEN_SECRET],
        ["REFRESH_TOKEN_SECURITY", env.REFRESH_TOKEN_SECRET],
    ];
    const missing = required.filter(([, v]) => !v).map(([n]) => n);
    if (missing.length) {
        console.error(`[env] Missing required variables: ${missing.join(", ")}`);
        process.exit(1);
    }
}
```

**Fail fast.** Without this, a missing `ACCESS_TOKEN_SECURITY` means
`jwt.sign(payload, undefined)` throws on the *first login attempt* — a 500 in
production, hours after deploy, with a confusing message. Crashing at boot
means the deploy fails and the old version keeps serving.

Note also that only the genuinely-required variables are checked. Redis and
Elasticsearch are optional by design (part 7), so they must not be in this
list.

---

Next: **[04 — MongoDB & Mongoose](./04-MONGODB.md)**
