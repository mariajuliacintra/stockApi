const connect = require("../db/connect");
const jwt = require("jsonwebtoken");
const tokenSecret = process.env.SECRETKEY;

const handleResponse = (
  res,
  status,
  { success, message, error, details, data, arrayName, pagination }
) => {
  if (success) {
    const responseBody = {
      success: true,
      message: message || "Operação realizada com sucesso.",
      details: details || null,
    };
    
    if (pagination !== undefined) {
      responseBody.pagination = pagination;
    }

    if (data !== undefined && arrayName) {
      responseBody[arrayName] = Array.isArray(data) ? data : [data];
    }

    return res.status(status || 200).json(responseBody);
  } else {
    const responseBody = {
      success: false,
      error: error || "Ocorreu um erro na operação.",
      details: details || null,
    };
    return res.status(status || 500).json(responseBody);
  }
};

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

const senaiDomains = ["@sp.senai.br", "@aluno.senai.br", "@gmail.com"];

const validateDomain = function (email) {
  if (!email.includes("@")) {
    return { error: "Email inválido. Deve conter @" };
  }
  const emailDomain = email.substring(email.lastIndexOf("@"));
  if (!senaiDomains.includes(emailDomain)) {
    return {
      error: "Email inválido. Deve pertencer a um domínio SENAI autorizado",
    };
  }
  return null;
};

function createToken(payload, expirationTime = "1h") {
  return jwt.sign(payload, tokenSecret, { expiresIn: expirationTime });
}

function validatePassword(password) {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  queryAsync,
  validatePassword,
  validateDomain,
  createToken,
  generateRandomCode,
  handleResponse,
};