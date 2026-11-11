# 6 — Authentication

This is the area with the highest density of interview questions, and it
contained the single worst bug in the repository.

---

## 6.1 Password hashing

```js
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
```

### Hashing vs encryption

**Encryption is reversible; hashing is not.** You never need the original
password back — you only need to check a candidate. So hashing is correct, and
"we encrypt passwords" is a red flag in an interview answer.

### Why bcrypt and not SHA-256

SHA-256 is designed to be *fast* — billions of guesses per second on a GPU.
bcrypt is deliberately **slow and tunable**:

- **Cost factor 10** = 2¹⁰ = 1024 internal iterations. Each +1 doubles the
  work. ~100 ms per hash is the usual target: unnoticeable at login, brutal
  for an attacker.
- **Salt is automatic and per-user**, embedded in the output string:

```
$2b$10$N9qo8uLOickgx2ZMRZoMye  IjZAgcfl7p92ldGxad68LJZdL17lhWy
│   │  └── 22-char salt ──────┘  └────────── hash ───────────┘
│   └───── cost 10
└───────── algorithm
```

A per-user salt means two users with the same password get different hashes,
and a precomputed rainbow table is worthless.

- **Argon2id** is the modern recommendation (memory-hard, so it also resists
  GPU/ASIC attacks). bcrypt remains perfectly acceptable; scrypt is a third
  option. Never SHA/MD5 alone.

### Timing attacks

`bcrypt.compare` is constant-time for a given hash. But note this in the
login controller:

```js
if (!user)             throw new apiError(401, "Invalid credentials");
if (!isPasswordValid)  throw new apiError(401, "Invalid credentials");
```

**Same status, same message.** The original said "User Not Found, you may
register" vs "Invalid Password" — which lets anyone enumerate who has an
account. A fully rigorous implementation would also hash a dummy password when
the user doesn't exist, so the *response time* doesn't leak it either.

---

## 6.2 Access and refresh tokens

```js
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this.id, username: this.username, email: this.email, fullName: this.fullName },
        process.env.ACCESS_TOKEN_SECURITY,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this.id }, process.env.REFRESH_TOKEN_SECURITY,
                    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
};
```

| | access | refresh |
|---|---|---|
| lifetime | short (1 day here; 15 min is more typical) | long (10 days) |
| payload | id + profile fields | **id only** |
| stored server-side | no | **yes**, on the user document |
| sent with | every request | only to `/refreshtoken` |

### Why two tokens at all

A JWT cannot be revoked — it is valid until it expires, because verification
is pure signature maths with no database lookup. That is the whole point (it
scales horizontally) and also the whole problem.

The compromise: make the *unrevocable* token short-lived, and gate renewal
behind a long-lived token that **is** checked against the database:

```js
if (incomingRefreshToken !== user.refreshToken) {
    throw new apiError(401, "Refresh token is expired or already used");
}
```

Logging out sets `$unset: { refreshToken: 1 }`, so the refresh token dies
immediately. The access token survives at most one more expiry window.

### Why the refresh payload is id-only

Payload is **base64-encoded, not encrypted** — anyone with the token can read
it. Put nothing sensitive in it, and keep it small since it travels on every
request.

```js
atob("eyJfaWQiOiI2YWY0..."); // → {"_id":"6af4...","username":"demouser",...}
```

### Rotation

Every successful refresh issues a **new** refresh token and overwrites the
stored one. A stolen token is therefore single-use — and if both the attacker
and the real user try to use it, the second one fails. (A production system
would go further and treat that reuse as a signal to invalidate the entire
token family.)

---

## 6.3 THE critical bug: `refreshAccessToken` was dead on arrival

```js
// BROKEN — back/src/controllers/user.controller.js
const refreshAccessToken = asyncHandler(async (req, res) => {
    // ...
    res.cookie("refreshToken", token, {        // ← `token` is NOT DEFINED
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)   // ← `options` is NOT DEFINED
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(200, {}, "access token refreshed"));
});
```

Two `ReferenceError`s. **Every single call threw a 500.**

### The downstream effect

The frontend interceptor treats a failed refresh as "you are logged out":

```js
catch (refreshError) {
    window.dispatchEvent(new Event("logout"));
}
```

So the moment an access token expired, the user was silently logged out and
bounced to `/login` — with no error anyone could interpret. The "persistent
login sessions" feature in the README did not work at all.

### Verifying the fix

```bash
curl -c ck -X POST localhost:8000/api/v1/users/login \
     -H "Content-Type: application/json" \
     -d '{"username":"demouser","password":"demo1234"}'
```

```bash
curl -b ck -c ck -X POST localhost:8000/api/v1/users/refreshtoken
```

```json
{"statusCode":200,"data":{},"message":"Access token refreshed","success":true}
```

**Lesson:** this is what a linter catches for free. `no-undef` would have
flagged both identifiers before the code ever ran. The project has ESLint
configured but it was clearly never run against the backend.

---

## 6.4 Cookies

```js
// back/src/utils/cookies.js
const base = {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    path: "/",
};

export const accessCookieOptions  = { ...base, maxAge: 1  * DAY };
export const refreshCookieOptions = { ...base, maxAge: 10 * DAY };
export const clearCookieOptions   = { ...base };
```

| Flag | Why |
|---|---|
| `httpOnly` | JavaScript cannot read it → blunts XSS token theft |
| `secure` | HTTPS only. **Must be false on `http://localhost`** or the browser silently drops it |
| `sameSite` | CSRF control (below) |
| `maxAge` | matched to token lifetime, so cookie and JWT expire together |
| `path: "/"` | must match on `clearCookie` or logout silently fails |

### `sameSite` in detail

| Value | Sent on cross-site requests? |
|---|---|
| `strict` | never — even following a link from another site |
| `lax` | only on top-level GET navigations |
| `none` | always — **requires `secure: true`** |

Production runs the API on Render and the SPA on Netlify: different sites, so
`none` + `secure` is mandatory. Locally both are `localhost`, so `lax` works
and avoids the `secure` requirement over plain HTTP. Getting this wrong is the
classic "works locally, broken in production" auth bug.

### Why `clearCookieOptions` exists separately

`clearCookie` only removes a cookie if `path`, `domain`, `secure` and
`sameSite` **match what was set**. A mismatch means logout appears to succeed
and the cookie is still there. Deriving all three option sets from one `base`
object makes that impossible to get wrong.

### Cookies vs `localStorage` for JWTs

| | cookie (`httpOnly`) | `localStorage` |
|---|---|---|
| XSS can read it | **no** | **yes** — one injected script takes everything |
| CSRF risk | yes → mitigated by `sameSite` | no |
| sent automatically | yes | no, you attach it manually |

Cookies are the better default: XSS is more common than CSRF, and `sameSite`
is a one-line CSRF mitigation whereas there is no mitigation for "a script can
read your token".

---

## 6.5 `verifyJWT` and `optionalJWT`

```js
export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = readToken(req);
    if (!token) throw new apiError(401, "Unauthorized request");

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        const message = error?.name === "TokenExpiredError"
            ? "Access token expired" : "Invalid access token";
        throw new apiError(401, message);
    }

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    if (!user) throw new apiError(401, "Invalid access token");

    req.user = user;
    next();
});
```

Points worth making:

- **`jwt.verify`, never `jwt.decode`.** `decode` does not check the signature —
  an attacker can forge any payload.
- Distinguishing `TokenExpiredError` from a tampered token makes the network
  tab readable and tells the client whether a refresh is worth attempting.
- `.select("-password -refreshToken")` — `req.user` is passed around and
  serialised into responses; the password hash must never ride along.
- The database lookup on every request is the cost of being able to revoke. A
  higher-scale system would cache it in Redis with a short TTL.

```js
export const optionalJWT = asyncHandler(async (req, res, next) => {
    const token = readToken(req);
    if (!token) return next();
    try { /* attach req.user if valid */ } catch { /* ignore */ }
    next();
});
```

Used for pages that render for everyone but show more when signed in — the
channel page needs `isSubscribed`, and the watch page records watch history
only if it knows who you are. Previously `/c/:username` required auth, so
anonymous visitors could not view a channel at all.

---

## 6.6 Other auth bugs that were fixed

### Query-object injection in login

```js
const user = await User.findOne({ $or: [{ email }, { username }] });   // ❌
```

If the client posts only `username`, then `email` is `undefined` and the
filter becomes `{ $or: [ { email: undefined }, { username: "x" } ] }`.
MongoDB treats `{ field: undefined }` as "field does not exist" — so this can
match an unrelated document that happens to have no `email`.

```js
// ✅ build the $or from present values only
const or = [];
if (email?.trim())    or.push({ email: email.trim().toLowerCase() });
if (username?.trim()) or.push({ username: username.trim().toLowerCase() });
```

Note also the normalisation: the schema stores `lowercase: true`, so a lookup
with the raw input would miss `"DemoUser"`.

### `getUserChannelProfile` read the wrong place

```js
const { username } = req.body;        // ❌ route is GET /c/:username
```

A GET request has no body, so this **always** 404'd. Now it accepts both:

```js
const username = (req.params.username ?? req.body?.username ?? "").trim().toLowerCase();
```

### Avatar upload always returned 400

```js
const avatarLocalPath = req.files?.path;    // ❌
```

multer's `.single(name)` populates **`req.file`** (singular). `.fields()` and
`.array()` populate `req.files`. The route uses `.single("avatar")`, so
`req.files` was always `undefined` and the endpoint could never succeed.

```js
const localPath = req.file?.path;           // ✅
```

### Rate limiting the credential endpoints

```js
export const rateLimit     = rateLimiter();                              // 30 / 20s
export const authRateLimit = rateLimiter({ limit: 10, windowSeconds: 60 });

router.route("/login").post(authRateLimit, loginUser);
router.route("/register").post(authRateLimit, ...);
```

Login and register get a tighter budget than ordinary reads — this is the
brute-force surface. A production system would additionally lock per-account
after N failures, not just per-IP, since an attacker can rotate IPs.

---

## 6.7 The full flow, end to end

```
REGISTER
  validate → check existing → upload avatar → User.create
  → pre("save") hashes the password
  → issue access + refresh, set both cookies, 201
    (new: the user is logged in immediately instead of bounced to /login)

LOGIN
  find by email OR username → bcrypt.compare
  → issue access + refresh → store refresh on the user → set cookies

AUTHENTICATED REQUEST
  cookie → verifyJWT → jwt.verify → User.findById → req.user → handler

ACCESS TOKEN EXPIRES
  any request → 401
  → axios interceptor → single-flight POST /refreshtoken
  → verify refresh signature → compare against the stored one
  → issue a NEW pair (rotation) → retry the original request
  → on failure: trip the circuit breaker, emit "logout"

LOGOUT
  $unset refreshToken  (refresh dies now)
  clearCookie ×2 with matching options
  → frontend clears the ["currentUser"] cache
```

---

Next: **[07 — Caching, scale & realtime](./07-SCALE.md)**
