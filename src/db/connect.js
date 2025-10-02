require('dotenv').config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DATABASEHOST, 
  user: process.env.DATABASEUSER,
  password: process.env.DATABASEPASSWORD,
  database: process.env.DATABASENAME,
});

module.exports = pool;
