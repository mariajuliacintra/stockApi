const mysql = require("mysql2");

if (process.env.NODEENV !== 'production') {
  require('dotenv').config();
}

const pool = mysql.createPool({
  host: process.env.DATABASEHOST, 
  user: process.env.DATABASEUSER,
  password: process.env.DATABASEPASSWORD,
  database: process.env.DATABASENAME,
});

module.exports = pool;
