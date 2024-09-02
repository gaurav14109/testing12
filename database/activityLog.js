const client = require("../config/dbConfig");
var moment = require("moment");

class ActivityLogs {
  async addActivity(
    email,
    endpoint,
    status,
    user_id,
    description,
    vertical_name,
    method
  ) {
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    const query = ` INSERT INTO activity_logs (email, endpoint, requested_on, status, user_id, description, vertical_name, method)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
    const values = [
      email,
      endpoint,
      date,
      status,
      user_id,
      description,
      vertical_name,
      method,
    ];
    await client.query(query, values);
    return;
  }

  async getAllActivity(filters) {
    
    let query = "select * from activity_logs where 1=1";
    let i = 0;
    const values = []
    Object.keys(filters).forEach((key) => {
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
    const result = await client.query(query,values);
    return result.rows;
  }

  async getLogsCount() {
    const query = "select count(*) from activity_logs";
    const result = await client.query(query);
    return result.rows[0].count;
  }

}
const activityLogs = new ActivityLogs();
module.exports = activityLogs;
