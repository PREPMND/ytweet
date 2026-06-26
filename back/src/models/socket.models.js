import {Mongoose, Schema,model} from "mongoose";
import { User } from "./user.models";
const socketSchema=new Schema(
    {
        sender:{
            type:Schema.Types.ObjectId,
            ref:"User",
        },
        receiver:{
            type:Schema.Types.ObjectId,
            ref:"User",
        },
        conver
    },{timestamps:"true"}
)