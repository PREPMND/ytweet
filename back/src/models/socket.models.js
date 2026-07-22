import mongoose, {Mongoose, Schema,model} from "mongoose";
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
        status:{
            type:String,
            default:"sent",
        },
        lastSeen:{
            type:Date,
        }
    },{timestamps:true}
);
export const Message=model("Message",socketSchema);