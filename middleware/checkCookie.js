const { UnAuthorizedError } = require("../utils/UnthorizedError");
const SuccessResponse = require("../utils/successResponse");
const { verifyRefreshToken } = require("./verifyToken");
const { generateCsrfToken } = require("../middleware/generateCsrf");
const { generateAccessToken } = require("../middleware/generateToken");
const checkCookie = (refreshToken, csrfToken) => {
  if (!refreshToken || !csrfToken) {
    throw new UnAuthorizedError("Invalid Csrf or Refresh Token!");
  }
  const { name, email, role, vertical_name, user_id, active, delegate_to } = verifyRefreshToken(refreshToken);

  //generate new access token and csrf token
  const accessToken = generateAccessToken({
    name: name,
    email: email,
    role: role,
    vertical_name: vertical_name,
    user_id: user_id,
    active: active,
    delegate_to: delegate_to,
  });
  csrfToken = generateCsrfToken();

  const data = {
    accessToken: accessToken,
    csrf: csrfToken,
    name: name,
    email: email,
    role: role,
    vertical_name: vertical_name,
    user_id: user_id,
    active: active,
    delegate_to: delegate_to
  };
  return data;
};

module.exports = { checkCookie };
