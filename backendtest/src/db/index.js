import mongoose from "mongoose";
import {DBNAME} from "../constant.js";
export const MongoConnection=async ()=>{
    try{
        const ConnectionInstance= await mongoose.connect(`${process.env.MONGODB_URL}/${DBNAME}`);
        console.log(`MongoDB is connected on : ${ConnectionInstance.connection.host}`);
    }catch(error){
        console.log("Error in MongoDB connection :",error);
        process.exit(1);
    }
}