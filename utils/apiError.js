const { StatusCodes } = require("http-status-codes");
class ApiError extends Error {
  statusCode;
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends ApiError {
  constructor(path) {
    super(StatusCodes.NOT_FOUND, `The requested path ${path} not found!`);
  }
}

class BadRequestError extends ApiError {
  constructor(message, errors) {
    super(StatusCodes.BAD_REQUEST, message, errors);
  }
}

class ApplicationError extends ApiError {
  constructor(message, errors = null) {
    super(StatusCodes.BAD_REQUEST, message, errors);
  }
}
module.exports = {
  ApiError,
  NotFoundError,
  BadRequestError,
  ApplicationError,
};
