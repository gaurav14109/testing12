const client = require("../config/dbConfig");

class Sols {
    async searchSol(sol){
        const query = "select * from sols where sol LIKE $1 || '%' ";

        const values = [sol]
        const result = await client.query(query,values);
        return result.rows
    }
}
const sols = new Sols();
module.exports = sols;
