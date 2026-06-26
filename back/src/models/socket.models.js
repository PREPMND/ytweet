import {Mongoose, Schema,model} from "mongoose";
const socketSchema=new Schema(
    {
        sender:{
            type:"string",
            
        }
    },{timestamps:"true"}
)