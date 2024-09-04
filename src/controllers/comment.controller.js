import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model copy.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Like } from "../models/like.model.js"

//------------- get all comments for a video---------------
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    // Check if the video exists in the database
    const videoExists = await Video.exists({ _id: videoId });
    if (!videoExists) {
        throw new ApiError(404, "Video not found");
    }

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId), // Match comments by videoId
            },
        },
        {
            $lookup: {
                from: "users", // Join with the users collection
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        {
            $lookup: {
                from: "likes", // Join with the likes collection
                localField: "_id",
                foreignField: "comment",
                as: "likes",
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes", // Calculate the number of likes per comment
                },
                owner: {
                    $first: "$owner", // Get the first user from the owner array
                },
                isLiked: {
                    $in: [req.user?._id, "$likes.likedBy"], // Check if the comment is liked by the current user
                },
            },
        },
        {
            $sort: {
                createdAt: -1, // Sort comments by creation date in descending order
            },
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1, 
                owner: {
                    username: 1, 
                    fullName: 1, 
                    "avatar.url": 1, 
                },
                isLiked: 1, 
            },
        },
    ]);

  
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    // Apply pagination to the aggregation result
    const comments = await Comment.aggregatePaginate(commentsAggregate, options);

  
    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

//---------------- TODO: add a comment to a video--------------
const addComment = asyncHandler(async (req, res) => {
    // Take the videoId and the content our frontend
    const { videoId } = req.params;
    const { content } = req.body;
      // Validate input
    if (!content) {
        throw new ApiError(400, "Content is required.")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404,"Not a valid videoId.")
    }
     // Check if the video exists
    const videoExists = await Video.findById(videoId)
    if (!videoExists) {
        throw new ApiError(404, "Video not found");
    }
       // Create the comment
    const comment =  await Comment.create({
        content,
        video:videoId,
        owner:req.user?._id
    })
    
    if (!comment) {
        throw new ApiError(500,"Failed to add comment. Please try again")
    }

    return res
    .status(201)
    .json(new ApiResponse(201, comment , "Comment added successfully."))
})

//----------------- TODO: update a comment--------------------
const updateComment = asyncHandler(async (req, res) => {
    // Take the id and content from frontend
    const { commentId } = req.params
    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(40, "Not a valid comment id")
    }
    // Check if comment exists or not in Our database
    const commentExists = await Comment.findById(commentId)
    if (!commentExists) {
        throw new ApiError(404, "Comment not found in the database.");
    } 

    if (Comment?.owner.toString() !== req?.user?._id.toString() ) {
        throw new ApiError(403, "Only comment owner can edit their comment. ")
    }
    // Update comment
    const updateComment =  await Comment.findByIdAndUpdate(
        commentId, 
        {
            $set: {
                content
            },
        },{new:true}
    );

    if (!updateComment) {
        throw new ApiError(500, "Failed to edit comment. Please try again.")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updateComment, "Comment update successfully."))
})

// --------------------delete a comment ---------------------
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } =  req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Not a valid comment id.")
    }

    const commentExists = await Comment.findById(commentId);

    if (!commentExists) {
        throw new ApiError(404, "Comment not found in db")
    }
    // Check the comment owner delete their comment 
    if(Comment?.owner.toString() !==  req?.user?._id.toString()){
        throw new ApiError(403, "Only comment owner can delete their comment")
    }

    await Comment.findByIdAndDelete(commentId);
    await Like.deleteMany({
        comment:commentId,
        likeBy: req?.user?._id
    })

    return res 
    .status(201)
    .json(new ApiResponse(201, {commentId}, "Comment delete succesfully."))


})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
