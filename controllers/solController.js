const sols = require("../database/sols");
const SuccessResponse = require("../utils/successResponse");
const asyncWrapper = require("../utils/asyncWrapper");

const searchSols = asyncWrapper(async (req, res) => {
  const { sol } = req.query;
  const result = await sols.searchSol(sol);
  return new SuccessResponse({ msg: result });
});

module.exports = { searchSols };
