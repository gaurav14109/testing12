const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");

router.get("/", userController.getAllUsers);
router.get("/count", userController.getUserCount);
router.get("/search_user", userController.searchUsers);
router.get("/verticalName",userController.getUserByVerticalName)
router.get("/roles",userController.getUserRoles);
router.post("/", userController.addUser);
router.put("/",userController.updateUser);
router.put("/setStatus",userController.updateUserStatus);
router.post("/AssignDelegate",userController.assignDelegate);
router.put("/removeDelegate",userController.removeDelegate);


module.exports = router;