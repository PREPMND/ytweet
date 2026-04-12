import dotenv from "dotenv";
import { application } from "./app.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";
import { router } from "express";
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
application._router.stack.forEach(r => {
  if (r.route) {
    console.log(r.route.path, r.route.methods);
  }
});