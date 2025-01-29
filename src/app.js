import express from 'express';
import cors from 'cors';
import logger from "./logger.js";
import morgan from "morgan";
import cookieParser from "cookie-parser"
import errorHandler from "./middlewares/error.middlewares.js";

const app = express();

const morganFormat = ":method :url :status :response-time ms";

// Common middleware
app.use(cors({ origin:process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '16kb'}));
app.use(express.urlencoded({ extended: true}));
app.use(express.static('public'));

// Logging middleware
app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => {
          const logObject = {
            method: message.split(" ")[0],
            url: message.split(" ")[1],
            status: message.split(" ")[2],
            responseTime: message.split(" ")[3],
          };
          logger.info(JSON.stringify(logObject));
        },
      },
    })
  );

  
// import routes
import healthCheckRouter from './routes/healthCheck.routes.js';
import userRouter from './routes/user.routes.js';
import tweetRouter from './routes/tweet.routes.js';
import likeRouter from './routes/like.routes.js';
import commentRouter from './routes/comment.routes.js';
import videoRouter from './routes/video.routes.js';
import playlistRouter from './routes/playlist.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';

// routes
app.use('/api/v1/healthChecked', healthCheckRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tweets', tweetRouter);
app.use('/api/v1/like', likeRouter);
app.use("/api/v1/comment", commentRouter);
app.use('/api/v1/video', videoRouter);
app.use('/api/v1/playlist', playlistRouter);
app.use('/api/v1/dashboard', dashboardRouter);

// Error handling middleware
// app.use(errorHandler);
export { app };
