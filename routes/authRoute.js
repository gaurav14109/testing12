const express = require("express");
const router = express.Router();

const { authController } = require("../controllers");

router.get("/start", authController.start);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/refresh", authController.refresh);

module.exports = router;
