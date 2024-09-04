import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // Correct import

const app = express();

// Middleware setup
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser()); // Correct usage

// Routes import
import userRouter from './routes/user.routes.js';
import tweetRouter from './routes/tweet.routes.js'
import commentRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/comment",commentRouter);
app.use("/api/v1/likes",likeRouter);


export { app };
