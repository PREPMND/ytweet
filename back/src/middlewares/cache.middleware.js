import redisClient from "../redis/redis.js";

/**
 * Read-through cache for GET-ish handlers.
 *
 * Two bugs the original version had:
 *  1. it replaced `res.json` with an ASYNC function and awaited Redis BEFORE
 *     sending the body, so every miss paid the Redis round-trip twice;
 *  2. it cached whatever went through `res.json`, INCLUDING 4xx/5xx bodies,
 *     so one transient failure was served for the full TTL.
 */
export const cache = (expiry = 20) => {
    return async (req, res, next) => {
        const key = [
            req.method,
            req.originalUrl,
            `user:${req.user?._id ?? "public"}`,
            JSON.stringify(req.body ?? {}),
        ].join(":");

        try {
            const cachedData = await redisClient.get(key);

            if (cachedData) {
                res.setHeader("X-Cache", "HIT");
                return res.status(200).json(JSON.parse(cachedData));
            }
        } catch (err) {
            console.warn(`[cache] read failed: ${err.message}`);
            return next();
        }

        res.setHeader("X-Cache", "MISS");

        const originalJson = res.json.bind(res);

        res.json = (data) => {
            // Send first. Write to the cache afterwards, fire-and-forget.
            const result = originalJson(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
                Promise.resolve(
                    redisClient.setEx(key, expiry, JSON.stringify(data))
                ).catch((err) => console.warn(`[cache] write failed: ${err.message}`));
            }

            return result;
        };

        next();
    };
};

/** Drop every key matching `prefix:*`. Used after writes. */
export const invalidate = async (pattern) => {
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length) await redisClient.del(keys);
    } catch (err) {
        console.warn(`[cache] invalidate(${pattern}) failed: ${err.message}`);
    }
};
