const connect = require("../db/connect");
const { validatePassword } = require("../utils/functions");

module.exports = {
  // Valida os campos obrigatórios para criação do usuário
  validateUser: function ({ name, email, password, confirmPassword }) {
    const senaiDomains = [
      "@sp.senai.br",
    ];

    if (!name || !email || !password || !confirmPassword) {
      return { error: "Todos os campos devem ser preenchidos" };
    }
    if (!email.includes("@")) {
      return { error: "Email inválido. Deve conter @" };
    }
    const emailDomain = email.substring(email.lastIndexOf("@"));
    if (!senaiDomains.includes(emailDomain)) {
      return {
        error: "Email inválido. Deve pertencer a um domínio SENAI autorizado",
      };
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
  },

  // Valida se o email já estão vinculados a outro usuário
  validateEmail: async function (email) {
    return new Promise((resolve, reject) => {
      const query = "SELECT idUser FROM user WHERE email = ?";
      const values = [email];

      connect.query(query, values, (err, results) => {
        if (err) {
          return reject("Erro ao verificar email");
        }
        if (results.length > 0) {
          return resolve({
            error: "O Email já está vinculado a outro usuário",
          });
        }
        return resolve(null);
      });
    });
  },

  // Valida os campos para login
  validateLogin: function ({ email, password }) {
    const senaiDomains = [
      "@sp.senai.br",
    ];
    if (!email || !password) {
      return { error: "Todos os campos devem ser preenchidos" };
    }
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
  },
};
