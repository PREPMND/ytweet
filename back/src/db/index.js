import mongoose from "mongoose";
import {DBNAME} from "../constant.js";
export const MongoConnection=async ()=>{
    try{
        const ConnectionInstance= await mongoose.connect(`${process.env.MONGODB_URL}/${DBNAME}`);
    }catch(error){
        console.log("Error in MongoDB connection :",error);
        process.exit(1);
    }
}