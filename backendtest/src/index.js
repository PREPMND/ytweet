import dotenv from "dotenv";
dotenv.config({
    path:'./.env'
})
import { MongoConnection } from "./db/index.js";
import { application } from "./app.js";
console.log(process.env.REFRESH_TOKEN_SECURITY)
MongoConnection();
const PORT=8000
application.listen(PORT,()=>{
    console.log("Server is running on ", PORT)
})