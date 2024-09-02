const { UnAuthorizedError } = require("../utils/UnthorizedError");
const jwt = require("jsonwebtoken");
//To verify is token is valid
const verifyToken = (token) => {
  try {
    jwt.verify(token, "1234");
    return true;
  } catch (err) {
    console.log(err.message);
    if (err.message === "invalid signature") {
      throw new UnAuthorizedError("Invalid Token");
    } else if (err.message === "jwt expired") {
      throw new UnAuthorizedError("Token Expired");
    } else if (err.message === "jwt must be provided") {
      throw new UnAuthorizedError("jwt must be provided");
    }
  }
};

const verifyRefreshToken = (refreshToken) => {
  try {
    const token = jwt.verify(refreshToken, "1234");
    return token;
  } catch (err) {
    if (err.message === "invalid signature") {
      throw new UnAuthorizedError("Invalid Refresh Token");
    } else if (err.message === "jwt expired") {
      throw new UnAuthorizedError("refresh Token Expired");
    }
  }
};

module.exports = { verifyToken, verifyRefreshToken };
