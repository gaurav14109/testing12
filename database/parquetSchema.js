const client = require("../config/dbConfig");

class parquetSchema {
  async getParquetSchema(
   reportName
  ) {
    
    const query = ` select schema,datecolumns from parquet_schemas where tablename = $1 `;
    const values = [
      reportName,
    ];
    
    const result = await client.query(query, values);
    return result.rows[0];
  }

}
const parquetschema = new parquetSchema();
module.exports = parquetschema;
