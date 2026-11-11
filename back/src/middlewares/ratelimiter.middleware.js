import client from "../redis/redis.js";

/**
 * Fixed-window counter rate limiter.
 *
 * Interview note: this is the simplest algorithm and it has a known flaw --
 * the "boundary burst". With a 20s window and a limit of 30, a client can
 * fire 30 requests at 19.9s and another 30 at 20.1s: 60 requests in 0.2s.
 * Sliding-window-log or token-bucket fix that; see the study doc.
 *
 * The limiter is also FAIL-OPEN: if the counter store is unreachable we let
 * the request through rather than locking everyone out.
 */
export const rateLimiter = ({ limit = 30, windowSeconds = 20 } = {}) => {
    return async (req, res, next) => {
        try {
            const identity = req.user?._id ? `user:${req.user._id}` : `ip:${req.ip}`;
            const key = `rate:${identity}`;

            const requests = await client.incr(key);

            if (requests === 1) {
                await client.expire(key, windowSeconds);
            }

            res.setHeader("X-RateLimit-Limit", limit);
            res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - requests));

            if (requests > limit) {
                res.setHeader("Retry-After", windowSeconds);
                return res.status(429).json({
                    success: false,
                    statusCode: 429,
                    message: "Too many requests. Please try again in a moment.",
                });
            }

            next();
        } catch (err) {
            console.warn(`[ratelimit] failing open: ${err.message}`);
            next();
        }
    };
};

/** Default limiter, usable directly as middleware: `rateLimit` */
export const rateLimit = rateLimiter();

/** Tighter limiter for credential endpoints (login / register). */
export const authRateLimit = rateLimiter({ limit: 10, windowSeconds: 60 });
