# 1 — Architecture & Running It

> Part 1 of the SocialSphere / preytweet interview-prep series.
> `01` architecture · `02` JavaScript · `03` Node & Express · `04` MongoDB
> `05` React · `06` Auth · `07` Caching & scale · `08` Every bug, explained
> `09` Design decisions · `10` Interview Q&A

---

## 1.1 What this project actually is

Three deployable units sharing one MongoDB Atlas cluster.

```
                    ┌───────────────────────────────┐
  browser  ────────▶│  frontend  (Vite + React 19)  │   :5173
                    │  SPA, cookies, TanStack Query │
                    └──────────┬────────────┬───────┘
                               │ HTTP       │ WebSocket
                               │ (cookies)  │
                    ┌──────────▼──────┐  ┌──▼──────────────┐
                    │  back  (:8000)  │  │ SocketConn      │  :9000
                    │  Express 5 REST │  │ Socket.IO       │
                    │  JWT, uploads   │  │ presence, typing│
                    └────┬────────┬───┘  └────────┬────────┘
                         │        │               │
              ┌──────────▼──┐  ┌──▼────────┐      │
              │ MongoDB     │◀─┼───────────┼──────┘
              │ Atlas       │  │ Upstash   │
              │ (db: test)  │  │ Redis     │
              └─────────────┘  └───────────┘
                               │ Cloudinary │  ← video / image CDN
                               └────────────┘
```

| Unit | Folder | Port | Responsibility |
|---|---|---|---|
| Frontend | `frontend/` | 5173 | React SPA |
| REST API | `back/` | 8000 | auth, users, videos, message persistence |
| Realtime | `SocketConn/` | 9000 | presence, typing, live delivery |

**The split to be able to defend in an interview:** messages are *written*
through the REST API (so they are validated, rate-limited and durably stored)
and *delivered* through the socket service. The socket layer is a transport,
not a source of truth. If the socket service dies, nothing is lost — the next
`GET /api/v1/socket/:receiverId` still returns every message. That is the
whole reason the two are separate processes.

---

## 1.2 Running it locally

Three terminals.

```bash
cd back && npm run dev
```

```bash
cd SocketConn && npm run dev
```

```bash
cd frontend && npm run dev
```

Then open <http://localhost:5173>.

### Demo account

```
username: demouser
password: demo1234
```

Recreate or reset it any time:

```bash
cd back && node script/seed-test-user.js
```

That script writes straight to Mongo, so it does not need Cloudinary. It
assigns the plaintext password and calls `.save()`, which means the model's
`pre("save")` hook hashes it exactly as a real registration would.

### Health checks

```bash
curl http://localhost:8000/health
```

```bash
curl http://localhost:9000/health
```

The API's `/health` reports whether Mongo is connected and whether Redis is
live or has degraded to the in-memory fallback. That distinction matters: the
API will happily serve traffic with Redis down, and without this endpoint you
would not know you were running uncached.

---

## 1.3 Environment configuration

`back/.env`

| Key | Purpose |
|---|---|
| `PORT` | API port (8000) |
| `CORS_ORIGIN` | comma-separated allow-list |
| `MONGODB_URL` | Atlas connection string |
| `DB_NAME` | database name — defaults to `test` |
| `ACCESS_TOKEN_SECURITY` / `_EXPIRY` | access-JWT signing |
| `REFRESH_TOKEN_SECURITY` / `_EXPIRY` | refresh-JWT signing |
| `CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_SECRET_KEY` | media uploads |
| `REDIS_URL` | Upstash; optional — falls back to memory |
| `ELASTIC_URL` | optional; falls back to Mongo regex search |

`frontend/.env.local` (gitignored, overrides `.env`):

```
VITE_BACKEND=http://localhost:8000
VITE_SOCKET_BACKEND=http://localhost:9000
```

**Why `.env.local` instead of editing `.env`:** Vite loads `.env` then
`.env.local`, and the latter wins. So `.env` can keep pointing at the deployed
Render services for `npm run build`, while local development silently
overrides it. No more commenting lines in and out.

### The `DB_NAME` trap

The original code built the connection string like this:

```js
mongoose.connect(`${process.env.MONGODB_URL}/${DBNAME}`)
```

with `DBNAME = "TEST VERSION"`. But `MONGODB_URL` already ends in a query
string:

```
mongodb://user:pass@host:27017/?ssl=true&replicaSet=...&appName=Cluster0
```

Appending `/TEST VERSION` lands it **after** the `?`, so it became part of the
`appName` parameter. The driver saw an empty path and silently used its
default database, `test`.

So `DBNAME` never did anything, and all the real data lives in `test`. The fix
passes the name as an option instead — and deliberately keeps `test` as the
default so no data is orphaned:

```js
mongoose.connect(env.MONGODB_URL, { dbName: env.DB_NAME })  // DB_NAME = "test"
```

**Interview point:** a connection string is a URI. Concatenating onto a URI
that already has a query string is always a bug. Use the library's options
object, or `new URL()`.

---

## 1.4 Request lifecycle

Walk this end-to-end in an interview; it shows you understand the whole stack.

```
POST /api/v1/videos/createvideo
   │
   ├─▶ cors()                     origin in allow-list? echo it back
   ├─▶ express.json()             (skipped — multipart body)
   ├─▶ cookieParser()             req.cookies.accessToken
   │
   ├─▶ verifyJWT                  jwt.verify → User.findById → req.user
   ├─▶ rateLimit                  INCR rate:user:<id>, EXPIRE 20s
   ├─▶ multer.fields()            stream files → tmp/uploads/<random>
   │
   ├─▶ createVideo controller
   │      ├ validate title/description/files
   │      ├ uploadOnCloudinary ×2  (then always unlink the temp file)
   │      ├ Video.create
   │      ├ indexVideo             (fire-and-forget → Elasticsearch)
   │      └ invalidate("videos:*") (drop cached feed pages)
   │
   ├─▶ res.status(201).json(apiResponse)
   │
   └─▶ (on throw) asyncHandler → next(err) → global error handler
```

Everything after `verifyJWT` can assume `req.user` exists. Everything that
throws lands in one error handler. That uniformity is the point of the
`asyncHandler` + `apiError` pair, and it is covered in part 3.

---

## 1.5 Repository map

```
social/
├─ back/                          REST API
│  ├─ src/
│  │  ├─ env.js                   dotenv bootstrap + validated config
│  │  ├─ index.js                 connect, listen, graceful shutdown
│  │  ├─ app.js                   middleware chain, routes, error handler
│  │  ├─ db/index.js              mongoose.connect
│  │  ├─ redis/redis.js           Redis client + in-memory fallback
│  │  ├─ models/                  User, Video, Subscription, Message
│  │  ├─ controllers/             user, video, subscription, socket, library
│  │  ├─ routes/                  three routers
│  │  ├─ middlewares/             auth, cache, multer, ratelimiter, pagination
│  │  └─ utils/                   apiError, apiResponse, asyncHandler,
│  │                              cloudinary, cookies, elasticsearch
│  └─ script/seed-test-user.js    demo account
│
├─ SocketConn/                    Socket.IO presence service
│  ├─ src/server.js
│  ├─ database/index.js
│  └─ models/user.models.js
│
└─ frontend/
   └─ src/
      ├─ main.jsx                 providers (QueryClient, Router)
      ├─ App.jsx                  theme, socket registration, ToastHost
      ├─ routes/routes.jsx        route table, lazy chunks, auth gates
      ├─ api/                     axios instance + interceptors, endpoints
      ├─ components/              navbar, toast, loader, protected, boundary
      ├─ layout/                  MainLayout (with navbar) / AuthLayout (bare)
      ├─ pages/                   feed, watch, channel, messages, saved, …
      └─ utils/                   format helpers, theme map, video menu
```

---

Next: **[02 — JavaScript the project depends on](./02-JAVASCRIPT.md)**
