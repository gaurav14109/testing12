const fileHandler = require("../utils/fileHandler/fileHandler");
const getMonth = require("../middleware/returnMonth");
const users = require("../database/users");
const Requests = require("../database/requests");
const { BadRequestError } = require("../utils/apiError");
const activityLogs = require("../database/activityLog");

const fileInstance = new fileHandler();
const userinst = new users();
const requestInstance = new Requests();

const uploadFile = async (
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
  protocol,
  host,
  originalUrl,
  originalname
) => {
  try {
    let fileName = originalname;
    let path;
    let monthly = false;
    let result;
    let tempQtr = qtr.split("-");
    let monthName;
    if (tempQtr.length > 1) {
      monthName = getMonth(tempQtr[1]);
      monthly = true;
      path = `/ENCRYPTED_LDZ/FLATFILES/GAP/${vertical_name}/${report_name}/${year}/${monthName}/${qtr}`;
    } else {
      path = `/ENCRYPTED_LDZ/FLATFILES/GAP/${vertical_name}/${report_name}/${year}/${qtr}`;
    }

    result = await fileInstance.pathExists(path);
    if (!result) {
      await fileInstance.createFolderUploaded(path);
    }
    const fileCount = await fileInstance.fileCount(fileName, path);
    const newFileName = await fileInstance.moveFileToUploaded(
      fileName,
      vertical_name,
      year,
      qtr,
      report_name,
      fileCount,
      monthly,
      monthName
    );
    const checkers = await userinst.getVerticalCheckers(vertical_name);
    let index = Math.floor(Math.random() * checkers.length) + 1;

    result = await requestInstance.addNewRequest(
      vertical_name,
      year,
      qtr,
      report_name,
      common_file_upload,
      override,
      menu,
      user_id,
      newFileName,
      requestor_name,
      checkers[index - 1].email,
      checkers[index - 1].employee_name
    );
    await requestInstance.addRequestHistory(
      result.request_id,
      "New File Uploaded",
      result.requestor_name,
      checkers[index - 1].employee_name
    );
    const description = `Uploaded a New File Under Vertical ${vertical_name}`;
    await activityLogs.addActivity(
      email,
      `${protocol}://${host}${originalUrl}`,
      200,
      user_id,
      description,
      vertical_name,
      "POST"
    );
    return;
  } catch (err) {
    await activityLogs.addActivity(
      email,
      `${protocol}://${host}${originalUrl}`,
      400,
      user_id,
      "File Upload failed",
      vertical_name,
      "POST"
    );
    throw new BadRequestError(err.message);
  }
};

const replaceFile = async (
  vertical_name,
  year,
  qtr,
  report_name,
  protocol,
  host,
  originalUrl,
  fileName
) => {
  let hdfsPath;
  let tempQtr = qtr.split("-");
  let monthName;
  if (tempQtr.length > 1) {
    monthName = getMonth(tempQtr[1]);
    monthly = true;
    hdfsPath = `/ENCRYPTED_LDZ/FLATFILES/GAP/${vertical_name}/${report_name}/${year}/${monthName}/${qtr}`;
  } else {
    hdfsPath = `/ENCRYPTED_LDZ/FLATFILES/GAP/${vertical_name}/${report_name}/${year}/${qtr}`;
  }

  try {
    await fileInstance.replaceFileToUploaded(fileName, hdfsPath);
    return;
  } catch (err) {
    console.log(err.mesage);
    throw new BadRequestError(err.message);
  }
};

const downloadCommonFile = async (
  vertical_name,
  year,
  qtr,
  report_name,
  file_name
) => {
  let hdfsPath;
  let tempQtr = qtr.split("-");
  let monthName;
  if (tempQtr.length > 1) {
    monthName = getMonth(tempQtr[1]);
    monthly = true;
    hdfsPath = `/ENCRYPTED_LDZ/FLATFILES/GAP/${vertical_name}/${report_name}/${year}/${monthName}/${qtr}`;
  } else {
    hdfsPath = `/ENCRYPTED_LDZ/FLATFILES/GAP/${vertical_name}/${report_name}/${year}/${qtr}`;
  }
  try {
    const { fileStream, filePath } = await fileInstance.downloadFileUploaded(
      file_name,
      hdfsPath
    );
    return { fileStream, filePath };
  } catch (error) {
    console.log(error.message);
    throw new BadRequestError(error.message);
  }
};

const checkFile = async (vertical_name, year, qtr, report_name, file_name) => {
  let tempQtr = qtr.split("-");
  let monthName;
  let newFileName;
  let path;
  if (tempQtr.length > 1) {
    monthName = getMonth(tempQtr[1]);
    monthly = true;
    path = `/ENCRYPTED_LDZ/FLATFILES/GAP/${vertical_name}/${report_name}/${year}/${monthName}/${qtr}`;
  } else {
    path = `/ENCRYPTED_LDZ/FLATFILES/GAP/${vertical_name}/${report_name}/${year}/${qtr}`;
  }
  result = await fileInstance.pathExists(path);
  if (result) {
    const fileCount = await fileInstance.fileCount(file_name, path);
    if (fileCount.length > 0) {
      let tempFileName = file_name.split(".");
      newFileName =
        tempFileName[0] + `_${fileCount.length + 1}` + "." + tempFileName[1];
    } else {
      newFileName = file_name;
    }
    if (file_name === newFileName) {
      return {
        msg: `New File Upload`,
      };
    }
    return {
      msg: `File Already Exists with Name ${file_name} will be uploaded as
      ${newFileName}
     Please Select Overwrite and Append Wisely!`,
    };
  } else {
    return {
      msg: `No File Exists`,
    };
  }
};
module.exports = {
  uploadFile,
  replaceFile,
  downloadCommonFile,
  checkFile,
};
