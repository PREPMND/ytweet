import { Schema , model} from "mongoose"
const subscriptionSchema= new Schema(
    {
        subscriber:
        {
            type:Schema.Types.ObjectId,//one who is subscribing
            ref:"User"
        },
        channel:
        {
            type:Schema.Types.ObjectId,//one who has been subscribed
            ref:"User"
        }
    },{timestamps:true})

// Without this, a double-click on "Subscribe" (or two tabs) creates two
// subscription documents and the subscriber count is permanently wrong.
// The unique index makes the database the last line of defence.
subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });
subscriptionSchema.index({ channel: 1 });

export const Subscription= model("Subscription",subscriptionSchema)