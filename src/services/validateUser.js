const { validatePassword, validateDomain } = require("../utils/functions");
const { queryAsync } = require("../utils/functions");

const validateUser = function ({ name, email, password, confirmPassword }) {
  if (!name || !email || !password || !confirmPassword) {
    return { error: "Todos os campos devem ser preenchidos" };
  }
  const domainError = validateDomain(email);
  if (domainError) {
    return domainError;
  }
  if (password != confirmPassword) {
    return { error: "As senhas não coincidem" };
  }
  if (!validatePassword(password)) {
    return {
      error:
        "A senha deve ter no mínimo 8 caracteres, incluindo letras, números e um caractere especial.",
    };
  }
  return null;
};

const validateEmail = async function (email, userId = null) {
  try {
    let query = "SELECT idUser FROM user WHERE email = ?";
    const values = [email];

    const results = await queryAsync(query, values);

    if (results.length > 0) {
      return {
        error: "O Email já está vinculado a outro usuário",
      };
    }
    return null;
  } catch (err) {
    console.error(err);
    return { error: "Erro ao verificar email" };
  }
};

const validateLogin = function ({ email, password }) {
  if (!email || !password) {
    return { error: "Todos os campos devem ser preenchidos" };
  }
  const domainError = validateDomain(email);
  if (domainError) {
    return domainError;
  }
  return null;
};

const validateUpdate = function ({ name, email, password, confirmPassword }) {
  if (!name && !email && !password) {
    return { error: "Nenhum campo para atualizar foi fornecido." };
  }

  if (email) {
    const domainError = validateDomain(email);
    if (domainError) {
      return domainError;
    }
  }

  if (password) {
    if (!confirmPassword) {
      return { error: "A confirmação de senha é obrigatória." };
    }
    if (password !== confirmPassword) {
      return { error: "As senhas não coincidem." };
    }
    if (!validatePassword(password)) {
      return {
        error:
          "A nova senha deve ter no mínimo 8 caracteres, incluindo letras, números e um caractere especial.",
      };
    }
  }

  return null;
};

const validateRecovery = function ({password, confirmPassword}) {
    if (!password || !confirmPassword) {
      return { error: "A senha e confirmação de senha são obrigatórias." };
    }
    if (password !== confirmPassword) {
      return { error: "As senhas não coincidem." };
    }
    if (!validatePassword(password)) {
      return {
        error:
          "A nova senha deve ter no mínimo 8 caracteres, incluindo letras, números e um caractere especial.",
      };
    }
    return null;
  }

module.exports = {
  validateUser,
  validateEmail,
  validateLogin,
  validateUpdate,
  validateRecovery
};
