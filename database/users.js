const client = require("../config/dbConfig");
var moment = require("moment");
class users {
  constructor() { }
  async getAllUsers(filters) {
    const values = [];
    let i = 0;
    let query = " select * from users  WHERE 1 = 1 ";
    Object.keys(filters).forEach((key, index) => {
      if (key === "limit") {
        query += ` LIMIT $${i + 1}`;
        values.push(filters[key]);
        i += 1;
      } else if (key === "offset") {
        query += ` OFFSET $${i + 1}`;
        values.push(filters[key]);
        i += 1;
      }
    })
    const result = await client.query(query, values);
    return result.rows;
  }
  async getUserCount() {
    const query = "select count(*) from users";
    const result = await client.query(query);
    return result.rows[0].count;
  }

  async getUserByEmail(email) {
    const query = "select * from users where email = $1";
    const values = [email];
    const result = await client.query(query, values);
    return result.rows;
  }
  async addUsers(data) {
    const {
      employee_name,
      pf_no,
      email,
      branch,
      createdBy,
      vertical_name,
      role_name,
      updated_by,
      sol,
    } = data;
    const query = `insert into users (employee_name,pf_no,email,branch,created_date,last_updated_date,"createdBy",vertical_name,role_name,updated_by,active,sol) values 
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`;
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    const values = [
      employee_name,
      pf_no,
      email,
      branch,
      date,
      date,
      createdBy,
      vertical_name,
      role_name,
      updated_by,
      "true",
      sol,
    ];
    const result = await client.query(query, values);
    return result;
  }
  async updateUser(data) {
    const { branch, vertical_name, role_name, updated_by, user_id } = data;
    const query = `update  users set vertical_name = $1 , role_name = $2 , updated_by = $3, branch = $4,last_updated_date= $5 where user_id = $6 `;
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    const values = [
      vertical_name,
      role_name,
      updated_by,
      branch,
      date,
      user_id,
    ];
    const result = await client.query(query, values);
    return result;
  }

  async updateUserStatus(data) {
    const { user_id, active, updated_by } = data;
    const query = `update  users set active = $1,updated_by = $2, last_updated_date= $3 where user_id = $4 `;
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    const values = [active, updated_by, date, user_id];
    const result = await client.query(query, values);
    return result;
  }

  async checkAdminCount() {
    const query = "select * from users where role_name = 'Admin' ";
    const result = await client.query(query);
    return result.rows;
  }

  async checkPfNo(pfNo) {
    const query = "select * from users where pf_no = $1 ";
    const values = [pfNo];
    const result = await client.query(query, values);
    return result.rows;
  }

  async getAllUsersActive() {
    const query =
      "select * from users  where active = true and role_name != 'Admin' ";
    const result = await client.query(query);
    return result.rows;
  }
  async getAllUsersByVertical(vertical_name) {
    const query =
      "select d.id,u.user_id,u.employee_name,u.vertical_name,u.role_name,u.branch,u.email,d.start_date,d.end_date,d.status,d.delegate_to from users u LEFT JOIN delegate d ON u.email = d.email and d.status in ('Activation Scheduled','Active') where u.vertical_name = $1 and u.active = true and u.role_name not in ('Admin','Checker')";
    const values = [vertical_name];
    const result = await client.query(query, values);
    return result.rows;
  }

  //Manage delegate pending
  async assignDelegate(data) {
    const {
      email,
      delegate_name,
      start_date,
      end_date,
      delegate_user_id,
      delegate_to,
      status,
      adminDetails
    } = data;
    const date = moment().format("YYYY-MM-DD HH:mm:ss");

    const query = `insert into delegate (email,delegate_name,start_date,end_date,delegate_user_id,delegate_to,status,created_date,last_updated_date,assigned_to_email) values 
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;
    const values = [
      email,
      delegate_name,
      start_date,
      end_date,
      delegate_user_id,
      delegate_to,
      status,
      date,
      date,
      adminDetails.email
    ];
    const result = await client.query(query, values);
    return result.rows;
  }

  async updateUserRole(data) {
    const { role, updated_by, user_id } = data;
    const query = `update  users set role_name = $1,last_updated_date = $2,updated_by = $3 where user_id = $4 RETURNING *;`;
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    const values = [role, date, updated_by, user_id];
    const result = await client.query(query, values);
    return result;
  }

  async updateDelegate(data) {
    const { id, status } = data;
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    const query = `update delegate set status = $1, last_updated_date = $2 where id = $3 RETURNING *;`;
    const values = [status, date, id];
    const result = await client.query(query, values);
    return result.rows;
  }
  async getAllUsersByVerticalanduid(vertical_name, u_id) {
    const query =
      "select d.id,u.user_id,u.employee_name,u.vertical_name,u.role_name,u.branch,u.email,d.start_date,d.end_date,d.status,d.delegate_to from users u LEFT JOIN delegate d ON u.email = d.email and d.status in ('Activation Scheduled','Active') where u.vertical_name = $1 and u.active = true and u.role_name not in ('Admin','Checker')";
    const values = [vertical_name];
    const result = await client.query(query, values);
    return result.rows;
  }

  async getVerticalCheckers(vertical_name) {
    const query = "select * from users where vertical_name = $1 and role_name = 'Checker' "
    const values = [vertical_name]
    const result = await client.query(query, values)
    return result.rows
  }
}

module.exports = users;