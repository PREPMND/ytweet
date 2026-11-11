import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import env from "./env.js";
import { apiError } from "./utils/apiError.js";
import { isRedisReady } from "./redis/redis.js";

import router from "./routes/user.route.js";
import routerVideo from "./routes/video.routes.js";
import routerSocket from "./routes/socket.route.js";

const application = express();

application.set("trust proxy", 1);

/* --------------------------------- CORS ---------------------------------- */
/* Credentialed requests cannot use `Access-Control-Allow-Origin: *`, so the
   origin has to be echoed back from an allow-list. */
application.use(
    cors({
        origin(origin, callback) {
            // Same-origin / curl / server-to-server requests have no Origin header.
            if (!origin) return callback(null, true);
            if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
            return callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        credentials: true,
    })
);

application.use(express.json({ limit: "16kb" }));
application.use(express.urlencoded({ extended: true, limit: "16kb" }));
application.use(cookieParser());

/* ------------------------------- health ---------------------------------- */

application.get("/health", (req, res) => {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    res.json({
        status: "ok",
        env: env.NODE_ENV,
        uptimeSeconds: Math.round(process.uptime()),
        mongo: states[mongoose.connection.readyState] ?? "unknown",
        redis: isRedisReady() ? "connected" : "in-memory-fallback",
    });
});

/* -------------------------------- routes --------------------------------- */

application.use("/api/v1/users", router);
application.use("/api/v1/videos", routerVideo);
application.use("/api/v1/socket", routerSocket);

/* ------------------------------- 404 + errors ---------------------------- */

application.use((req, res, next) => {
    next(new apiError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

// Express 5 forwards rejected promises here automatically, which is why every
// controller can be a plain async function wrapped in asyncHandler.
application.use((err, req, res, next) => {
    const status = Number(err.statusCode) || 500;

    if (status >= 500) {
        console.error(`[api] ${req.method} ${req.originalUrl}`, err);
    }

    res.status(status).json({
        statusCode: status,
        data: err.data ?? null,
        message: err.message || "Internal Server Error",
        success: false,
        errors: err.errors ?? [],
        ...(env.isProd ? {} : { stack: err.stack }),
    });
});

export { application };
