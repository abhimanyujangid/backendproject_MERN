import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    const { _id: userId } = req?.user
    if (!content) {
        throw new ApiError(400, "Content is required")
    }
    const tweet = await Tweet.create(
        {
            content,
            owner: userId
        }
    )
    if (!tweet) {
        throw new ApiError(500, "Something went wrong")
    }
   return res.status(201).json(new ApiResponse(201, "Tweet created successfully", tweet))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const tweet = await Tweet.aggregate([
        {
            $match: { owner: mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "OwnerDetails",
                pipeline:[
                    {
                        $project: 
                        {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { 
            $lookup:{
                from:"likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likesDetails",
                pipeline:[
                    {
                        $project:{
                            likedBy: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likesCount: {$size: "$likesDetails"},
                OwnerDetails: {$arrayElemAt: ["$OwnerDetails", 0]},
                isLiked:{
                    $cond:{
                        if:{$in:[req.user?._id, "$likesDetails.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort:{createdAt: -1}
        },
        {
            $project:{
                content: 1,
                createdAt: 1,
                likesCount: 1,
                OwnerDetails: 1,
                isLiked: 1
            }
        }
    ]);

    if (!tweet) {
        throw new ApiError(500, "Something went wrong");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Tweets fetched successfully", tweet));
})

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;
    const { _id: userId } = req?.user;

    if (!content) {
        throw new ApiError(400, "Content is required");
    }

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== userId) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:
            {
                content
            }
        },
        { new: true }
    );

    if (!updatedTweet) {
        throw new ApiError(500, "Something went wrong");
    }

    return res.status(200).json(
        new ApiResponse(200, "Tweet updated successfully", updatedTweet)
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;
    const { _id: userId } = req?.user;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    if (tweet.owner.toString() !== userId) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deletedTweet) {
        throw new ApiError(500, "Something went wrong");
    }
    return res.status(200).json(new ApiResponse(200, "Tweet deleted successfully", deletedTweet));

});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}