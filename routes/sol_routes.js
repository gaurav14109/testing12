const express = require("express");
const router = express.Router();
const solController = require('../controllers/solController')
router.get("/search_sol", solController.searchSols);

module.exports = router