const { ApiError } = require("./apiError");
const { StatusCodes } = require("http-status-codes");
class UnAuthorizedError extends ApiError {
  constructor(message) {
    super(StatusCodes.UNAUTHORIZED, message);
  }
}
module.exports = {
  UnAuthorizedError,
};
