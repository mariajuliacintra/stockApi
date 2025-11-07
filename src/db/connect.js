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

const closePool = () => {
    return new Promise((resolve, reject) => {
        pool.end(err => {
            if (err) {
                console.error("Erro ao fechar o pool de conexões:", err);
                return reject(err);
            }
            console.log("Pool de conexões MySQL encerrado com sucesso.");
            resolve();
        });
    });
};

module.exports = {
    pool,
    closePool
};