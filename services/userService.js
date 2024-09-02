const users = require("../database/users");
// const { ldapFindUser } = require("../utils/ldap_helper");
const SuccessResponse = require("../utils/successResponse");

const userInstance = new users();
const addUser = async (data) => {
  await userInstance.addUsers(data);
  return;
};


const updateUser = async (data) => {
  await userInstance.updateUser(data);
  return true;
};

const getAllUsers = async (query) => {
  const data = await userInstance.getAllUsers(query);
  return data;
};

const searchUsers = async (pfNo) => {
  console.log(pfNo);
  // const data = await ldapFindUser(pfNo);
  // console.log(data);
  // return data;
  return [{id:99,email:"ashish@gmail.com",pf_no:pfNo,employee_name:"Ashish"}]
};

const updateUserStatus = async (data) => {
  const result = await userInstance.updateUserStatus(data);
  return result;
};

const checkAdminCount = async () => {
  const rows = await userInstance.checkAdminCount();
  return rows;
};

const checkPfNo = async (pfno) => {
  const rows = await userInstance.checkPfNo(pfno);
  return rows;
};

const getUserRoles = async () => {
  const result = await userInstance.getAllUsersActive();
  return result;
};

const getUserByVerticalName = async (vertical_name) => {
  const result = await userInstance.getAllUsersByVertical(vertical_name);
  return result;
};

const assignDelegate = async (data) => {
  let date = new Date();
  date = date.toString().substring(0, 10);
  const start_date = new Date(data.start_date).toString().substring(0, 10);
  let status = "Activation Scheduled";
  if (date === start_date) {
    status = "Active";
  }
  data = { ...data, status: status };
  const result = await userInstance.assignDelegate(data);

  if (status === "Active") {
    data = {
      role: "Maker,Delegate",
      updated_by: data.updated_by,
      user_id: data.delegate_user_id,
    };
    await userInstance.updateUserRole(data);
  }
  return result;
};

const removeDelegate = async (data) => {
  await userInstance.updateDelegate({...data,status:"Inactive"});
  data = {
    role: "Maker",
    updated_by: data.updated_by,
    user_id: data.user_id,
  };
  await userInstance.updateUserRole(data);
  return new SuccessResponse({ msg: "Successfully Removed Delegate" });
};

const getUserCount = async () => {
  const data = await userInstance.getUserCount();
  return data;
}


module.exports = {
  addUser,
  updateUser,
  getAllUsers,
  searchUsers,
  updateUserStatus,
  checkAdminCount,
  checkPfNo,
  getUserRoles,
  getUserByVerticalName,
  assignDelegate,
  removeDelegate,
  getUserCount
};
