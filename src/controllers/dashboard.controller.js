import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
})

const getChannelVideos = asyncHandler(async (req, res) => {

    const userId = req.user?._id

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $count: "videoCount"
        },
        {
          $addFields: {
            createdAt:{
                $dateToParts:{
                    date: "$createdAt"
                }
            },
            likesCount: {
              $size: "$likes"
            },
            videoCount:{
                $size: "$_id"
            }
          }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
               _id: 1,
                title: 1,
                description: 1,
                'thumbnail.url': 1,
                'videoFile.url': 1,
                isPublic: 1,
                createdAt: {
                    year: 1,
                    month: 1,
                    day: 1
                },
                likesCount: 1                
            }
        }
    ])
})

export {
    getChannelStats, 
    getChannelVideos
    }