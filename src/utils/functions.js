const { pool } = require("../db/connect");
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
    pool.query(query, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

const senaiDomains = [
  "@sp.senai.br",
  "@aluno.senai.br",
  "@gmail.com",
  "@docente.senai.br",
];

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
  const minLength = 8;
  const allowedSpecialChars = "[@$!%*?&]";

  const allowedCharsRegex = new RegExp(`^[A-Za-z0-9${allowedSpecialChars}]+$`);

  const checks = [
    {
      test: password.length >= minLength,
      error: `A senha deve ter no mínimo ${minLength} caracteres.`,
    },
    {
      test: /[a-z]/.test(password),
      error: "A senha deve conter pelo menos uma letra minúscula.",
    },
    {
      test: /[A-Z]/.test(password),
      error: "A senha deve conter pelo menos uma letra maiúscula.",
    },
    {
      test: /\d/.test(password),
      error: "A senha deve conter pelo menos um número.",
    },
    {
      test: new RegExp(allowedSpecialChars).test(password),
      error: `A senha deve conter pelo menos um caractere especial (${allowedSpecialChars.replace(
        /[\[\]]/g,
        ""
      )}).`,
    },
    {
      test: allowedCharsRegex.test(password),
      error:
        "A senha contém caracteres não permitidos (como emojis). Apenas letras, números e os caracteres especiais especificados são permitidos.",
    },
  ];

  const failedChecks = checks.filter((check) => !check.test);

  if (failedChecks.length > 0) {
    return {
      valid: false,
      errors: failedChecks.map((check) => check.error),
    };
  }

  return { valid: true, errors: [] };
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
