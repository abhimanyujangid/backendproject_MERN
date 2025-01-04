import logger from "../logger.js";

class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false;
    this.data = null;

    if(stack){
        this.stack = stack;
    }{
        Error.captureStackTrace(this, this.constructor);
    }

    // Set the prototype explicitly    
    // Log the error
    logger.error(`ApiError: ${this.message}, StatusCode: ${this.statusCode}, Error: ${JSON.stringify(this.errors)}`);
  }
}

export  {ApiError};
