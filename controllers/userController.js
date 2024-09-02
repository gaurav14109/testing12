const {
  userSchema,
  updateUserSchema,
} = require("../middleware/validations/users");
const { userService } = require("../services");
const activityLogs = require("../database/activityLog");
const { ApplicationError } = require("../utils/apiError");
const asyncWrapper = require("../utils/asyncWrapper");
const SuccessResponse = require("../utils/successResponse");
const Requests = require("../database/requests");
const requestInstance = new Requests();

const addUser = asyncWrapper(async (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    console.log(error);
  } else {
    if (value.role_name === "Admin") {
      const count = await userService.checkAdminCount();
      if (count.length > 1) {
        throw new ApplicationError("Two Admin Already Avaliable.");
      }
    }
    const userCount = await userService.checkPfNo(value.pf_no);
    if (userCount.length > 0) {
      throw new ApplicationError("User Already Available With Same PF No.");
    }
    await userService.addUser(value);

    await activityLogs.addActivity(
      value.adminDetails.email,
      `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      200,
      value.adminDetails.user_id,
      `Successfully Added New User with Name ${value.employee_name}`,
      "ALL",
      "POST"
    );
    return new SuccessResponse({ msg: "User Added Successfully" });
  }
});

const updateUser = asyncWrapper(async (req, res) => {
  const { error, value } = updateUserSchema.validate(req.body);
  if (error) {
  } else {
    if (value.role_name === "Admin") {
      const count = await userService.checkAdminCount();
      if (count.length > 1) {
        throw new ApplicationError("Two Admin Already Avaliable.");
      }
    }
    const result = await userService.updateUser(value);
    await activityLogs.addActivity(
      value.adminDetails.email,
      `${req.protocol}://${req.get("host")}${req.originalUrl}`,
      200,
      value.adminDetails.user_id,
      `Successfully Updated New User with Name ${value.employee_name}`,
      "ALL",
      "POST"
    );
    return new SuccessResponse({ msg: "User Updated Successfully" });
  }
});

const getAllUsers = asyncWrapper(async (req, res) => {
  const response = await userService.getAllUsers(req.query);
  return new SuccessResponse({ msg: response });
});

const searchUsers = asyncWrapper(async (req, res) => {
  const { pfNo } = req.query;
  const response = await userService.searchUsers(pfNo);
  return new SuccessResponse({ msg: response });
});

const updateUserStatus = asyncWrapper(async (req, res) => {
  const { error, value } = updateUserSchema.validate(req.body);
  if (error) {
    throw new Error(error.message);
  } else {
    await userService.updateUserStatus(value);

    if (!value.active) {
      await activityLogs.addActivity(
        value.adminDetails.email,
        `${req.protocol}://${req.get("host")}${req.originalUrl}`,
        200,
        value.adminDetails.user_id,
        `User Id ${value.user_id} Deactivated Successfully`,
        "ALL",
        "PUT"
      );
      return new SuccessResponse({ msg: "User Deactivated Successfully" });
    } else {
      await activityLogs.addActivity(
        value.adminDetails.email,
        `${req.protocol}://${req.get("host")}${req.originalUrl}`,
        200,
        value.adminDetails.user_id,
        `User Id  ${value.user_id} Activated Successfully`,
        "ALL",
        "PUT"
      );
      return new SuccessResponse({ msg: "User Activated Successfully" });
    }
  }
});

const getUserRoles = asyncWrapper(async (req, res) => {
  const result = await userService.getUserRoles();
  const recentActivities = await requestInstance.getVerticalRecentActivity();
  let transformedData = {};
  result.forEach((row) => {
    if (!transformedData[row.vertical_name]) {
      transformedData[row.vertical_name] = {
        vertical: row.vertical_name,
        maker: [],
        checker: [],
        recentActivity: null,
      };
    }
    if (row.role_name === "Maker") {
      transformedData[row.vertical_name].maker.push(row.employee_name);
    } else if (row.role_name === "Checker") {
      transformedData[row.vertical_name].checker.push(row.employee_name);
    }
  });
  recentActivities.forEach((activity) => {
    if (transformedData[activity.vertical_name]) {
      transformedData[activity.vertical_name].recentActivity =
        activity.created_date;
    }
  });
  transformedData = Object.values(transformedData);
  return new SuccessResponse({ msg: transformedData });
});

const getUserByVerticalName = asyncWrapper(async (req, res) => {
  const { vertical_name } = req.query;
  const result = await userService.getUserByVerticalName(vertical_name);
  return new SuccessResponse({ msg: result });
});

const assignDelegate = asyncWrapper(async (req, res) => {
  const { adminDetails } = req.body;
  const result = await userService.assignDelegate(req.body);
  await activityLogs.addActivity(
    adminDetails.email,
    `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    200,
    adminDetails.user_id,
    `Successfully Assigned Delegate`,
    "ALL",
    "POST"
  );
  return new SuccessResponse({ msg: "Successfully Assigned Delegate" });
});

const removeDelegate = asyncWrapper(async (req, res) => {
  const result = await userService.removeDelegate(req.body);
  await activityLogs.addActivity(
    adminDetails.email,
    `${req.protocol}://${req.get("host")}${req.originalUrl}`,
    200,
    adminDetails.user_id,
    `Successfully Removed Delegate`,
    "ALL",
    "PUT"
  );
  return new SuccessResponse({ msg: "Successfully Removed Delegate" });
});

const getUserCount = asyncWrapper(async (req, res) => {
  const response = await userService.getUserCount();
  return new SuccessResponse({ msg: response });
});

module.exports = {
  addUser,
  updateUser,
  getAllUsers,
  searchUsers,
  updateUserStatus,
  getUserRoles,
  getUserByVerticalName,
  assignDelegate,
  removeDelegate,
  getUserCount,
};
