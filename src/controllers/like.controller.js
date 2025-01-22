import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

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

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}