import dotenv from "dotenv";
import { connectRedis } from "./redis/redis.js";
dotenv.config({
    path:'./.env'
})
import { MongoConnection } from "./db/index.js";
import { application } from "./app.js";
MongoConnection();
await connectRedis();
application.use((req, res, next) => {
    next();
});
const PORT= process.env.PORT || 3000;
application.listen(PORT,()=>{
    console.log("Server is running on ", PORT)
})
application.get("/hello", (req, res) => res.send("hello from index"));
process.on("SIGINT", () => {
  console.log("Shutting down...");
  process.exit();
});
