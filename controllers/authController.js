const SuccessResponse = require("../utils/successResponse");
const asyncWrapper = require("../utils/asyncWrapper");
const { authService } = require("../services");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middleware/generateToken");
const { checkCookie } = require("../middleware/checkCookie");

const { generateCsrfToken } = require("../middleware/generateCsrf");
const { verifyRefreshToken } = require("../middleware/verifyToken");

const login = asyncWrapper(async (req, res) => {
  let { username, password } = req.body;
  const response = await  authService.login(username, password);
  const options = {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    path: "/",
  };
  const accessToken = generateAccessToken(response);
  const refreshToken = generateRefreshToken(response);
  const csrfToken = generateCsrfToken();

  res
    .cookie("refreshToken", refreshToken, options)
    .cookie("token", accessToken, options)
    .cookie("csrf-token", csrfToken, options);
  const data = { accessToken: accessToken, csrf: csrfToken,...response };
  return new SuccessResponse(data);
});

const logout = asyncWrapper(async (req, res) => {
  res.clearCookie("refreshToken");
  res.clearCookie("csrf-token");
  res.clearCookie("token");
  return new SuccessResponse({ message: "logged out Successfully" });
});

const refresh = asyncWrapper(async (req, res) => {
  const { refreshToken } = req.cookies;
  const { name, email, role,vertical_name, user_id,active,delegate_to } = verifyRefreshToken(refreshToken);

  //generate new access token and csrf token
  const accessToken = generateAccessToken({ name: name, email: email, role:role,vertical_name: vertical_name,
  user_id:user_id,active:active,delegate_to:delegate_to});
  const csrfToken = generateCsrfToken();
  const options = {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  };
  res
    .cookie("csrf-token", csrfToken, options) 
    .cookie("token", accessToken, options);
  const data = { accessToken: accessToken, csrf: csrfToken, role:role, name:name, email:email, role:role,vertical_name: vertical_name,
    user_id:user_id,active:active,delegate_to:delegate_to };
  return new SuccessResponse(data);
});

const start = asyncWrapper(async (req, res) => {
  const { refreshToken } = req.cookies;
  const csrfToken = req.cookies["csrf-token"];
  const data = checkCookie(refreshToken, csrfToken);
  const options = {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  };
  res
    .cookie("csrf-token", data.csrf, options)
    .cookie("token", data.accessToken, options);
  return new SuccessResponse(data);
});
module.exports = { login, logout, refresh, start };