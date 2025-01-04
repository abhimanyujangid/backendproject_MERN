import {v2 as cloudinary} from 'cloudinary';
import logger from '../logger.js';
import {promisify} from 'util';
import stream from 'stream';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
}); 


const deleteFile = promisify(fs.unlink);

const uploadOnCloudinary = async (localFilePath) => {
    if (!fs.existsSync(localFilePath)) {
        return null;
    }
    const passthrough = new stream.PassThrough();
    const uploadPromise = cloudinary.uploader.upload_stream({
        resource_type: "auto",
    }, (error, result) => {
        if (error) {
            logger.error(`Error uploading file to cloudinary: ${error}`);
            return deleteFile(localFilePath);
        }
        logger.info(`File uploaded on cloudinary: ${result.secure_url}`);
        deleteFile(localFilePath);
        return result;
    });
    fs.createReadStream(localFilePath).pipe(passthrough).pipe(uploadPromise);
    return uploadPromise;
};

export default uploadOnCloudinary;
