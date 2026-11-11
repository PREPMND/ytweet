// `./env.js` MUST be the first import: ES module imports are evaluated in
// source order, and every module below reads process.env at module scope.
import env, { assertRequiredEnv } from "./env.js";

import { MongoConnection, MongoDisconnect } from "./db/index.js";
import { connectRedis, disconnectRedis } from "./redis/redis.js";
import { application } from "./app.js";

assertRequiredEnv();

await MongoConnection();
await connectRedis(); // never throws; degrades to an in-memory cache

const server = application.listen(env.PORT, () => {
    console.log(`[api] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    console.log(`[api] allowed origins: ${env.CORS_ORIGINS.join(", ")}`);
});

/* ---------------------------- graceful shutdown --------------------------- */

let shuttingDown = false;

async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`\n[api] ${signal} received, shutting down...`);

    server.close(async () => {
        await Promise.allSettled([disconnectRedis(), MongoDisconnect()]);
        console.log("[api] closed cleanly");
        process.exit(0);
    });

    // Don't hang forever if a socket refuses to close.
    setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
    console.error("[api] unhandled rejection:", reason);
});
