const validateCsrf = (req, res, next) => {
  if (req.headers["x-csrf-token"] !== req.cookies["csrf-token"]) {
    throw new UnAuthorizedError(403, "Invalid Csrf Token!");
  }
  next();
};
