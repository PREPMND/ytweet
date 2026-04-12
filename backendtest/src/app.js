import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
const application = express();
application.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
application.use(express.json({ limit: "16kb" }))
application.use(express.urlencoded({ extended: true, limit: "16kb" }))
application.use(express.static("public"))
application.use(cookieParser())


import router from './routes/user.route.js'
import routerVideo from "./routes/video.routes.js";
console.log("YEA")

application.use("/api/v1/users", router)
application.use("/api/v1/videos", routerVideo)
// Global error handler
application.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    res.status(status).json({
        statusCode: status,
        message: err.message || "Internal Server Error",
        success: false
    });
});
export { application }


