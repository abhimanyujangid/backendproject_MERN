import mongoose,{Schema} from "mongoose";

const playlistSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    videos: [
       {
        type: Schema.Types.ObjectId,
        ref: 'Video',
        required: true,
       }
    ],
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
    },
}, {timestamps: true});

export const Playlist = mongoose.model('Playlist', playlistSchema);