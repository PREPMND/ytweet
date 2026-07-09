import client from "../redis/redis.js";

export const rateLimiter = async (req, res, next) => {
    try {
        const key = req.user
            ?`rate:${req.user._id}`:`rate:${req.ip}`;
        const requests = await client.incr(key);
        if (requests === 1) {
            await client.expire(key, 60); // 20 seconds
        }
        if (requests > 10) {
            return res.status(429).json({
                success: false,
                message: "Too many requests. Please try again later.",
            });
        }
        next();
    } catch (err) {
        console.log("Rate Limiter Error:", err);
        next();
    }
};