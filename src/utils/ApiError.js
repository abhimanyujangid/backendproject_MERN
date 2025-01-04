import logger from "../logger.js";

class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the prototype explicitly
    Object.setPrototypeOf(this, ApiError.prototype);

    // Log the error
    logger.error(`ApiError: ${this.message}, StatusCode: ${this.statusCode}, Error: ${JSON.stringify(this.errors)}`);
  }
}

export { ApiError };

