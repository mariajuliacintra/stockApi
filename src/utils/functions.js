const connect = require("../db/connect");
const jwt = require("jsonwebtoken");
const tokenSecret = process.env.SECRET;

const queryAsync = (query, values = []) => {
  return new Promise((resolve, reject) => {
    connect.query(query, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

function createToken(payload, expirationTime = "1h") {
  return jwt.sign(payload, tokenSecret, { expiresIn: expirationTime });
}

function validatePassword(password) {
  const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[.@$!%*?&])[A-Za-z\d.@$!%*?&]{8,}$/;
  return regex.test(password);
}

module.exports = { queryAsync, validatePassword, createToken };
