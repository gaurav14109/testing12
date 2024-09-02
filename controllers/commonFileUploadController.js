const asyncWrapper = require("../utils/asyncWrapper");
const { commonFileUploadService } = require("../services");
const SuccessResponse = require("../utils/successResponse");
const path = require("path");
const fs = require("fs");

const uploadFile = asyncWrapper(async (req, res) => {
  let {
    vertical_name,
    year,
    qtr,
    report_name,
    common_file_upload,
    override,
    menu,
    user_id,
    requestor_name,
    email,
  } = req.body;
  await commonFileUploadService.uploadFile(
    vertical_name,
    year,
    qtr,
    report_name,
    common_file_upload,
    override,
    menu,
    user_id,
    requestor_name,
    email,
    req.protocol,
    req.hostname,
    req.originalUrl,
    req.file.originalname
  );
  return new SuccessResponse({ msg: "File Uploaded Successfully" });
});

const replaceFile = asyncWrapper(async (req, res) => {
  let fileName = req.file.originalname;
  const { vertical_name, year, qtr, report_name } = req.body;
  await commonFileUploadService.replaceFile(
    vertical_name,
    year,
    qtr,
    report_name,
    req.protocol,
    req.hostname,
    req.originalUrl,
    fileName
  );
  return new SuccessResponse({ msg: "File Replaced Successfully" });
});

const downloadCommonFile = asyncWrapper(async (req, res) => {
  return new Promise(async (resolve, reject) => {
    const { vertical_name, year, qtr, report_name, file_name } = req.body;

    const { fileStream, filePath } =
      await commonFileUploadService.downloadCommonFile(
        vertical_name,
        year,
        qtr,
        report_name,
        file_name
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

    res.on("finish", () => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error removing file ${filePath}:`, err);
        } else {
          console.log(`File ${filePath} removed successfully`);
          return resolve({ statusCode: 200 });
        }
      });
    });
  });
});

const checkFile = asyncWrapper(async (req, res) => {
  const { vertical_name, year, qtr, report_name, file_name } = req.body;
  const response = await commonFileUploadService.checkFile(
    vertical_name,
    year,
    qtr,
    report_name,
    file_name
  );
  return new SuccessResponse(response);
});

module.exports = {
  uploadFile,
  replaceFile,
  downloadCommonFile,
  checkFile,
};
