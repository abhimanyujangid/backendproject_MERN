import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
import logger from "./logger.js";

dotenv.config({
    path: './.env'
})


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        logger.info(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    logger.error("MONGO db connection failed !!! ", err);
})
