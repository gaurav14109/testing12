const client = require("../config/dbConfig");
var moment = require("moment");

class Requests {
  async getAllRequests(filters) {
    console.log(filters)
    let query = "SELECT * FROM requests WHERE 1 = 1";
    const values = [];
    let i = 0;

    Object.keys(filters).forEach((key) => {
      if (key === "role") {
        return;
      }
      if(key === 'user_id' && filters['status'] === 'Returned To Maker'){
        return
      }
      if(key === 'assigned_to' && (filters['assigned_to'] === 'null' || filters.role === "Maker,Delegate")){
        return
      } 
  
      if (filters[key] === "Approved") {
        query += ` AND status IN ($${i + 1}, $${i + 2})`;
        values.push("Approved", "Cancelled");
        i += 2;
      } else if (filters[key] === "Pending:Returned") {
        const statuses = filters[key].split(":");
        query += ` AND status IN ($${i + 1}, $${i + 2})`;
        values.push(statuses[0], "Returned To Maker");
        i += 2;
      } else if (key === "limit") {
        query += ` LIMIT $${i + 1}`;
        values.push(filters[key]);
        i += 1;
      } else if (key === "offset") {
        query += ` OFFSET $${i + 1}`;
        values.push(filters[key]);
        i += 1;
      } else if (key === "filter") {
        query += ` AND requestor_name ILIKE '%' || $${i + 1} || '%'`;
        values.push(filters[key]);
        i += 1;
      } 
      else if (filters[key] === "Returned To Maker") {
        if (filters.role === "Maker,Delegate") {
          query += ` AND (user_id = $${i+1} AND status = $${i+2} AND assigned_to = $${i+3} ) OR (assigned_to = $${i+3} AND status = $${i+4}) `;
          values.push(filters['user_id'],filters[key],filters['assigned_to'],'Pending');
          i += 4;
        } else {
          query += ` AND ${key} = $${i + 1}`;
          values.push(filters[key]);
          i += 1;
        }
      } else {
        query += ` AND ${key} = $${i + 1}`;
        values.push(filters[key]);
        i += 1;
      }
    });
    // query += " ORDER BY created_date"; // Replace `some_column` with the actual column you want to order by.
    console.log(query, values)
    const result = await client.query(query, values);

    return result.rows;
  }

  async getRequestHistory(request_id) {
    let query = "select * from request_history  WHERE request_id = $1";
    const values = [request_id];

    const result = await client.query(query, values);
    return result.rows;
  }
  async getCount(filters) {
    let query = "select count(*) from requests  WHERE 1 = 1";
    const values = [];
    let i = 0;
    Object.keys(filters).forEach((key, index) => {
      if (key === "role") {
        return;
      }
      if(key === 'user_id' && filters['status'] === 'Returned To Maker'){
        return
      }
      if(key === 'assigned_to' && (filters['assigned_to'] === 'null'|| filters.role === "Maker,Delegate")){
        return
      } 
      if (filters[key] === "Approved") {
        query += ` AND status in ($${index + 1},$${index + 2})`;
        values.push(filters[key]);
        values.push("Cancelled");
        i+=2
      } else if (filters[key] === "Pending:Returned") {
        const statuses = filters[key].split(":");
        query += ` AND status in ($${index + 1},$${index + 2})`;
        values.push(statuses[0]);
        values.push("Returned To Maker");
        i+=2
      } 
      else if (filters[key] === "Returned To Maker") {
        if (filters.role === "Maker,Delegate") {
          // query += ` AND (user_id = $${i+1} AND status = $${i+2} AND assigned_to = $${i+3} ) OR (status = $${i+4}) `;
          query += ` AND (user_id = $${i+1} AND status = $${i+2} ) OR (assigned_to = $${i+3} AND status = $${i+4}) `
          values.push(filters['user_id'],filters[key],filters['assigned_to'],'Pending');
          i += 4;
        } else {
          query += ` AND ${key} = $${i + 1}`;
          values.push(filters[key]);
          i += 1;
        }
      } 
      else {
        query += ` AND ${key} = $${i + 1}`;
        values.push(filters[key]);
        i+=1
      }
    });
    const result = await client.query(query, values);
    return result.rows[0].count;
  }

  async addNewRequest(
    vertical_name,
    year,
    qtr,
    report_name,
    common_file_upload,
    override,
    menu,
    user_id,
    fileName,
    requestor_name,
    assigned_to,
    assignee_name
  ) {
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    const query = `insert into requests 
        (vertical_name,year, qtr,report_name,common_file_upload,override,menu,created_date,last_updated_date,user_id,file_name,status,requestor_name,assigned_to,assignee_name) values
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`;
    const values = [
      vertical_name,
      year,
      qtr,
      report_name,
      common_file_upload,
      override,
      menu,
      date,
      date,
      user_id,
      fileName,
      "Pending",
      requestor_name,
      assigned_to,
      assignee_name
    ];
    const result = await client.query(query, values);

    return result.rows[0];
  }

  async addRequestHistory(request_id, comment, name,pending_with) {
    const created = moment().format("YYYY-MM-DD HH:mm:ss");
    const query = `insert into request_history 
        (comments,action_date_time,name,request_id,pending_with) values
        ($1,$2,$3,$4,$5)`;
    const values = [comment, created, name, request_id,pending_with];
    await client.query(query, values);
    return;
  }

  async updateRequests(request_id, status) {
    const date = moment().format("YYYY-MM-DD HH:mm:ss");
    const query = `update requests set status=$1, last_updated_date=$2 where request_id = $3 RETURNING *`;
    const values = [status, date, request_id];
    const result = await client.query(query, values);

    return result.rows[0];
  }
  async getRecentActivities(filters) {

    let query = "select * from activity_logs  WHERE 1 = 1";
    const values = [];
    Object.keys(filters).forEach((key, index) => {
      query += ` AND ${key} = $${index + 1}`
      values.push(filters[key])
    })
    query += ` AND requested_on >= NOW() - INTERVAL '7 days' ORDER BY requested_on DESC`;
    const result = await client.query(query, values);
    return result.rows;
  }

  async getLongPendingActivities(filters) {
    let query = "select * from requests  WHERE 1 = 1";
    const values = [];
    Object.keys(filters).forEach((key, index) => {
      query += ` AND ${key} = $${index + 1}`
      values.push(filters[key])
    })
    query += ` and status in ('Pending','Returned To Maker') and created_date <= NOW() - INTERVAL '7 days'
    ORDER BY created_date DESC`;

    const result = await client.query(query, values);
    return result.rows;
  }
  async getVerticalRecentActivity() {
    const query = `
    WITH LatestRecords AS (
        SELECT *,
            ROW_NUMBER() OVER (PARTITION BY vertical_name ORDER BY created_date DESC) AS rn
        FROM requests
    )
    SELECT DISTINCT vertical_name,created_date
    FROM LatestRecords
    WHERE rn = 1;
  `;
    const res = await client.query(query);
    return res.rows;
  }
}

module.exports = Requests;
