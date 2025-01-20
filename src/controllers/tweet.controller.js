import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body
    const {_id: userId} = req?.user
    if(!content) {
        throw new ApiError(400, "Content is required")
    }
    const tweet = await Tweet.create(
        {
            content,
            owner: userId
        }
    )
    if(!tweet) {
        throw new ApiError(500, "Something went wrong")
    }
    res.status(201).json(new ApiResponse(201, "Tweet created successfully", tweet))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const {userId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }
    const user = await User.findById(userId)
    if(!user) {
        throw new ApiError(404, "User not found")
    }
    const tweets = await Tweet.find({owner: userId})
    .skip((page - 1) * limit)
    .limit(limit)
    if(!tweets) {
        throw new ApiError(404, "User has no tweets")
    }
    res.status(200).json(new ApiResponse(200, "User tweets retrieved successfully", tweets))
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
        { content },
        { new: true }
    );

    if (!updatedTweet) {
        throw new ApiError(500, "Something went wrong");
    }

    res.status(200).json(
        new ApiResponse(200, "Tweet updated successfully", updatedTweet)
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;
    const {_id: userId} = req?.user;

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id");
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
     if (tweet.owner.toString() !== userId) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if(!deletedTweet) {
        throw new ApiError(500, "Something went wrong");
    }
    res.status(200).json(new ApiResponse(200, "Tweet deleted successfully", deletedTweet));

});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}