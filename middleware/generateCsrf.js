const crypto = require("crypto");

const generateCsrfToken = () => {
  const csrfToken = crypto.randomBytes(32).toString("hex");
  return csrfToken;
};

module.exports = {generateCsrfToken};
