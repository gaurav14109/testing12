const express = require("express");
const router = express.Router();

const { requestController } = require("../controllers");

router.get("/", requestController.getAllRequests);

router.get("/recentActivities", requestController.getRecentActivities);

router.get("/pendingActivities", requestController.getLongPendingActivities);

router.get("/requestHistory/:requestId", requestController.getRequestHistory);

router.post("/requestHistory/:requestId", requestController.postRequestHistory);

router.get("/count", requestController.getRequestCount);

router.get("/activityLogs", requestController.getActivityLogs);

router.get("/activityLogs/count", requestController.getLogsCount);

module.exports = router;
