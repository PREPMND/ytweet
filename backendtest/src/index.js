import dotenv from "dotenv";
import listEndpoints from 'express-list-endpoints';
dotenv.config({
    path:'./.env'
})
import { MongoConnection } from "./db/index.js";
import { application } from "./app.js";
console.log("Application object:", application);
console.log(process.env.REFRESH_TOKEN_SECURITY)
MongoConnection();
const PORT=8000
application.listen(PORT,()=>{
    console.log("Server is running on ", PORT)
    console.log(listEndpoints(application));
})
application.get("/hello", (req, res) => res.send("hello from index"));
