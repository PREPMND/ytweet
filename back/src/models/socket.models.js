import mongoose, {Mongoose, Schema,model} from "mongoose";
import { User } from "./user.models";
const socketSchema=new Schema(
    {
        sender:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        receiver:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        conversationId:{
            type:String,
            required:true,
            index:true,
        },
        text:{
            type:String,
            trim:true,
        },
        messageType:{
            type:String,
            enum:["text","image","video","file"],
            default:"text"
        },
        seen:{
            type:Boolean,
            default:false,
        }
    },{timestamps:"true"}
);
export const Message=model("Message",socketSchema);