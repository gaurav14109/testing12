const { UnAuthorizedError } = require("../utils/UnthorizedError");
const users = require("../database/users");
const delegateInst = require("../database/delegate");
//Check Only user login statusc
const userInstance = new users();

const login = async (username, password) => {

  let delegate_to =null
  let result = await userInstance.getUserByEmail(username);
  if (result.length > 0) {
    let delagteUser = await userInstance.getAllUsersByVerticalanduid(
      result[0].vertical_name,
      result[0].user_id
    );
    if (delagteUser.length > 0) {
      let user = delagteUser[0];
      let date = new Date();
      date = date.toString().substring(0, 10);
      const start_date = new Date(user.start_date).toString().substring(0, 10);
      const end_date = new Date(user.end_date).toString().substring(0, 10);
      if (user.status === "Activation Scheduled") {
      
        if (date === start_date) {
          await userInstance.updateDelegate({ id: user.id, status: "Active" });
          let data = {
            role: "Maker,Delegate",
            updated_by: result[0].employee_name,
            user_id: result[0].user_id,
          };
          result = await userInstance.updateUserRole(data);
        }
      } else if (user.status === "Active") {
        if (new Date(end_date) < new Date(date)) {
          await userInstance.updateDelegate({
            id: user.id,
            status: "Inactive",
          });
          let data = {
            role: "Maker",
            updated_by: result[0].employee_name,
            user_id: result[0].user_id,
          };
          result = await userInstance.updateUserRole(data);
        }
      }
    }
    if (result[0].role_name === 'Maker,Delegate') {
      delegate = await delegateInst.CheckDelegate(result[0].user_id)
      delegate_to = delegate[0].assigned_to_email
    }
    return {
      name: result[0].employee_name,
      email: result[0].email,
      role: result[0].role_name,
      vertical_name: result[0].vertical_name,
      user_id: result[0].user_id,
      active: result[0].active,
      delegate_to: delegate_to
    };
  } else {
    throw new UnAuthorizedError("Invalid Credentials");
  }
};

module.exports = { login };
