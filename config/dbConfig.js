const {Pool } = require('pg')

const pool = new Pool({
    user:"postgres",
    host:"localhost",
    database:"postgres",
    password:'1234',
    port:5432,
    max:20,
    idleTimeoutMillis:30000,
    connectionTimeoutMillis:2000
});

module.exports = pool