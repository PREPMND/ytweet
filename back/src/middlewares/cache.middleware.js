import redisClient from "../redis/redis.js";

export const cache = (expiry = 300) => {
    return async (req, res, next) => {

        const key = req.originalUrl + JSON.stringify(req.body);

        try {

            const cachedData = await redisClient.get(key);

            if (cachedData) {
                console.log(key);
                return res.status(200).json(JSON.parse(cachedData));
            }
            console.log(key);
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