# 7 — Caching, Rate Limiting, Realtime & Scale

---

## 7.1 Redis as a cache that cannot take you down

```js
// back/src/redis/redis.js
const memoryStore = { get, set, setEx, del, keys, incr, expire };

async function withFallback(name, args) {
    if (ready && realClient) {
        try { return await realClient[name](...args); }
        catch (err) { console.warn(`[redis] ${name} failed, falling back`); }
    }
    return memoryStore[name](...args);
}
```

### The design rule

**Redis here is a cache and a counter, not a source of truth.** Nothing in it
is unrecoverable. So an outage must degrade performance, never availability.

The original did this:

```js
await connectRedis();     // in index.js — throws if Redis is unreachable
```

A Redis hiccup took the entire API down. Now `connectRedis()` never throws, the
client exposes one small surface, and every call silently falls back to an
in-process `Map`.

The in-memory fallback is deliberately *correct but not distributed*: with
multiple server instances each has its own map, so the cache hit rate drops
and rate limits become per-instance. That is an acceptable degraded mode, and
`/health` reports which mode you are in so it is never a silent surprise.

```js
reconnectStrategy: (retries) => (retries > 5 ? false : Math.min(retries * 200, 2000))
```

Capped exponential-ish backoff, then give up — rather than retrying forever
and filling the logs. We have a working fallback, so there is no reason to
thrash.

---

## 7.2 Cache-aside

```js
const cached = await redis.get(cacheKey);
if (cached) return res.status(200).json(JSON.parse(cached));   // HIT

const data = await expensiveQuery();                           // MISS
res.status(200).json(payload);                                 // respond FIRST
redis.set(cacheKey, JSON.stringify(payload), { EX: 300 })      // then cache
     .catch(...);
```

| Pattern | Who writes the cache |
|---|---|
| **cache-aside** (used here) | the application, on a miss |
| read-through | the cache library itself |
| write-through | write to cache + DB together — consistent, slower writes |
| write-behind | write to cache, flush to DB later — fast, risks data loss |

### Two bugs in the original cache middleware

```js
res.json = async (data) => {
    await redisClient.setEx(key, expiry, JSON.stringify(data));   // ❌ blocks
    originalJson(data);
};
```

1. **The client waited on Redis before receiving the body.** On a miss the
   user paid the database round trip *and* the Redis round trip. Now the
   response is sent first and the cache write is fire-and-forget.
2. **Error responses were cached.** The override caught every `res.json`,
   including 4xx and 5xx. One transient failure was then served to everyone
   for the full TTL.

```js
if (res.statusCode >= 200 && res.statusCode < 300) {   // ✅ only cache success
    Promise.resolve(redisClient.setEx(key, expiry, JSON.stringify(data)))
           .catch(...);
}
```

### Invalidation

```js
export const invalidate = async (pattern) => {
    const keys = await redisClient.keys(pattern);
    if (keys.length) await redisClient.del(keys);
};

await invalidate("videos:*");   // after create / update / delete
```

**`KEYS` is O(n) over the entire keyspace and blocks Redis** — it is single
threaded. Fine at this scale; in production you would use `SCAN` (cursor-based,
non-blocking) or, better, a **generation counter**:

```
videos:gen7:page1   ← bump `gen` to 8 and every old key is orphaned,
                      then expires naturally. No scan at all.
```

Say this in an interview. "I used `KEYS` and here is why that doesn't scale,
and here's what I'd do instead" is a much stronger answer than using `SCAN`
without being able to explain either.

### Key design

```js
const key = [req.method, req.originalUrl, `user:${req.user?._id ?? "public"}`,
             JSON.stringify(req.body ?? {})].join(":");
```

The `user:` segment is a **correctness requirement**, not an optimisation.
Without it, a personalised response cached for user A would be served to user
B. That class of bug has leaked real users' private data in real products.

---

## 7.3 Rate limiting

```js
const requests = await client.incr(key);
if (requests === 1) await client.expire(key, windowSeconds);
if (requests > limit) return res.status(429).json({ ... });
```

`INCR` on a missing key creates it at 1, atomically. The `=== 1` check sets
the TTL exactly once, which is what makes it a *window*.

### The boundary-burst flaw

Fixed-window counters allow **2× the limit** across a window boundary: 30
requests at t=19.9 s and another 30 at t=20.1 s is 60 requests in 200 ms.

| Algorithm | Trade-off |
|---|---|
| **fixed window** (used here) | 2 Redis ops, simple; boundary burst |
| sliding window log | exact; stores every timestamp — memory heavy |
| sliding window counter | weighted blend of two windows; good compromise |
| **token bucket** | allows deliberate bursts, smooth refill; the usual production choice |

### Fail-open vs fail-closed

```js
catch (err) {
    console.warn(`[ratelimit] failing open: ${err.message}`);
    next();                                  // let it through
}
```

If the counter store is unreachable, we **fail open**. The alternative locks
every user out of the whole product because a cache is down. For a rate
limiter, availability beats strictness. (For an *authorisation* check the
answer is the opposite — always fail closed.)

### Identity

```js
const identity = req.user?._id ? `user:${req.user._id}` : `ip:${req.ip}`;
```

Per-user when known, per-IP otherwise. And `app.set("trust proxy", 1)` is
essential — behind Render's load balancer, `req.ip` without it is the
*proxy's* IP, so every user in the world shares one bucket.

### Headers

```js
res.setHeader("X-RateLimit-Limit", limit);
res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - requests));
res.setHeader("Retry-After", windowSeconds);     // on a 429
```

Tells a well-behaved client how to back off instead of hammering.

---

## 7.4 Realtime

```js
// SocketConn/src/server.js
const onlineUsers = new Map();   // userId -> Set<socketId>

socket.on("register-user", async (userId) => {
    socket.userId = userId;
    socket.join(userId);                         // a room named after the user

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    if (onlineUsers.get(userId).size === 1) {    // first tab → now online
        await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: null });
        io.emit("user-status", { userId, isOnline: true });
    }
});
```

### Why `Map<userId, Set<socketId>>` and not `Map<userId, socketId>`

One user, many tabs and devices. Tracking a **set** of sockets means closing
one tab does not mark you offline while another is still open. The transition
only fires when the set becomes empty:

```js
sockets.delete(socket.id);
if (sockets.size === 0) {
    onlineUsers.delete(socket.userId);
    await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
    io.emit("user-status", { userId: socket.userId, isOnline: false, lastSeen });
}
```

This is a reference-counting pattern, and it is the single most common thing
people get wrong in a presence system.

### Rooms

`socket.join(userId)` makes a room per user, so delivering a message is
`io.to(receiverId).emit(...)` with no socket-id bookkeeping and automatic
multi-device fan-out. `socket.join(conversationId)` does the same for typing
indicators.

`socket.to(room)` excludes the sender; `io.to(room)` includes everyone. Typing
indicators use `socket.to` — you should not see your own.

### Known limitations (say these before you're asked)

1. **No authentication on the socket.** Anyone can emit
   `register-user` with any id and mark that user online, or join any
   conversation room. The fix is to verify the JWT in a handshake middleware:

   ```js
   io.use((socket, next) => {
       const token = parseCookie(socket.handshake.headers.cookie)?.accessToken;
       try { socket.userId = jwt.verify(token, SECRET)._id; next(); }
       catch { next(new Error("unauthorized")); }
   });
   ```

   and then **ignore** any client-supplied id.

2. **`onlineUsers` is in-process memory.** Two instances behind a load
   balancer each know only their own connections. Production needs the
   Socket.IO **Redis adapter** so rooms and broadcasts span instances, plus
   sticky sessions (or `transports: ["websocket"]`, which this client already
   forces) so the HTTP-polling handshake doesn't bounce between servers.

3. **`transports: ["websocket"]`** on the client skips the polling upgrade —
   faster, and avoids sticky-session problems — but fails outright on networks
   that block WebSocket rather than falling back.

### Why messages go through REST, not the socket

The socket emits `send-message` for *delivery*, but the message is **created**
by `POST /api/v1/socket/send`. So persistence, validation, rate limiting and
auth all happen in one place, and a socket outage cannot lose data. The socket
layer is a transport optimisation on top of a durable store.

---

## 7.5 Search: three tiers

```js
export const searchElastic = asyncHandler(async (req, res, next) => {
    if (!elastic) { req.query.search = q; return Trending(req, res, next); }
    try { /* elastic multi_match with fuzziness */ }
    catch { return Trending(req, res, next); }      // degrade, don't fail
});
```

| Tier | Cost | Quality |
|---|---|---|
| `$regex` (current default) | collection scan unless anchored | substring only, no ranking |
| Mongo `$text` index | indexed, stemming, `textScore` | no fuzziness, one text index per collection |
| Elasticsearch | separate cluster to run and sync | fuzzy, relevance, facets, highlighting |

The honest engineering answer — and the one actually taken here — is that
Elasticsearch is **optional**, defaults to off, and the code degrades to Mongo
when it is absent. Running a cluster for a few thousand videos is not worth
the operational cost.

A text index is already declared on the models as the sensible middle tier:

```js
videoSchema.index({ title: "text", description: "text" });
```

Note the original `searchElastic` referenced `elastic` **without importing
it** — a guaranteed `ReferenceError` had anything ever routed to it.

---

## 7.6 N+1 queries

```js
// ❌ 1 + N round trips
const videos = await Video.find();
for (const v of videos) v.owner = await User.findById(v.owner);

// ✅ 1 round trip
const videos = await Video.find().populate("owner", "username fullName avatar");

// ✅ also 1, and composable with other stages
{ $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner",
             pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }] } }
```

`populate` is a second query with `$in` (so 2 total, not N+1). `$lookup` is a
true server-side join in one round trip. Either is fine; the loop is not.

Always project the fields you need. `populate("owner")` with no field list
fetches the **password hash and refresh token** into memory — one careless
`res.json(video)` away from a breach.

---

## 7.7 What would need to change at 100× traffic

| Area | Now | At scale |
|---|---|---|
| Pagination | `skip`/`limit` | cursor/keyset — `skip` is O(offset) |
| Cache invalidation | `KEYS videos:*` | generation counter or `SCAN` |
| Rate limiting | fixed window | token bucket, per-user **and** per-IP |
| Sessions | DB lookup per request | Redis-cached user, short TTL |
| Presence | in-process `Map` | Socket.IO Redis adapter |
| Search | regex | `$text`, then Elasticsearch |
| Uploads | API proxies to Cloudinary | signed direct-to-Cloudinary upload |
| Feed | query per request | precomputed/fan-out timeline |
| Media | Cloudinary default | CDN + HLS/DASH adaptive bitrate |
| Deploy | single instance | horizontal + sticky or stateless sockets |

**The highest-value change by far is signed direct uploads.** Right now a
200 MB video streams to the API, hits the disk, then streams to Cloudinary —
the API server is tied up for the whole transfer and the disk is a shared,
finite resource. A signed upload has the browser send bytes straight to
Cloudinary and post only the resulting URL back. One change removes the
largest scaling bottleneck in the system.

---

Next: **[08 — Every bug, explained](./08-BUGS.md)**
