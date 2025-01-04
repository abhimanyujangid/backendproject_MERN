import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import logger from "../logger.js";


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        logger.info(` MongoDB connected !! DB HOST: ${connectionInstance.connection.host}/${DB_NAME}`);
    } catch (error) {
      logger.error("MongoDB Connection Failed", error);
      process.exit(1);
    }
  }
  
  export default connectDB;