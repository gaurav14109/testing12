const client = require("../config/dbConfig");

class delegate {
    async CheckDelegate(
        delegate_user_id
    ) {

        const query = ` select * from delegate where delegate_user_id = $1 and status = 'Active' `;
        const values = [
            delegate_user_id,
        ];

        const result = await client.query(query, values);
        return result.rows;
    }

}
const delegateInst = new delegate();
module.exports = delegateInst;