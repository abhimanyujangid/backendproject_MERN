import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema({
    videoFile: {
        type: {
            url: String,
            public_id: String,
        },
        required: true,
    },
    thumbnail: {
        type: {
            url: String,
            public_id: String,
        },
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    views: {
        type: Number,
        required: true,
        default: 0,
    },
    duration: {
        type: Number,
        required: true,
    },
    isPublic: {
        type: Boolean,
        required: true,
        default: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
   }, {timestamps: true});
   
videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model('Video', videoSchema)