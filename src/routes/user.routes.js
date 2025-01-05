import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { login, logout, registerUser, updatePassword, getUser, getAllUsers,updateAvatarAndCoverImage,getCurrentUser,deactivateUser,reactivateAccount,refreshAccessToken,updateAccountDetails } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

//secure route
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);
router.route("/updatePassword").put(verifyJWT, updatePassword);
router.route("/:userId").get(verifyJWT, getUser);
// router.route("/allUser").get(verifyJWT, getAllUsers);
router.route("/user").get(verifyJWT, getCurrentUser);
router.route("/deactivate").put(verifyJWT, deactivateUser);
router.route("reactivate").put(reactivateAccount);
router.route("/update").put(verifyJWT, updateAccountDetails);

// Route for refreshing access token
router.route("/refresh-token").post(refreshAccessToken);

// Route for updating avatar and cover image
router.route("/user/avatar-cover").put(
    verifyJWT,
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    updateAvatarAndCoverImage
);


export default router;
