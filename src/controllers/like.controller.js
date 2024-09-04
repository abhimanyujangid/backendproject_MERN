import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

    
//-------------------- toggle like on video--------------
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(403, "Invalid VideoId")
    }
    // take data to which  video that are already 
    const likedAlready = await Like.findOne({
        video:videoId,
        likedBy:req.user?._id,
    })

    // Check that if this video already liked that user licked now then it unliked
    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id)

        return res
        .status(200)
        .json(new ApiResponse(200, {isLiked:false}))
    }

    // Liked the video
    await Like.create({
        video:videoId,
        likedBy:req.user?._id
    });

    return res
    .status(200)
    .json(new ApiResponse(200,{isLiked:true}))

})

//-------------------------toggle like on comment------------
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(403, "Invalid CommentId")
    }
    // take data to which  comment that are already liked
    const likedAlready = await Like.findOne({
        comment:commentId,
        likedBy:req.user?._id
    })

    // Check that if this comment already liked that user liked now then it unliked
    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id)

        return res
        .status(200)
        .json(new ApiResponse(200, {isLiked:false}))
    }

    // Liked the video
    await Like.create({
        Comment:commentId,
        likedBy:req.user?._id
    });

    return res
    .status(200)
    .json(new ApiResponse(200,{isLiked:true}))

})

 //------------------- toggle like on tweet-----------------
const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
   
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(403, "Invalid tweetId")
    }
    // take data to which  video that are already 
    const likedAlready = await Like.findOne({
        tweet:tweetId,
        likedBy:req.user?._id
    })

    // Check that if this video already liked that user licked now then it unliked
    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id)

        return res
        .status(200)
        .json(new ApiResponse(200, { tweetId ,isLiked:false }))
    }

    // Liked the Tweet
    await Like.create({
        tweet:tweetId,
        likedBy:req.user?._id
    });

    return res
    .status(200)
    .json(new ApiResponse(200,{isLiked:true}))
}
)
//------------------- get all liked videos-------------------
const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideosAggegate = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                        },
                    },
                    {
                        $unwind: "$ownerDetails",
                    },
                ],
            },
        },
        {
            $unwind: "$likedVideo",
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $project: {
                _id: 0,
                likedVideo: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                    ownerDetails: {
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1,
                    },
                },
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideosAggegate,
                "liked videos fetched successfully"
            )
        );
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}