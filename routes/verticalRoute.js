const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const fileHandler = require("../utils/fileHandler/fileHandler");
const Security = require('../utils/Verticals/security')
const path = require("path");
const fileInstance = new fileHandler();
const security = new Security()

router.post("/security", (req, res) => {
  const accessToken = req.cookies["token"];
 
  verifyToken(accessToken);
  res.json({ message: "Hi" });
});

// router.post("/security", async (req, res) => {
//   const {menuName} = req.query
//   const {values} = req.body
//   await security.smr2BranchSaveToFLatFiles(values)
//   res.json({ message: "Hi" });
// });

router.get("/download/:verticalname/:filename", async (req, res) => {
  try {
    const { filename, verticalname } = req.params;
    const { fileStream, filePath } = await fileInstance.downloadTemplate(
      filename,
      verticalname
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + path.basename(filePath)
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader("Content-Type", "application/octet-stream");
    fileStream.pipe(res);
  } catch (error) {
    console.log(error.message);
    throw new BadRequestError(error.message);
  }
});

module.exports = router;
