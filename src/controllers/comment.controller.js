import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const commentsAggregate = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                countLikes: {
                    $size: "$likes"
                },
                ownerDetails: {
                    $arrayElemAt: ["$ownerDetails", 0]
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likeBy"] },
                        then: true,
                        else: false
                    }
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
                content: 1,
                owner: {
                    _id: 1,
                    username: 1,
                    avatar: 1,
                },
                createdAt: 1,
                countLikes: 1,
                isLiked: 1
            }
        }
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    }

    const comment = await Comment.paginate(commentsAggregate, options);


    return res.status(200).json(new ApiResponse(200, "Comments fetched successfully", comment))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "Comment content is required")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const comment = new Comment({
        content,
        video: videoId,
        owner: req.user._id
    });

    if (!comment) {
        throw new ApiError(500, "Error adding comment")
    }

    return res.status(201).json(new ApiResponse(201, "Comment added", comment))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "Comment content is required")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, {
        $set: {
            content
        }
    }, { new: true })

    return res.status(200).json(new ApiResponse(200, "Comment updated", updatedComment))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)
    await Like.deleteMany({ comment: commentId, likeBy: req.user?._id })

    return res.status(200).json(new ApiResponse(200, "Comment deleted"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}