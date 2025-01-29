# Backend Project - MERN Social Media

## Overview
This project is a **backend system** for a social media platform, built using a combination of modern technologies and optimized for performance. The backend is responsible for handling user authentication, media uploads, user interactions, and more. It is designed to be **scalable, secure, and efficient**, incorporating various best practices such as **MongoDB aggregation pipeline** for handling heavy computational tasks like counting subscriptions and improving performance.

## Features
- **User Authentication** (JWT-based authentication)
- **CRUD Operations** for users, tweets, comments, videos, playlists, and subscriptions
- **Like & Comment System** for user engagement
- **File Uploads** using Cloudinary
- **Role-based Access Control (RBAC)** for managing user permissions
- **Logging & Error Handling** using **Morgan & Winston**
- **Optimized Database Queries** using **MongoDB Aggregation Pipeline**
- **Environment-based Configuration**
- **CORS support** for secure API access

## Tech Stack
- **Node.js** - Backend runtime environment
- **Express.js** - Web framework for API handling
- **MongoDB + Mongoose** - Database & ORM
- **JWT (JSON Web Token)** - Secure authentication
- **Cloudinary** - Media storage & management
- **Multer** - File handling middleware
- **Morgan & Winston** - Logging & monitoring
- **Dotenv** - Environment variable management
- **Cors** - Cross-Origin Resource Sharing
- **Prettier & ESLint** - Code formatting & linting

## Project Structure
```
src/
 ├── controllers/       # Business logic handlers
 ├── db/                # Database connection
 ├── middlewares/       # Middleware functions (auth, error handling, etc.)
 ├── models/            # Mongoose models
 ├── routes/            # API routes
 ├── utils/             # Utility functions (logger, response handlers, etc.)
 ├── app.js             # Express app initialization
 ├── index.js           # Entry point
.env                    # Environment variables
.gitignore              # Git ignored files
package.json            # Dependencies & scripts
Readme.md               # Project documentation
```

## Environment Variables
The project uses the following environment variables stored in a `.env` file:
```
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRES=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

## API Endpoints
The API follows RESTful principles, and the available endpoints are:
| Method | Endpoint                | Description            |
|--------|-------------------------|------------------------|
| GET    | /api/v1/healthChecked   | Health check API      |
| POST   | /api/v1/users           | Create new user       |
| POST   | /api/v1/tweets          | Create a new tweet    |
| POST   | /api/v1/like            | Like a post           |
| POST   | /api/v1/comment         | Comment on a post     |
| GET    | /api/v1/video           | Fetch video details   |
| GET    | /api/v1/playlist        | Get playlists         |
| GET    | /api/v1/dashboard       | Admin dashboard data  |

## Logging System
This project implements a logging system using **Morgan and Winston**. All API requests are logged with details such as method, URL, response time, and status code.
```js
const morganFormat = ":method :url :status :response-time ms";
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
```

## Installation & Running Locally
### 1. Clone the Repository
```bash
git clone https://github.com/abhimanyujangid/backendproject_MERN.git
cd backendproject_MERN
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and fill in the required values (as mentioned in the **Environment Variables** section).

### 4. Run the Server in Development Mode
```bash
npm run dev
```

The server should now be running on `http://localhost:8000`.

## Future Enhancements
- Implement WebSockets for real-time messaging and notifications
- Improve database indexing for faster queries
- Add GraphQL support for more flexible data fetching
- Introduce AI-based recommendations for content discovery

## Special Thanks
This project was made possible through the teachings of **Hitesh Choudhary Sir**. I learned a lot about writing clean and efficient code from him, and this project reflects those principles. Thank you, sir, for your guidance and mentorship!

## Contributing
If you'd like to contribute, feel free to fork the repo and submit a pull request. Suggestions and improvements are always welcome!

## Author
Developed by **Abhimanyu Jangid**

---