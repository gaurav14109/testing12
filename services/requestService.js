const Requests = require("../database/requests");
const activityLogs = require("../database/activityLog");
const requestInstance = new Requests();
const getMonth = require("../middleware/returnMonth");
const fileHandler = require("../utils/fileHandler/fileHandler");

const fileHandlerInstance = new fileHandler();

const requestStatus = {
  Approved: async (
    request_id,
    comment,
    name,
    email,
    url,
    user_id,
    pending_with
  ) => {
    const result = await requestInstance.updateRequests(request_id, "Approved");
    await requestInstance.addRequestHistory(
      result.request_id,
      comment,
      name,
      ""
    );

    let tempQtr = result.qtr.split("-");
    let verifiedPath;
    let uploadedPath;
    let monthName;
    if (tempQtr.length > 1) {
      monthName = getMonth(tempQtr[1]);
      monthly = true;
      verifiedPath = `/ENCRYPTED_LDZ/GAP/${result.vertical_name}/${result.report_name}/${result.year}/${monthName}/${result.qtr}`;
      uploadedPath = `/ENCRYPTED_LDZ/FLATFILES/GAP/${result.vertical_name}/${result.report_name}/${result.year}/${monthName}/${result.qtr}`;
    } else {
      verifiedPath = `/ENCRYPTED_LDZ/GAP/${result.vertical_name}/${result.report_name}/${result.year}/${result.qtr}`;
      uploadedPath = `/ENCRYPTED_LDZ/FLATFILES/GAP/${result.vertical_name}/${result.report_name}/${result.year}/${result.qtr}`;
    }

    await fileHandlerInstance.moveFileToHdfsParquet(
      result.file_name,
      verifiedPath,
      uploadedPath,
      result.report_name,
      result.override
    );

    await activityLogs.addActivity(
      email,
      url,
      200,
      user_id,
      `Approved Request ${result.request_id}`,
      result.vertical_name,
      "POST"
    );
    return;
  },

  Cancelled: async (
    request_id,
    comment,
    name,
    email,
    url,
    user_id,
    pending_with
  ) => {
    const result = await requestInstance.updateRequests(
      request_id,
      "Cancelled"
    );
    await requestInstance.addRequestHistory(
      result.request_id,
      comment,
      name,
      pending_with
    );

    await activityLogs.addActivity(
      email,
      url,
      200,
      user_id,
      `Cancelled Request ${result.request_id}`,
      result.vertical_name,
      "POST"
    );
    return;
  },
  Rejected: async (
    request_id,
    comment,
    name,
    email,
    url,
    user_id,
    pending_with
  ) => {
    const result = await requestInstance.updateRequests(
      request_id,
      "Returned To Maker"
    );
    await activityLogs.addActivity(
      email,
      url,
      200,
      user_id,
      `returned Request ${result.request_id}`,
      result.vertical_name,
      "POST"
    );
    await requestInstance.addRequestHistory(
      result.request_id,
      comment,
      name,
      pending_with
    );
    return;
  },
  //Replied is by the Maker only.
  Replied: async (
    request_id,
    comment,
    name,
    email,
    url,
    user_id,
    pending_with
  ) => {
    const result = await requestInstance.updateRequests(request_id, "Pending");
    await requestInstance.addRequestHistory(
      result.request_id,
      comment,
      name,
      pending_with
    );
    await activityLogs.addActivity(
      email,
      url,
      200,
      user_id,
      `Replied Request ${result.request_id}`,
      result.vertical_name,
      "POST"
    );
    return;
  },
};

const getRequestCount = async (data) => {
  const response = await requestInstance.getCount(data);
  return response;
};

const getActivityLogs = async (query) => {
  const results = await activityLogs.getAllActivity(query);
  return results;
};

const postRequestHistory = async (
  status,
  comment,
  name,
  email,
  user_id,
  pending_with,
  requestId,
  protocol,
  host,
  originalUrl
) => {
  await requestStatus[status](
    requestId,
    comment,
    name,
    email,
    `${protocol}://${host}${originalUrl}`,
    user_id,
    pending_with
  );
  return;
};

const getRequestHistory = async (requestId) => {
  const response = await requestInstance.getRequestHistory(requestId);
  return response;
};

const getLongPendingActivities = async (query) => {
  const response = await requestInstance.getLongPendingActivities(query);
  return response;
};

const getRecentActivities = async (query) => {
  const response = await requestInstance.getRecentActivities(query);
  return response;
};

const getAllRequests = async (query) => {
  const response = await requestInstance.getAllRequests(query);
  return response;
};

const getLogsCount = async () => {
  const response = await activityLogs.getLogsCount();
  return response;
};



module.exports = {
  getRequestCount,
  getActivityLogs,
  postRequestHistory,
  getRequestHistory,
  getLongPendingActivities,
  getRecentActivities,
  getAllRequests,
  getLogsCount
};
