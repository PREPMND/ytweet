import redisClient from "../redis/redis.js";

export const cache = (expiry = 20) => {
    return async (req, res, next) => {

        const key = `${req.method}:${req.originalUrl}:user:${req.user?._id ?? "public"}:${JSON.stringify(req.body ?? {})}`;

        try {

            const cachedData = await redisClient.get(key);

            if (cachedData) {
                console.log("hit", key);
                return res.status(200).json(JSON.parse(cachedData));
            }
            console.log("miss", key);
            const originalJson = res.json.bind(res);

            res.json = async (data) => {

                await redisClient.setEx(
                    key,
                    expiry,
                    JSON.stringify(data)
                );

                originalJson(data);
            };

            next();

        } catch (err) {

            console.log("Redis Cache Error:", err);

            next();

        }

    };
};