const validateUser = require("../services/validateUser");
const { queryAsync, createToken } = require("../utils/functions");
const bcrypt = require("bcrypt");

const tempUsers = {};

module.exports = class usuarioController {
  static async registerUser(req, res) {
    const { name, email, password, confirmPassword } = req.body;

    const userValidationError = validateUser.validateUser(req.body);
    if (userValidationError) {
      return res.status(400).json(userValidationError);
    }

    try {
      const emailValidationError = await validateUser.validateEmail(email);
      if (emailValidationError && emailValidationError.error) {
        return res.status(400).json(emailValidationError);
      }

      const verificationCode = validateUser.generateRandomCode();
      const emailSent = await validateUser.sendVerificationEmail(email, verificationCode);

      if (!emailSent) {
        return res.status(500).json({ error: "Erro ao enviar o e-mail de verificação." });
      }

      const saltRounds = Number(process.env.SALT_ROUNDS);
      const hashedPassword = bcrypt.hashSync(password, saltRounds);

      tempUsers[email] = {
        name,
        email,
        hashedPassword,
        verificationCode,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };

      return res.status(200).json({
        message: "Usuário temporariamente cadastrado. Verifique seu e-mail para o código de verificação.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async verifyUser(req, res) {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'E-mail e código são obrigatórios.' });
    }

    const storedUser = tempUsers[email];

    if (!storedUser || storedUser.verificationCode !== code || Date.now() > storedUser.expiresAt) {
      return res.status(401).json({ error: 'Código de verificação inválido ou expirado.' });
    }

    try {
      const { name, hashedPassword } = storedUser;
      const queryInsert = `INSERT INTO user (name, email, hashedPassword, role) VALUES (?, ?, ?, "user")`;
      const valuesInsert = [name, email, hashedPassword];
      await queryAsync(queryInsert, valuesInsert);

      const querySelect = `SELECT * FROM user WHERE email = ?`;
      const results = await queryAsync(querySelect, [email]);

      if (results.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const user = results[0];
      const token = createToken({
        id: user.idUser,
        email: user.email,
      });

      delete tempUsers[email];

      return res.status(200).json({
        message: "Cadastro bem-sucedido",
        user,
        token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async loginUsuario(req, res) {
    const { email, password } = req.body;

    const loginValidationError = validateUser.validateLogin(req.body);
    if (loginValidationError) {
      return res.status(400).json(loginValidationError);
    }

    const query = `SELECT * FROM user WHERE email = ?`;

    try {
      const results = await queryAsync(query, [email]);

      if (results.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const user = results[0];
      const passwordOK = bcrypt.compareSync(password, user.hashedPassword);

      if (!passwordOK) {
        return res.status(401).json({ error: "Senha Incorreta" });
      }

      const token = createToken({
        idUser: user.idUser,
        email: user.email,
      });

      return res.status(200).json({
        message: "Login Bem-sucedido",
        user,
        token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async getAllUsers(req, res) {
    const query = `SELECT * FROM user`;
    try {
      const results = await queryAsync(query);
      return res
        .status(200)
        .json({ message: "Obtendo todos os usuários", users: results });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};
