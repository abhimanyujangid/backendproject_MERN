import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
  
        const { title, description} = req.body
        // TODO: get video, upload to cloudinary, create video
        if([title, description].some((field)=> field?.trim() === "")) {
            throw new ApiError(400, "Please provide a valid title and description")
        }
    
        const localVideoPath = req.files?.videoFile[0].path;
        const localThumbnailPath = req.files?.thumbnail[0].path;
    
        if (!localVideoPath || !localThumbnailPath) {
            throw new ApiError(400, "Please provide a valid video and thumbnail")
        }
    
        const videoFile = await uploadOnCloudinary(localVideoPath, "videos")
        const thumbnail = await uploadOnCloudinary(localThumbnailPath, "thumbnails")
    
        if(!videoFile || !thumbnail) {
            throw new ApiError(500, "Error uploading video, please try again")
        }
    
        const video = await Video.create({
            title,
            description,
            duration: videoFile.duration,
            videoFile: {
                url: videoFile.url,
                public_id: videoFile.public_id
            },
            thumbnail: {
                url: thumbnail.url,
                public_id: thumbnail.public_id
            },
            owner: req.user?._id
        })
    
        const savedVideo = await video.save()
        if(!savedVideo) {
            throw new ApiError(500, "Error saving video, please try again")
        }
        
        return res.status(201).json(new ApiResponse(201, {video: savedVideo}, "Video published successfully"))
    
});


// Done
const getVideoById = asyncHandler(async (req, res) => {
    
        const { videoId } = req.params
        if (!isValidObjectId(videoId)) {
            throw new ApiError(404, "Video not found")
        }

        const video = await Video.aggregate([
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup: {
                    from:"likes",
                    localField:"_id",
                    foreignField:"video",
                    as:"likesDetails",
                }
            },
            {
                $lookup: {
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"OwnerDetails",
                    pipeline:[
                    { 
                        $lookup:{
                            from:"subscriptions",
                            localField:"_id",
                            foreignField:"channel",
                            as:"subscribers"
                        }
                    },
                    {
                        $addFields:{
                            subscriberCount:{$size:"$subscribers"},
                            isSubscribed:{
                                $cond:{
                                    if:{$in:[req.user?._id, "$subscribers.subscriber"]},
                                    then:true,
                                    else:false
                                }
                            }
                        }
                    },
                    {
                        $project:{
                            username:1,
                            subscriberCount:1,
                            "avatar.url":1,
                            isSubscribed:1
                        }
                    }
                ]
                }
            },
            {
                $addFields:{
                    likeCount:{$size:"$likesDetails"},
                    ownerDetails:{$arrayElemAt:["$OwnerDetails", 0]},
                    isLiked:{
                        $cond:{
                            if:{$in:[req.user?._id, "$likesDetails.user"]},
                            then:true,
                            else:false
                        }
                    }
                }
            },
            {
                $project:{
                    _id:1,
                    title:1,
                    description:1,
                    view:1,
                    createdAt:1,
                    duration:1,
                    "videoFile.url":1,
                    likeCount:1,
                    ownerDetails:1,
                    isLiked:1,
                    isPublic:1
                }
            }
        ]);

        if(!video){
            throw new ApiError(404, "Video not found")
        }

        await Video.findByIdAndUpdate(videoId, {$inc: {views: 1}});

        // add watch history
      await User.findByIdAndUpdate(req.user?._id, {$addToSet: {watchHistory: videoId}})

        return res.status(200).json(new ApiResponse(200, {video}, "Video fetched successfully"))
        
    
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}