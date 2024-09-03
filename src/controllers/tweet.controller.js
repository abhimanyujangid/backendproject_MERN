import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


//===================== create tweet=======================
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    // if content is not available
    if(!content){
        throw new ApiError(400, "Content is required")
    }

    // create tweet
    const tweet = await Tweet.create({
        content,
        owner: req.user?._id,
    });

    // If tweet id not created
    if (!tweet) {
        throw new ApiError(500,"Failed to create tweet. Please try again")
    }

    // If tweet create successfully 
    return res
    .status(200)
    .json(new ApiResponse(200, tweet , "Tweet created successfully."))
});

//===================== get user tweets ==================
const getUserTweets = asyncHandler(async (req, res) => {
  // Get user id
  const { userId } = req.params;

  // check user id is valid or not
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid UserId")
  }

  const tweets = await Tweet.aggregate([
    {
        $match:{
            owner: new mongoose.Types.ObjectId(userId)
        }
    },
    {
        $lookup: {
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"ownerDetails",
            pipeline:[{
                $project:{
                    username:1,
                    "avatar.url":1,
                }
            }]
        }
    },
    {
        $lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"tweet",
            as:"likeDetails",
            pipeline:[{
                $project: {
                    likedBy:1
                }
            }]

        }
    },
    {
        $addFields: {
            likeCount:{
                $size:"$likeDetails",
            },
            ownerDetails:{
                $first : "$ownerDetails",
            },
            isLiked:{
                $cond:{
                    if:{$in: [req.user?._id, "$likeDetails.likedBy"]},
                    then:true,
                    else:false
                }
            }
        },
    },
    {
        $sort:{
            createdAt: -1
        }
    },
    {
        $project: {
            content: 1,
            ownerDetails:1,
            likeCount:1,
            isLiked:1,
            createdAt:1
        },
    },
  ]);

  return res
  .status(200)
  .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));

});

//==================== update tweet ================
const updateTweet = asyncHandler(async (req, res) => {
    // Take tweet id
    const { tweetId } = req.params;

    // Take tweet content
    const { content } = req.body;

    // Check content
    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    // Check the tweet_id exits or not in db
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet id is invalid")
    }

    // Update the tweet
    const tweet = await Tweet.findById(tweetId);

    // If tweet not update 
    if (!tweet) {
        throw new ApiError(404, "Tweet not found in Server")
    }

    // check that  user is updating  the tweet is actual user or not
    if (tweet?.owner.toString() != req.user?._id.toString()) {
        throw new ApiError(400, "Only owner can edit their tweet")
    }

    // Update the tweet 
    const newTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content,
            },
        },
        {new: true}
    );

    // If new_Tweet not update
    if(!newTweet){
        throw new ApiError(500, "Failed to edit tweet. Please try again.")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, newTweet , "Tweet updated succesfully"))



})

//================ delete tweet ======================
const deleteTweet = asyncHandler(async (req, res) => {

    // Take tweet_id 
    const { tweetId } = req.params

    // Check if the tweet id exist or not in db
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet id is invalid")
    }
    
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // check that  user is deleting  the tweet is actual user or not
    if (tweet?.owner.toString() != req.user?._id.toString()) {
        throw new ApiError(400, "Only owner can edit their tweet")
    }

    // Delete the tweet
    await Tweet.findByIdAndDelete(tweetId);

    return res
        .status(200)
        .json(new ApiResponse(200, {tweetId}, "Tweet deleted successfully."));

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
