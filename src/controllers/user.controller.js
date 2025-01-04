import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import uploadCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

//=====================REGISTER USER=====================
const registerUse = asyncHandler(async (req, res)=> {

    const { fullname, email, password,username } = req.body;
    if([fullname, email, password,username].some(field => field === undefined)){
        throw new ApiError(400, "Please provide all fields");
    }
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
        });

    if(existingUser){
        throw new ApiError(400, "User already exists");
    }
    const avatarLocalPath = req.file?.avatar[0]?.path;
    const coverImageLocalPath = req.file?.coverImage[0]?.path;

    if(!avatarLocalPath || !coverImageLocalPath){
        throw new ApiError(400, "Please provide avatar and cover image");
    }
    const avatar = await uploadCloudinary(avatarLocalPath);
    const coverImage = await uploadCloudinary(coverImageLocalPath);

    const user = await User.create({
        fullname,
        email,
        password: User.hashPassword(password),
        username: username.toLowerCase(),
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
    })
    
    const createUser = await user.findBYIb(user._id).select("-password -refreshToken");

    if(!createUser){
        throw new ApiError(500, "User not found");
    }
    res.status(201)
    .json( new ApiResponse(201, "User created successfully", createUser));
});
//=====================LOGIN USER=====================
const login = asyncHandler(async (req, res)=> {});
//=====================LOGOUT USER=====================
const logout = asyncHandler(async (req, res)=> {});
//=====================FORGOT PASSWORD=====================
const forgotPassword = asyncHandler(async (req, res)=> {});
//=====================RESET PASSWORD=====================
const resetPassword = asyncHandler(async (req, res)=> {});
//=====================GET ME=====================
const getMe = asyncHandler(async (req, res)=> {});
//=====================UPDATE DETAILS=====================  
const updateDetails = asyncHandler(async (req, res)=> {});
//=====================UPDATE PASSWORD=====================
const updatePassword = asyncHandler(async (req, res)=> {});
//=====================DELETE USER=====================
const deleteUser = asyncHandler(async (req, res)=> {});
//=====================GET USERS=====================
const getUsers = asyncHandler(async (req, res)=> {});
const getUser = asyncHandler(async (req, res)=> {});
const updateUser = asyncHandler(async (req, res)=> {});

export { registerUse, login, logout, forgotPassword, resetPassword, getMe, updateDetails, updatePassword, deleteUser, getUsers, getUser, updateUser };