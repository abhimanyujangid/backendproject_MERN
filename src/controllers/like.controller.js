import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//Toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const videoAlreadyLiked = await Like.findOne({video: videoId, likeBy: req.user._id})
    if(videoAlreadyLiked){
        await Like.findByIdAndDelete(videoAlreadyLiked._id)
        return res.status(200).json(new ApiResponse(200, "Video unLiked successfully"))
    }

    const like = new Like({
        video: videoId,
        likeBy: req.user._id
    })
    await like.save()
    return res.status(200).json(new ApiResponse(200, "Video Liked successfully"))

})

//Toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }

    const commentAlreadyLiked = await Like.findOne({comment: commentId, likeBy: req.user._id})
    if(commentAlreadyLiked){
        await Like.findByIdAndDelete(commentAlreadyLiked._id)
        return res.status(200).json(new ApiResponse(200, "Comment unLiked successfully"))
    }

    const like = new Like({
        comment: commentId,
        likeBy: req.user._id
    })
    await like.save()
    return res.status(200).json(new ApiResponse(200, "Comment Liked successfully"))

})

//Toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweetAlreadyLiked = await Like.findOne({tweet: tweetId, likeBy: req.user._id})
    if(tweetAlreadyLiked){
        await Like.findByIdAndDelete(tweetAlreadyLiked._id)
        return res.status(200).json(new ApiResponse(200, "Tweet unLiked successfully"))
    }

    const like = new Like({
        tweet: tweetId,
        likeBy: req.user._id
    })
    await like.save()
    return res.status(200).json(new ApiResponse(200, "Tweet Liked successfully"))
}
)

//Get all liked videos
const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likesVideos = await Like.aggregate([
        {
            $match:{
                likeBy: new mongoose.Types.ObjectId(req.user?._id),
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videoDetails",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"OwnerDetails"
                        }
                    },
                    {
                        $unwind:"$OwnerDetails"
                    }
                ]
            }
        },
        {
            $unwind:"$videoDetails"
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project:{
                _id:0,
                videoDetails:{
                    _id:1,
                    title:1,
                    description:1,
                    thumbnail:1,
                    viewsCount:1,
                    createdAt:1,
                    isPublic:1,
                    OwnerDetails:{
                        _id:1,
                        username:1,
                        fullName:1,
                        avatar:1
                    }
                }
            }
        }
    ]);

    if(!likesVideos){
        return res.status(200).json(new ApiResponse(200, "No liked videos yet"))
    }

    return res.status(200).json(new ApiResponse(200, "Liked videos fetched successfully", likesVideos))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}