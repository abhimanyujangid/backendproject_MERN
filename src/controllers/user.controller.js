import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import logger from "../logger.js";
import {uploadOnCloudinary, deleteCloudinaryImage } from "../utils/cloudinary.js";

//============GENERATE ACCESS TOKEN & REFRESH TOKEN=====
const generateAccessAndRefreshToken = async (userId) => {
   try {
     const user = await User.findById(userId);
     if (!user) {
         throw new ApiError(404, "User not found.");
     }
     const accessToken = user.generateAccessToken();
     const refreshToken = user.generateRefreshToken();
     user.refreshToken = refreshToken;
     await user.save({ validateBeforeSave: false });
     return { accessToken, refreshToken };
     
   } catch (error) {
    throw new ApiError(500, "Error generating access and refresh tokens.");
   }
};

//=====================REGISTER USER=====================
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, username } = req.body;

    // Validate required fields
    if ([fullName, email, password, username].some(field => !field)) {
        throw new ApiError(400, "Please provide all required fields.");
    }

    // Check for existing user
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        throw new ApiError(400, "User with this email or username already exists.");
    }

    // Validate and upload avatar and cover image
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath || !coverImageLocalPath) {
        throw new ApiError(400, "Please provide both avatar and cover image.");
    }

    let avatar, coverImage;

    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
    } catch (error) {
        throw new ApiError(500, "Error uploading avatar image to Cloudinary.");
    }

    try {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    } catch (error) {
        throw new ApiError(500, "Error uploading cover image to Cloudinary.");
    }

    if (!avatar?.secure_url || !coverImage?.secure_url) {
        throw new ApiError(500, "Failed to upload images to Cloudinary.");
    }

   try {
     // Create user
     const user = await User.create({
         fullName,
         email,
         password,
         username: username.toLowerCase(),
         avatar: avatar.secure_url,
         coverImage: coverImage.secure_url
     });
 
     const createdUser = await User.findById(user._id).select("-password -refreshToken");
 
     if (!createdUser) {
         throw new ApiError(500, "User creation failed.");
     }
 
     res.status(201).json(new ApiResponse(201, "User created successfully", createdUser));
   } catch (error) {
     logger.error(`Error registering user: ${error.message}`);
     if(avatar) {
        await deleteCloudinaryImage(avatar.public_id);
     }
     if(coverImage) {
        await deleteCloudinaryImage(coverImage.public_id);
     }
     throw new ApiError(500, "User registration failed. And images were not uploaded.");
    
   }
});

//=====================LOGIN USER=====================
const login = asyncHandler(async (req, res)=> {
    const {username, email, password } = req.body;
    if([username, email, password].some(field => !field)) {
        throw new ApiError(400, "Please provide all required fields.");
    }
    const user = await User.findOne({
        $or:[{username: username.toLowerCase()}, {email: email.toLowerCase()}]
    });

    if(!user) {
        throw new ApiError(404, "User not found.");
    }

    if(!await user.isPasswordCorrect(password)) {
        throw new ApiError(401, "Incorrect password.");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    if(!loggedInUser) {
        throw new ApiError(500, "User not found.");
    }
    const options = 
    {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
    };

    res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(new ApiResponse(200, "User logged in successfully", loggedInUser));
});

//=====================LOGOUT USER=====================
const logout = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        throw new ApiError(400, "User ID is required.");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    // Clear the refresh token from the database
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    // Clear the cookies from the client
    res
        .status(200)
        .clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        })
        .clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        })
        .json(new ApiResponse(200, "User logged out successfully."));
});
//=====================FORGOT PASSWORD=====================
const forgotPassword = asyncHandler(async (req, res)=> {});
//=====================GET ME=====================
const getMe = asyncHandler(async (req, res)=> {});
//=====================UPDATE DETAILS=====================  
const updateDetails = asyncHandler(async (req, res)=> {});
//=====================UPDATE PASSWORD=====================
const updatePassword = asyncHandler(async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
        throw new ApiError(400, "Please provide userId, old password, and new password.");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isOldPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect.");
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json(new ApiResponse(200, "Password updated successfully."));
});
//=====================DELETE USER=====================
const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User ID is required.");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found.");
    }
    user.isActive = false;
    await user.save();
    res.status(200).json(new ApiResponse(200, "User deleted successfully (soft delete)."));
});
//=====================REACTIVATE ACCOUNT=====================
const reactivateAccount = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        throw new ApiError(400, "User ID is required.");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    if (user.isActive) {
        throw new ApiError(400, "Account is already active.");
    }

    user.isActive = true;
    await user.save();

    res.status(200).json(new ApiResponse(200, "Account reactivated successfully."));
});

//=====================GET USERS=====================
const getUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, isActive } = req.query;

    const query = {};
    if (isActive !== undefined) query.isActive = isActive === "true";

    const users = await User.find(query)
        .select("-password -refreshToken")
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const totalUsers = await User.countDocuments(query);

    res.status(200).json(new ApiResponse(200, "Users fetched successfully", { users, totalUsers }));
});
//=====================GET USER=====================
const getUser = asyncHandler(async (req, res)=> {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User ID is required.");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    res.status(200).json(new ApiResponse(200, "User fetched successfully", user));
});


export {
    registerUser,
    login,
    logout,
    forgotPassword,
    getMe,
    updateDetails,
    updatePassword,
    deleteUser,
    getUsers,
    getUser,
};
