import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// create playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if([name, description].includes(undefined)){
        throw new ApiError(400, "Name and description are required")
    };

    const playlist = new Playlist.create(
        {
            name,
            description,
            owner: req.user?._id
        }
    );

    if(!playlist) {
        throw new ApiError(500, "Something went wrong")
    }

    return res.status(201).json(new ApiResponse(201, "Playlist created successfully", playlist))

})

// delete playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to delete this playlist")
    }

    await Playlist.findByIdAndDelete(playlist?._id);

    return res.status(200).json(new ApiResponse(200, {},"Playlist deleted successfully"))
})

// update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if([name, description].includes(undefined)){
        throw new ApiError(400, "Name and description are required")
    };
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to update this playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $set: {
                name,
                description
            }
        },
        { new: true }
    );



    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Playlist updated successfully",
            updatedPlaylist
        )
    );
})

// get user playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    const playlists = await Playlist.aggregate([
        {
            $match:{
                owner: mongoose.Types.ObjectId(userId);
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $addFields:{
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                }
            }
        },
        {
            $project:{
                _id: 1,
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                updateAtt: 1,
                createdAt: 1

            }
        }
    ]);

    if(!playlists){
        throw new ApiError(404, "No playlists found")
    }

    return res.status(200).json(new ApiResponse(200, "Playlists fetched successfully", playlists))
})
// get playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.aggregate([
        {
            $match:{
                _id: mongoose.Types.ObjectId(playlistId);
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $match:{
                "videos.isPublic": true
            }
        },
        {
          $lookup:{
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
          }
        },
        {
            $addFields:{
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                },
                owner: {
                    $arrayElemAt: ["$owner", 0]
                }
            }
        },
        {
            $project:{
                _id: 1,
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                owner: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                },
                videos:{
                    _id: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    views: 1,
                    duration: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                },
                updatedAt: 1,
                createdAt: 1
            }
        }
    ]);

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, "Playlist fetched successfully", playlist))
})

// add video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist id or video id")
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to add videos to this playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            // we use addToSet to avoid adding duplicate videos if we use push, we can add the same video multiple times

            $addToSet: {
                videos: videoId
            }
        },
        { new: true }
    );

    if(!updatedPlaylist){
        throw new ApiError(500, "Something went wrong")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Video added to playlist successfully",
            updatedPlaylist
        )
    );
})

// remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist id or video id")
    }

    const playlist = await Playlist.findById(playlistId);   

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to remove videos from this playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $pull: {
                videos: videoId
            }
        },
        { new: true }
    );

    if(!updatedPlaylist){
        throw new ApiError(500, "Something went wrong")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            "Video removed from playlist successfully",
            updatedPlaylist
        )
    );

})



export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}