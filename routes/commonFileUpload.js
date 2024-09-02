const express = require("express");
const router = express.Router();
const upload = require("../middleware/fileUpload");

const { commonFileUploadController } = require("../controllers");

router.post("/", upload, commonFileUploadController.uploadFile);

router.post("/replaceFile", upload, commonFileUploadController.replaceFile);

router.post("/download", commonFileUploadController.downloadCommonFile);

router.post("/checkFile", commonFileUploadController.checkFile);
module.exports = router;
