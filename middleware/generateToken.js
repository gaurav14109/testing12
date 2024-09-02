const jwt = require("jsonwebtoken");

const generateAccessToken = (data) => {
  return jwt.sign(data, "1234", {
    expiresIn: "5s",
  });
};

const generateRefreshToken = (data) => {
  return jwt.sign(data, "1234", {
    expiresIn: "1d",
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
