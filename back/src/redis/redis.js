import { createClient } from "redis";
import env from "../env.js";

/**
 * Redis is a CACHE and a rate-limit counter here, not a source of truth.
 * So it must never be able to take the API down:
 *   - if REDIS_URL is missing, we use an in-process Map instead
 *   - if the connection drops, calls degrade to the in-process store
 *   - `connectRedis()` never throws
 *
 * Every consumer talks to the same small surface:
 *   get, set(key, value, {EX}), setEx, del, keys, incr, expire
 */

/* ------------------------------------------------------------------ */
/* In-memory fallback (good enough for local dev / Redis outage)       */
/* ------------------------------------------------------------------ */

const memory = new Map(); // key -> { value, expiresAt | null }

function memoryAlive(key) {
    const entry = memory.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
        memory.delete(key);
        return null;
    }
    return entry;
}

const memoryStore = {
    async get(key) {
        return memoryAlive(key)?.value ?? null;
    },
    async set(key, value, options = {}) {
        const ttl = options.EX ?? options.ex ?? null;
        memory.set(key, {
            value,
            expiresAt: ttl ? Date.now() + ttl * 1000 : null,
        });
        return "OK";
    },
    async setEx(key, seconds, value) {
        return memoryStore.set(key, value, { EX: seconds });
    },
    async del(keys) {
        const list = Array.isArray(keys) ? keys : [keys];
        let removed = 0;
        for (const key of list.flat()) {
            if (memory.delete(key)) removed += 1;
        }
        return removed;
    },
    async keys(pattern) {
        // Only the `prefix:*` form is used by this codebase.
        const regex = new RegExp(
            "^" + pattern.split("*").map(escapeRegex).join(".*") + "$"
        );
        return [...memory.keys()].filter((key) => memoryAlive(key) && regex.test(key));
    },
    async incr(key) {
        const current = Number(memoryAlive(key)?.value ?? 0) + 1;
        const existing = memory.get(key);
        memory.set(key, { value: String(current), expiresAt: existing?.expiresAt ?? null });
        return current;
    },
    async expire(key, seconds) {
        const entry = memory.get(key);
        if (!entry) return 0;
        entry.expiresAt = Date.now() + seconds * 1000;
        return 1;
    },
};

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ------------------------------------------------------------------ */
/* Real client                                                        */
/* ------------------------------------------------------------------ */

let realClient = null;
let ready = false;
let warnedOnce = false;

if (env.REDIS_URL) {
    realClient = createClient({
        url: env.REDIS_URL,
        socket: {
            connectTimeout: 5000,
            // Give up after a few attempts instead of retrying forever and
            // flooding the logs; we have a working fallback anyway.
            reconnectStrategy: (retries) => (retries > 5 ? false : Math.min(retries * 200, 2000)),
        },
    });

    realClient.on("error", (err) => {
        ready = false;
        if (!warnedOnce) {
            warnedOnce = true;
            console.warn(`[redis] unavailable, using in-memory cache: ${err.message}`);
        }
    });

    realClient.on("ready", () => {
        ready = true;
        warnedOnce = false;
        console.log("[redis] connected");
    });

    realClient.on("end", () => {
        ready = false;
    });
}

export const connectRedis = async () => {
    if (!realClient) {
        console.warn("[redis] REDIS_URL not set - using in-memory cache");
        return;
    }
    try {
        await realClient.connect();
    } catch (err) {
        console.warn(`[redis] connect failed, using in-memory cache: ${err.message}`);
    }
};

export const disconnectRedis = async () => {
    if (realClient?.isOpen) {
        await realClient.quit().catch(() => {});
    }
};

export const isRedisReady = () => ready;

/** Run `fn` against the real client, falling back to memory on any failure. */
async function withFallback(name, args) {
    if (ready && realClient) {
        try {
            return await realClient[name](...args);
        } catch (err) {
            console.warn(`[redis] ${name} failed, falling back: ${err.message}`);
        }
    }
    return memoryStore[name](...args);
}

const client = {
    get: (...args) => withFallback("get", args),
    set: (...args) => withFallback("set", args),
    setEx: (...args) => withFallback("setEx", args),
    del: (...args) => withFallback("del", args),
    keys: (...args) => withFallback("keys", args),
    incr: (...args) => withFallback("incr", args),
    expire: (...args) => withFallback("expire", args),
};

export default client;
