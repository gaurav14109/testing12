const asyncWrapper = require("../utils/asyncWrapper");
const { requestService } = require("../services");
const SuccessResponse = require("../utils/successResponse");

const getRequestCount = asyncWrapper(async (req, res) => {
  const response = await requestService.getRequestCount(req.query);
  return new SuccessResponse({ msg: response });
});

const getActivityLogs = asyncWrapper(async (req, res) => {
  const response = await requestService.getActivityLogs(req.query);
  return new SuccessResponse({ msg: response });
});

const postRequestHistory = asyncWrapper(async (req, res) => {
  const { status } = req.query;
  const { comment, name, email, user_id, pending_with } = req.body;
  const { requestId } = req.params;

  await requestService.postRequestHistory(
    status,
    comment,
    name,
    email,
    user_id,
    pending_with,
    requestId,
    req.protocol,
    req.hostname,
    req.originalUrl
  );
  return new SuccessResponse({ msg: `Request have been ${status}` });
});

const getRequestHistory = asyncWrapper(async (req, res) => {
  const { requestId } = req.params;
  const response = await requestService.getRequestHistory(requestId);
  return new SuccessResponse({ msg: response });
});

const getLongPendingActivities = asyncWrapper(async (req, res) => {

  const response = await requestService.getLongPendingActivities(req.query);
  return new SuccessResponse({ msg: response });
});

const getRecentActivities = asyncWrapper(async (req, res) => {

  const response = await requestService.getRecentActivities(req.query);
  return new SuccessResponse({ msg: response });
});

const getAllRequests = asyncWrapper(async (req, res) => {

  const response = await requestService.getAllRequests(req.query);
  return new SuccessResponse({ msg: response });
});


const getLogsCount = asyncWrapper(async (req, res) => {

  const response = await requestService.getLogsCount();
  return new SuccessResponse({ msg: response });
});


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
