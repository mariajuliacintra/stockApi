const validateUser = require("../services/validateUser");
const { queryAsync, createToken } = require("../utils/functions");
const bcrypt = require("bcrypt");

module.exports = class usuarioController {
  static async createUsuarios(req, res) {
    const { name, email, password, confirmPassword } = req.body;

    // Validação dos campos obrigatórios
    const userValidationError = validateUser.validateUser(req.body);
    if (userValidationError) {
      return res.status(400).json(userValidationError);
    }

    try {
      // Valida se Email já estão cadastrados
      const emailValidationError = await validateUser.validateEmail(
        email
      );
      if (emailValidationError && emailValidationError.error) {
        return res.status(400).json(emailValidationError);
      }

      const saltRounds = Number(process.env.SALT_ROUNDS);
      const hashedPassword = bcrypt.hashSync(password, saltRounds);

      const queryInsert = `INSERT INTO user (name, email, hashedPassword, role) VALUES (?, ?, ?, "user")`;
      const valuesInsert = [name, email, hashedPassword];
      await queryAsync(queryInsert, valuesInsert);

      // Busca o usuário recém-cadastrado
      const querySelect = `SELECT * FROM user WHERE email = ?`;
      const results = await queryAsync(querySelect, [email]);

      if (results.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const user = results[0];

      // Gera o token
      const token = createToken({
        id: user.idUser,
        email: user.email,
      });

      // Retorna usuário e token
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

    // Validação dos campos para login
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

      // Gera o token
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
