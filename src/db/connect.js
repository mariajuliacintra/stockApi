const mysql = require("mysql2");

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST, 
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
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