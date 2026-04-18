import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import listEndpoints from 'express-list-endpoints';


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
application.get("/debug", (req, res) => res.send("debug works"));
application.use("/api/v1/users", router)
import routerVideo from './routes/video.routes.js'
application.use("/api/v1/videos", routerVideo)
console.log(listEndpoints(application));
// Global error handler
application.use((err, req, res, next) => {
    const status = err.statusCode || 500;

    res.status(status).json({
        statusCode: status,
        data: err.data || null,
        message: err.message || "Internal Server Error",
        success: false,
        errors: err.errors || []
    });
});
export { application }


