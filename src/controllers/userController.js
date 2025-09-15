const validateUser = require("../services/validateUser");
const mailSender = require("../services/mail/mailSender");
const { queryAsync, createToken, generateRandomCode, handleResponse } = require("../utils/functions");
const { findUserByEmail, findUserById } = require("../utils/querys");
const bcrypt = require("bcrypt");

const tempUsers = {};

module.exports = class UserController {
    static async registerUser(req, res) {
        const { name, email, password } = req.body;

        const userValidationError = validateUser.validateUser(req.body);
        if (userValidationError) {
            return handleResponse(res, 400, userValidationError);
        }

        try {
            const userToReactivate = await validateUser.findUserByEmailAndActiveStatus(email, false);
            if (userToReactivate) {
                const verificationCode = generateRandomCode();
                const emailSent = await mailSender.sendVerificationEmail(email, verificationCode, "mailVerification.html");

                if (!emailSent) {
                    return handleResponse(res, 500, { error: "Erro ao enviar o e-mail de verificação." });
                }

                const saltRounds = Number(process.env.SALT_ROUNDS);
                const hashedPassword = bcrypt.hashSync(password, saltRounds);

                tempUsers[email] = {
                    idUser: userToReactivate.idUser,
                    name,
                    hashedPassword,
                    verificationCode,
                    expiresAt: Date.now() + 5 * 60 * 1000,
                    reactivating: true
                };

                return handleResponse(res, 200, {
                    message: "E-mail já cadastrado, mas a conta está inativa. Um código de verificação foi enviado para reativá-la."
                });
            }

            const emailValidationError = await validateUser.validateEmail(email);
            if (emailValidationError && emailValidationError.error) {
                return handleResponse(res, 400, emailValidationError);
            }

            const verificationCode = generateRandomCode();
            const emailSent = await mailSender.sendVerificationEmail(email, verificationCode, "mailVerification.html");

            if (!emailSent) {
                return handleResponse(res, 500, { error: "Erro ao enviar o e-mail de verificação." });
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

            return handleResponse(res, 200, {
                message: "Usuário temporariamente cadastrado. Verifique seu e-mail para o código de verificação.",
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { error: "Erro Interno do Servidor" });
        }
    }

    static async verifyUser(req, res) {
        const { email, code } = req.body;

        if (!email || !code) {
            return handleResponse(res, 400, { error: "E-mail e código são obrigatórios.", auth: false });
        }

        const storedUser = tempUsers[email];

        if (!storedUser || storedUser.verificationCode !== code || Date.now() > storedUser.expiresAt) {
            return handleResponse(res, 401, { error: "Código de verificação inválido ou expirado." });
        }

        try {
            if (storedUser.reactivating) {
                const { idUser, name, hashedPassword } = storedUser;
                const reactivateQuery = `UPDATE user SET name = ?, hashedPassword = ?, isActive = TRUE WHERE idUser = ?`;
                await queryAsync(reactivateQuery, [name, hashedPassword, idUser]);
                
                const user = await findUserById(idUser);
                const token = createToken({ idUser: user.idUser, email: user.email, role: user.role });
                delete tempUsers[email];

                const isManager = user.role === "manager";
                
                return handleResponse(res, 200, {
                    message: "Conta reativada com sucesso!",
                    user: { ...user, isManager },
                    token,
                    auth: true
                });
            }

            const { name, hashedPassword } = storedUser;
            const queryInsert = `INSERT INTO user (name, email, hashedPassword, role) VALUES (?, ?, ?, "user")`;
            const valuesInsert = [name, email, hashedPassword];
            await queryAsync(queryInsert, valuesInsert);

            const user = await findUserByEmail(email);
            if (!user) {
                return handleResponse(res, 404, { error: "Usuário não encontrado", auth: false });
            }

            const token = createToken({ idUser: user.idUser, email: user.email, role: user.role });
            delete tempUsers[email];

            const isManager = user.role === "manager";
            
            return handleResponse(res, 200, {
                message: "Cadastro bem-sucedido",
                user: { ...user, isManager },
                token,
                auth: true,
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { error: "Erro Interno do Servidor", auth: false });
        }
    }

    static async loginUser(req, res) {
        const { email, password } = req.body;

        const loginValidationError = validateUser.validateLogin(req.body);
        if (loginValidationError) {
            return handleResponse(res, 400, { ...loginValidationError, auth: false });
        }

        try {
            const user = await findUserByEmail(email);

            if (!user) {
                return handleResponse(res, 404, { error: "Usuário não encontrado", auth: false });
            }

            const passwordOK = bcrypt.compareSync(password, user.hashedPassword);
            if (!passwordOK) {
                return handleResponse(res, 401, { error: "Senha Incorreta" });
            }

            const token = createToken({ idUser: user.idUser, email: user.email, role: user.role });

            const isManager = user.role === "manager";

            return handleResponse(res, 200, {
                message: "Login Bem-sucedido",
                user: { ...user, isManager },
                token,
                auth: true,
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { error: "Erro Interno do Servidor", auth: false });
        }
    }

    static async getAllUsers(req, res) {
        const query = `SELECT idUser, name, email, role, createdAt FROM user WHERE isActive = TRUE`;
        try {
            const results = await queryAsync(query);
            return handleResponse(res, 200, { message: "Obtendo todos os usuários", users: results, auth: true });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { error: "Erro Interno do Servidor", auth: false });
        }
    }

    static async updateUser(req, res) {
        const { idUser } = req.params;
        const { name, email, password } = req.body;

        if (req.userId != idUser) {
            return handleResponse(res, 403, { error: "Não autorizado", auth: false });
        }

        const updateValidationError = validateUser.validateUpdate(req.body, idUser);
        if (updateValidationError) {
            return handleResponse(res, 400, { ...updateValidationError, auth: false });
        }

        try {
            const userToUpdate = await findUserById(idUser);
            if (!userToUpdate) {
                return handleResponse(res, 404, { error: "Usuário não encontrado", auth: false });
            }

            // Cenário 1: O e-mail foi alterado.
            if (email && email !== userToUpdate.email) {
                const emailValidationError = await validateUser.validateEmail(email);
                if (emailValidationError && emailValidationError.error) {
                    return handleResponse(res, 400, { ...emailValidationError, auth: false });
                }

                const verificationCode = generateRandomCode();
                const emailSent = await mailSender.sendVerificationEmail(email, verificationCode, "updateVerification.html");

                if (!emailSent) {
                    return handleResponse(res, 500, { error: "Erro ao enviar o e-mail de verificação.", auth: false });
                }

                const hashedPassword = password ? bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS)) : userToUpdate.hashedPassword;

                tempUsers[email] = {
                    idUser,
                    name: name || userToUpdate.name,
                    oldEmail: userToUpdate.email,
                    newEmail: email,
                    hashedPassword,
                    verificationCode,
                    expiresAt: Date.now() + 5 * 60 * 1000,
                };

                // AQUI, a API retorna uma flag para o cliente informando que uma verificação é necessária
                return handleResponse(res, 200, {
                    message: "Verificação de e-mail necessária. Um código foi enviado para o novo e-mail.",
                    requiresEmailVerification: true, // << NOVO!
                    auth: true,
                });
            }

            // Cenário 2: O e-mail NÃO foi alterado (apenas nome ou senha).
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
                return handleResponse(res, 400, { error: "Nenhum campo para atualizar foi fornecido.", auth: true });
            }

            const updateQuery = `UPDATE user SET ${fieldsToUpdate.join(", ")} WHERE idUser = ?`;
            values.push(idUser);

            await queryAsync(updateQuery, values);
            const updatedUser = await findUserById(idUser);
            await mailSender.sendProfileUpdatedEmail(updatedUser.email, updatedUser);

            // AQUI, a API retorna o objeto de usuário, pois a atualização é final.
            return handleResponse(res, 200, {
                message: "Usuário atualizado com sucesso.",
                user: updatedUser, // << AQUI!
                auth: true,
            });

        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { error: "Erro Interno do Servidor", auth: false });
        }
    }

    static async verifyUpdate(req, res) {
        const { email, code } = req.body;

        if (!email || !code) {
            return handleResponse(res, 400, { error: "E-mail e código são obrigatórios.", auth: false });
        }

        const storedUpdate = tempUsers[email];

        if (!storedUpdate || storedUpdate.verificationCode !== code || Date.now() > storedUpdate.expiresAt) {
            return handleResponse(res, 401, { error: "Código de verificação inválido ou expirado." });
        }

        try {
            const { idUser, name, newEmail, hashedPassword } = storedUpdate;
            const updateQuery = `UPDATE user SET name = ?, email = ?, hashedPassword = ? WHERE idUser = ?`;
            await queryAsync(updateQuery, [name, newEmail, hashedPassword, idUser]);

            const updatedUser = await findUserById(idUser);
            delete tempUsers[email];
            await mailSender.sendProfileUpdatedEmail(updatedUser.email, updatedUser);

            // AQUI, a API retorna o objeto de usuário após a verificação
            return handleResponse(res, 200, {
                message: "Usuário atualizado com sucesso.",
                user: updatedUser, // << AQUI!
                auth: true,
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { error: "Erro Interno do Servidor", auth: false });
        }
    }


    static async verifyUpdate(req, res) {
        const { email, code } = req.body;

        if (!email || !code) {
            return handleResponse(res, 400, { error: "E-mail e código são obrigatórios.", auth: false });
        }

        const storedUpdate = tempUsers[email];

        if (!storedUpdate || storedUpdate.verificationCode !== code || Date.now() > storedUpdate.expiresAt) {
            return handleResponse(res, 401, { error: "Código de verificação inválido ou expirado." });
        }

        try {
            const { idUser, name, newEmail, hashedPassword } = storedUpdate;
            const updateQuery = `UPDATE user SET name = ?, email = ?, hashedPassword = ? WHERE idUser = ?`;
            await queryAsync(updateQuery, [name, newEmail, hashedPassword, idUser]);

            const updatedUser = await findUserById(idUser);
            delete tempUsers[email];
            await mailSender.sendProfileUpdatedEmail(updatedUser.email, updatedUser);

            return handleResponse(res, 200, {
                message: "Usuário atualizado com sucesso.",
                user: updatedUser,
                auth: true,
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { error: "Erro Interno do Servidor", auth: false });
        }
    }

    static async deleteUser(req, res) {
        const { idUser } = req.params;

        if (req.userId != idUser) {
            return handleResponse(res, 403, { error: "Não autorizado", auth: false });
        }

        try {
            const userToDelete = await findUserById(idUser);
            if (!userToDelete) {
                return handleResponse(res, 404, { error: "Usuário não encontrado ou já desativado", auth: false });
            }

            const updateQuery = `UPDATE user SET isActive = FALSE WHERE idUser = ?`;
            await queryAsync(updateQuery, [idUser]);

            await mailSender.sendDeletionEmail(userToDelete.email, userToDelete.name);

            return handleResponse(res, 200, {
                message: "Usuário desativado com sucesso.",
                auth: true,
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { error: "Erro Interno do Servidor", auth: false });
        }
    }

    static async verifyRecoveryPassword(req, res) {
        const { email } = req.body;

        try {
            const user = await findUserByEmail(email);
            if (!user) {
                return handleResponse(res, 404, { error: "E-mail não encontrado." });
            }

            const verificationCode = generateRandomCode();
            const emailSent = await mailSender.sendPasswordRecoveryEmail(email, verificationCode);

            if (!emailSent) {
                return handleResponse(res, 500, { error: "Erro ao enviar o e-mail de recuperação." });
            }

            tempUsers[email] = {
                verificationCode,
                expiresAt: Date.now() + 5 * 60 * 1000,
            };

            return handleResponse(res, 200, {
                message: "Código de recuperação enviado para o seu e-mail.",
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { error: "Erro Interno do Servidor" });
        }
    }

    static async validateRecoveryCode(req, res) {
        const { email, code } = req.body;

        if (!email || !code) {
            return handleResponse(res, 400, { error: "E-mail e código são obrigatórios." });
        }

        const storedRecovery = tempUsers[email];

        if (!storedRecovery || storedRecovery.verificationCode !== code || Date.now() > storedRecovery.expiresAt) {
            return handleResponse(res, 401, { error: "Código de recuperação inválido ou expirado." });
        }

        return handleResponse(res, 200, {
            message: "Código de recuperação validado com sucesso. Agora você pode alterar sua senha.",
        });
    }

    static async recoveryPassword(req, res) {
        const { email, password } = req.body;

        const storedRecovery = tempUsers[email];
        if (!storedRecovery || Date.now() > storedRecovery.expiresAt) {
            return handleResponse(res, 401, { error: "Código de recuperação inválido ou expirado. Por favor, solicite um novo código." });
        }

        const recoveryValidationError = validateUser.validateRecovery(req.body);
        if (recoveryValidationError) {
            return handleResponse(res, 400, recoveryValidationError);
        }

        try {
            const saltRounds = Number(process.env.SALT_ROUNDS);
            const hashedPassword = bcrypt.hashSync(password, saltRounds);

            const updateQuery = `UPDATE user SET hashedPassword = ? WHERE email = ?`;
            await queryAsync(updateQuery, [hashedPassword, email]);

            delete tempUsers[email];

            return handleResponse(res, 200, {
                message: "Senha alterada com sucesso.",
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { error: "Erro Interno do Servidor" });
        }
    }
    static async validatePassword(req, res) {
        const { idUser } = req.params;
        const { password } = req.body; // A senha atual enviada do app
    
        // Se a senha não foi fornecida, retorne um erro.
        if (!password) {
            return handleResponse(res, 400, { error: "Senha é obrigatória." });
        }
    
        try {
            const user = await findUserById(idUser);
            if (!user) {
                return handleResponse(res, 404, { error: "Usuário não encontrado." });
            }
    
            const passwordOK = bcrypt.compareSync(password, user.hashedPassword);
    
            return handleResponse(res, 200, {
                message: "Validação de senha concluída.",
                isValid: passwordOK, // Retorna true ou false
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { error: "Erro Interno do Servidor." });
        }
    }
};