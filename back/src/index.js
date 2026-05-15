import dotenv from "dotenv";
import listEndpoints from 'express-list-endpoints';
dotenv.config({
    path:'./.env'
})
import { MongoConnection } from "./db/index.js";
import { application } from "./app.js";
console.log(process.env.REFRESH_TOKEN_SECURITY)
MongoConnection();
application.use((req, res, next) => {
    console.log("Incoming:", req.method, req.url);
    next();
});
const PORT= process.env.PORT || 3000;
application.listen(PORT,()=>{
    console.log("Server is running on ", PORT)
    console.log(listEndpoints(application));
})
application.get("/hello", (req, res) => res.send("hello from index"));
