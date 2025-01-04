import { v2 as cloudinary } from 'cloudinary';
import logger from '../logger.js';
import fs from 'fs';
import { promisify } from 'util';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const deleteFile = promisify(fs.unlink);

const uploadOnCloudinary = async (localFilePath) => {
    if (!fs.existsSync(localFilePath)) {
        throw new Error("File does not exist at the specified path.");
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            async (error, result) => {
                // Delete the local file after processing
                await deleteFile(localFilePath).catch(err => {
                    logger.error(`Error deleting file: ${err.message}`);
                });

                if (error) {
                    logger.error(`Error uploading file to Cloudinary: ${error.message}`);
                    return reject(error);
                }

                logger.info(`File successfully uploaded to Cloudinary: ${result.secure_url}`);
                resolve(result);
            }
        );

        // Pipe file to Cloudinary
        fs.createReadStream(localFilePath).pipe(uploadStream);
    });
};

const deleteCloudinaryImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
        logger.info(`Image successfully deleted from Cloudinary: ${publicId}`);
    } catch (error) {
        logger.error(`Error deleting image from Cloudinary: ${error.message}`);
        return null;
    }
};

export  {uploadOnCloudinary, deleteCloudinaryImage};
