const validateUser = require("../services/validateUser");
const mailSender = require("../services/mail/mailSender");
const {
  queryAsync,
  createToken,
  generateRandomCode,
} = require("../utils/functions");
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

      const verificationCode = generateRandomCode();
      const emailSent = await mailSender.sendVerificationEmail(
        email,
        verificationCode,
        "mailVerification.html"
      );

      if (!emailSent) {
        return res
          .status(500)
          .json({ error: "Erro ao enviar o e-mail de verificação." });
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
        message:
          "Usuário temporariamente cadastrado. Verifique seu e-mail para o código de verificação.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async verifyUser(req, res) {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ error: "E-mail e código são obrigatórios." });
    }

    const storedUser = tempUsers[email];

    if (
      !storedUser ||
      storedUser.verificationCode !== code ||
      Date.now() > storedUser.expiresAt
    ) {
      return res
        .status(401)
        .json({ error: "Código de verificação inválido ou expirado." });
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

  static async loginUser(req, res) {
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

  static async updateUser(req, res) {
    const { idUser } = req.params;
    const { name, email, password, confirmPassword } = req.body;

    if (req.userId != idUser) {
      return res.status(403).json({ error: "Não autorizado" });
    }

    const updateValidationError = validateUser.validateUpdate(req.body, idUser);
    if (updateValidationError) {
      return res.status(400).json(updateValidationError);
    }

    try {
      const userExistsQuery = `SELECT * FROM user WHERE idUser = ?`;
      const userExistsResults = await queryAsync(userExistsQuery, [idUser]);
      if (userExistsResults.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const userToUpdate = userExistsResults[0];

      if (email && email !== userToUpdate.email) {
        const emailValidationError = await validateUser.validateEmail(email);
        if (emailValidationError && emailValidationError.error) {
          return res.status(400).json(emailValidationError);
        }

        const verificationCode = generateRandomCode();
        const emailSent = await mailSender.sendVerificationEmail(
          email,
          verificationCode,
          "updateVerification.html"
        );

        if (!emailSent) {
          return res
            .status(500)
            .json({ error: "Erro ao enviar o e-mail de verificação." });
        }

        tempUsers[email] = {
          idUser,
          name: name || userToUpdate.name,
          oldEmail: userToUpdate.email,
          newEmail: email,
          password: password,
          hashedPassword: password ? bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS)) : userToUpdate.hashedPassword,
          verificationCode,
          expiresAt: Date.now() + 5 * 60 * 1000,
        };

        return res.status(200).json({
          message:
            "Verificação de e-mail necessária. Um código foi enviado para o novo e-mail.",
        });
      }

      const fieldsToUpdate = [];
      const values = [];

      if (name) {
        fieldsToUpdate.push("name = ?");
        values.push(name);
      }

      if (password) {
        const saltRounds = Number(process.env.SALT_ROUNDS);
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        fieldsToUpdate.push("hashedPassword = ?");
        values.push(hashedPassword);
      }

      if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ error: "Nenhum campo para atualizar foi fornecido." });
      }

      const updateQuery = `UPDATE user SET ${fieldsToUpdate.join(", ")} WHERE idUser = ?`;
      values.push(idUser);

      await queryAsync(updateQuery, values);

      const updatedUserQuery = `SELECT idUser, name, email FROM user WHERE idUser = ?`;
      const updatedUserResults = await queryAsync(updatedUserQuery, [idUser]);
      const updatedUser = updatedUserResults[0];

      mailSender.sendProfileUpdatedEmail(updatedUser.email, updatedUser);

      return res.status(200).json({
        message: "Usuário atualizado com sucesso.",
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async verifyUpdate(req, res) {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ error: "E-mail e código são obrigatórios." });
    }

    const storedUpdate = tempUsers[email];

    if (
      !storedUpdate ||
      storedUpdate.verificationCode !== code ||
      Date.now() > storedUpdate.expiresAt
    ) {
      return res
        .status(401)
        .json({ error: "Código de verificação inválido ou expirado." });
    }

    try {
      const { idUser, name, newEmail, hashedPassword } = storedUpdate;

      const fieldsToUpdate = [];
      const values = [];

      fieldsToUpdate.push("name = ?");
      values.push(name);

      fieldsToUpdate.push("email = ?");
      values.push(newEmail);

      fieldsToUpdate.push("hashedPassword = ?");
      values.push(hashedPassword);

      const updateQuery = `UPDATE user SET ${fieldsToUpdate.join(", ")} WHERE idUser = ?`;
      values.push(idUser);

      await queryAsync(updateQuery, values);

      const updatedUserQuery = `SELECT idUser, name, email FROM user WHERE idUser = ?`;
      const updatedUserResults = await queryAsync(updatedUserQuery, [idUser]);
      const updatedUser = updatedUserResults[0];

      delete tempUsers[email];

      mailSender.sendProfileUpdatedEmail(updatedUser.email, updatedUser);

      return res.status(200).json({
        message: "Usuário atualizado com sucesso.",
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }

  static async deleteUser(req, res) {
    const { idUser } = req.params;

    if (req.userId != idUser) {
      return res.status(403).json({ error: "Não autorizado" });
    }

    try {
      const userExistsQuery = `SELECT idUser, name, email FROM user WHERE idUser = ?`;
      const userExistsResults = await queryAsync(userExistsQuery, [idUser]);
      if (userExistsResults.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const userToDelete = userExistsResults[0];

      const deleteQuery = `DELETE FROM user WHERE idUser = ?`;
      await queryAsync(deleteQuery, [idUser]);

      mailSender.sendDeletionEmail(userToDelete.email, userToDelete.name);

      return res.status(200).json({
        message: "Usuário deletado com sucesso.",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};

/*
curl --location 'http://localhost:5000/stock/user/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "joao.silva@sp.senai.br",
    "password": "Joao.1234"
}'

curl --location 'http://localhost:5000/stock/users' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}'

curl --location 'http://localhost:5000/stock/user/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Vinicius Fogaça",
    "email": "vinicius.f.cintra@aluno.senai.br",
    "password": "Vinicius.3456",
    "confirmPassword": "Vinicius.3456"
}'

curl --location 'http://localhost:5000/stock/user/verify-register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "vinicius.f.cintra@aluno.senai.br",
    "code": "{mailCode}"
}'

curl --location --request PUT 'http://localhost:5000/stock/user/2' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "name": "Vinicius Fogaça Cintra",
    "email": "vinicius.f.cintra@aluno.senai.br",
    "password": "Vinicius.9871",
    "confirmPassword": "Vinicius.9871"
}'

curl --location 'http://localhost:5000/stock/user/verify-update' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "vinicius.f.cintra@aluno.senai.br",
    "code": "{mailCode}"
}'

curl --location --request DELETE 'http://localhost:5000/stock/user/2' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}'
*/