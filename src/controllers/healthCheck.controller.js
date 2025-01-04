import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";


 const healthCheck = asyncHandler(async (req, res) => {
   try {
     return res
         .status(200)
         .json(new ApiResponse(200, "OK","Health check passed"));
   } catch (error) {
     return ApiResponse.error(res, error);
    
   }
});

export {healthCheck};