import {Schema,model} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
const videoSchema= new Schema({
    videoFile:{
        type:String,//cloudinary url
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    duration:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});
// Indexes matching the actual query shapes:
//  - feed:     { isPublished: true } sorted by createdAt / views
//  - channel:  { owner } sorted by createdAt
//  - search:   text index so title/description search isn't a collection scan
videoSchema.index({ isPublished: 1, createdAt: -1 });
videoSchema.index({ isPublished: 1, views: -1 });
videoSchema.index({ owner: 1, createdAt: -1 });
videoSchema.index({ title: "text", description: "text" });

videoSchema.plugin(mongooseAggregatePaginate);
export const Video=model("Video",videoSchema);