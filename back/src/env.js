/**
 * Environment bootstrap.
 *
 * WHY THIS FILE EXISTS (important interview-level detail):
 * ES module `import` statements are HOISTED and the imported modules are
 * EVALUATED BEFORE any statement in the importing module runs. So this:
 *
 *     import dotenv from "dotenv";
 *     import { connectRedis } from "./redis/redis.js";   // <- evaluated NOW
 *     dotenv.config();                                   // <- runs LATER
 *
 * ...means redis.js read `process.env.REDIS_URL` while it was still
 * undefined. The fix is to put `dotenv.config()` in its own module and make
 * it the FIRST import, because imports are evaluated in source order.
 */
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

export const env = {
    PORT: Number(process.env.PORT) || 8000,
    NODE_ENV: process.env.NODE_ENV || "development",
    isProd: process.env.NODE_ENV === "production",

    // Comma-separated list is supported so localhost + deployed origin can coexist.
    CORS_ORIGINS: (process.env.CORS_ORIGIN || "http://localhost:5173")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),

    MONGODB_URL: process.env.MONGODB_URL,
    // The old code did `${MONGODB_URL}/${DBNAME}`, which appended the name
    // AFTER the connection string's query params -- it was silently ignored
    // and the driver fell back to the default database. We keep the SAME
    // effective database (so no data is lost) but set it explicitly.
    DB_NAME: process.env.DB_NAME || "test",

    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECURITY,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECURITY,
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "10d",

    CLOUD_NAME: process.env.CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_SECRET_KEY: process.env.CLOUDINARY_SECRET_KEY,

    REDIS_URL: process.env.REDIS_URL,
    ELASTIC_URL: process.env.ELASTIC_URL,
};

/** Fail fast on the things the server genuinely cannot run without. */
export function assertRequiredEnv() {
    const required = [
        ["MONGODB_URL", env.MONGODB_URL],
        ["ACCESS_TOKEN_SECURITY", env.ACCESS_TOKEN_SECRET],
        ["REFRESH_TOKEN_SECURITY", env.REFRESH_TOKEN_SECRET],
    ];

    const missing = required.filter(([, value]) => !value).map(([name]) => name);

    if (missing.length) {
        console.error(`[env] Missing required variables: ${missing.join(", ")}`);
        process.exit(1);
    }
}

export default env;
