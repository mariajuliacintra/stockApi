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
            return handleResponse(res, 400, { success: false, ...userValidationError });
        }

        try {
            const userToReactivate = await validateUser.findUserByEmailAndActiveStatus(email, false);
            if (userToReactivate) {
                const verificationCode = generateRandomCode();
                const emailSent = await mailSender.sendVerificationEmail(email, verificationCode, "mailVerification.html");

                if (!emailSent) {
                    return handleResponse(res, 500, { success: false, error: "Erro ao enviar o e-mail de verificação.", details: "Falha na comunicação com o serviço de e-mail." });
                }

                const saltRounds = Number(process.env.SALTROUNDS);
                const hashedPassword = bcrypt.hashSync(password, saltRounds);

                tempUsers[email] = {
                    idUser: userToReactivate.idUser,
                    name,
                    hashedPassword,
                    verificationCode,
                    expiresAt: Date.now() + 5 * 60 * 1000,
                    reactivating: true
                };

                return handleResponse(res, 200, { success: true, message: "E-mail já cadastrado, mas a conta está inativa.", details: "Um código de verificação foi enviado para reativá-la." });
            }

            const emailValidationError = await validateUser.validateEmail(email);
            if (emailValidationError) {
                return handleResponse(res, 400, { success: false, ...emailValidationError });
            }

            const verificationCode = generateRandomCode();
            const emailSent = await mailSender.sendVerificationEmail(email, verificationCode, "mailVerification.html");

            if (!emailSent) {
                return handleResponse(res, 500, { success: false, error: "Erro ao enviar o e-mail de verificação.", details: "Falha na comunicação com o serviço de e-mail." });
            }

            const saltRounds = Number(process.env.SALTROUNDS);
            const hashedPassword = bcrypt.hashSync(password, saltRounds);

            tempUsers[email] = {
                name,
                email,
                hashedPassword,
                verificationCode,
                expiresAt: Date.now() + 5 * 60 * 1000,
            };

            return handleResponse(res, 200, { success: true, message: "Usuário temporariamente cadastrado.", details: "Verifique seu e-mail para o código de verificação." });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { success: false, error: "Erro Interno do Servidor", details: "Ocorreu um problema inesperado. Tente novamente mais tarde." });
        }
    }

    static async registerUserByManager(req, res) {
        const { name, email, password, role: newRole } = req.body;
        const { role } = req;

        if (role !== "manager") {
            return handleResponse(res, 403, { success: false, error: "Não autorizado", details: "Apenas gerentes podem cadastrar novos usuários." });
        }

        const userValidationError = validateUser.validateUser(req.body);
        if (userValidationError) {
            return handleResponse(res, 400, { success: false, ...userValidationError });
        }

        if (!newRole || !["user", "manager"].includes(newRole)) {
            return handleResponse(res, 400, { success: false, error: "A função (role) é obrigatória e deve ser 'user' ou 'manager'." });
        }

        try {
            const userToReactivate = await validateUser.findUserByEmailAndActiveStatus(email, false);
            if (userToReactivate) {

                const verificationCode = generateRandomCode();
                const emailSent = await mailSender.sendVerificationEmail(email, verificationCode, "mailVerification.html");

                if (!emailSent) {
                    return handleResponse(res, 500, { success: false, error: "Erro ao enviar o e-mail de verificação.", details: "Falha na comunicação com o serviço de e-mail." });
                }

                const saltRounds = Number(process.env.SALTROUNDS);
                const hashedPassword = bcrypt.hashSync(password, saltRounds);

                tempUsers[email] = {
                    idUser: userToReactivate.idUser,
                    name,
                    hashedPassword,
                    newRole,
                    verificationCode,
                    expiresAt: Date.now() + 5 * 60 * 1000,
                    reactivating: true,
                    isManagerRegistration: true,
                };

                return handleResponse(res, 200, { success: true, message: "E-mail já cadastrado, mas a conta está inativa.", details: "Um código de verificação foi enviado para reativá-la." });
            }

            const userExists = await findUserByEmail(email);
            if (userExists) {
                return handleResponse(res, 409, { success: false, error: "E-mail já cadastrado", details: "Este e-mail já está sendo utilizado por outro usuário." });
            }

            const verificationCode = generateRandomCode();
            const emailSent = await mailSender.sendVerificationEmail(email, verificationCode, "mailVerification.html");

            if (!emailSent) {
                return handleResponse(res, 500, { success: false, error: "Erro ao enviar o e-mail de verificação.", details: "Falha na comunicação com o serviço de e-mail." });
            }

            const saltRounds = Number(process.env.SALTROUNDS);
            const hashedPassword = bcrypt.hashSync(password, saltRounds);

            tempUsers[email] = {
                name,
                email,
                hashedPassword,
                newRole,
                verificationCode,
                expiresAt: Date.now() + 5 * 60 * 1000,
                isManagerRegistration: true,
            };

            return handleResponse(res, 200, { success: true, message: "Usuário temporariamente cadastrado.", details: "Verifique o e-mail para o código de verificação." });

        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { success: false, error: "Erro Interno do Servidor", details: "Ocorreu um problema inesperado. Tente novamente mais tarde." });
        }
    }

    static async verifyUser(req, res) {
        const { email, code } = req.body;

        if (!email || !code) {
            return handleResponse(res, 400, { success: false, error: "E-mail e código são obrigatórios.", details: "Os campos 'email' e 'code' não foram fornecidos." });
        }

        const storedUser = tempUsers[email];

        if (!storedUser || storedUser.verificationCode !== code || Date.now() > storedUser.expiresAt) {
            return handleResponse(res, 401, { success: false, error: "Código de verificação inválido ou expirado.", details: "O código fornecido não corresponde ou o tempo de validade expirou." });
        }

        try {
            if (storedUser.reactivating) {
                const { idUser, name, hashedPassword } = storedUser;

                const roleToReactivate = storedUser.isManagerRegistration && storedUser.newRole ? storedUser.newRole : "user"; 

                const reactivateQuery = `UPDATE user SET name = ?, hashedPassword = ?, role = ?, isActive = TRUE WHERE idUser = ?`;

                await queryAsync(reactivateQuery, [name, hashedPassword, roleToReactivate, idUser]);

                const user = await findUserById(idUser);
                const token = createToken({ idUser: user.idUser, email: user.email, role: user.role });
                delete tempUsers[email];
                const isManager = user.role === "manager";

                return handleResponse(res, 200, {
                    success: true,
                    message: "Conta reativada com sucesso!",
                    details: "O login foi realizado automaticamente.",
                    data: { ...user, isManager, token, auth: true },
                    arrayName: "user"
                });
            }

            if (storedUser.isManagerRegistration) {
                const { name, email, hashedPassword, newRole } = storedUser;
                const queryInsert = `INSERT INTO user (name, email, hashedPassword, role, isActive) VALUES (?, ?, ?, ?, TRUE)`;
                await queryAsync(queryInsert, [name, email, hashedPassword, newRole]);
                const user = await findUserByEmail(email);

                if (!user) {
                    return handleResponse(res, 404, { success: false, error: "Usuário não encontrado", details: "O usuário não pôde ser localizado após o cadastro." });
                }

                delete tempUsers[email];

                return handleResponse(res, 201, {
                    success: true,
                    message: "Usuário cadastrado com sucesso pelo gerente.",
                    details: "A conta foi criada e ativada.",
                    data: user,
                    arrayName: "user"
                });
            }

            const { name, hashedPassword } = storedUser;
            const queryInsert = `INSERT INTO user (name, email, hashedPassword, role) VALUES (?, ?, ?, "user")`;
            const valuesInsert = [name, email, hashedPassword];
            await queryAsync(queryInsert, valuesInsert);
            const user = await findUserByEmail(email);

            if (!user) {
                return handleResponse(res, 404, { success: false, error: "Usuário não encontrado", details: "O usuário não pôde ser localizado após o cadastro." });
            }

            const token = createToken({ idUser: user.idUser, email: user.email, role: user.role });
            delete tempUsers[email];
            const isManager = user.role === "manager";

            return handleResponse(res, 200, {
                success: true,
                message: "Cadastro bem-sucedido",
                details: "O login foi realizado automaticamente.",
                data: { ...user, isManager, token, auth: true },
                arrayName: "user"
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { success: false, error: "Erro Interno do Servidor", details: "Ocorreu um problema inesperado durante a verificação." });
        }
    }

    static async loginUser(req, res) {
        const { email, password } = req.body;
        const loginValidationError = validateUser.validateLogin(req.body);

        if (loginValidationError) {
            return handleResponse(res, 400, { success: false, ...loginValidationError });
        }

        try {
            const user = await findUserByEmail(email);

            if (!user) {
                return handleResponse(res, 404, { success: false, error: "Usuário não encontrado", details: "O e-mail fornecido não está cadastrado em nossa base de dados." });
            }

            if (!user.isActive) {
                return handleResponse(res, 403, { success: false, error: "Conta inativa", details: "Sua conta foi desativada. Para reativá-la, tente fazer um novo cadastro." });
            }

            const passwordOK = bcrypt.compareSync(password, user.hashedPassword);
            if (!passwordOK) {
                return handleResponse(res, 401, { success: false, error: "Senha Incorreta", details: "A senha fornecida não corresponde à do usuário." });
            }

            const token = createToken({ idUser: user.idUser, email: user.email, role: user.role });
            const isManager = user.role === "manager";

            return handleResponse(res, 200, {
                success: true,
                message: "Login Bem-sucedido",
                details: "Bem-vindo de volta!",
                data: { ...user, isManager, token, auth: true },
                arrayName: "user"
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { success: false, error: "Erro Interno do Servidor", details: "Ocorreu um problema inesperado durante o login." });
        }
    }

    static async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;
            const countQuery = "SELECT COUNT(*) as count FROM user WHERE isActive = TRUE";
            const [countResult] = await queryAsync(countQuery);
            const totalItems = countResult.count;
            const totalPages = Math.ceil(totalItems / limit);

            const dataQuery = `
                SELECT idUser, name, email, role, createdAt
                FROM user 
                WHERE isActive = TRUE
                ORDER BY name
                LIMIT ?
                OFFSET ?
            `;
            const users = await queryAsync(dataQuery, [limit, offset]);

            return handleResponse(res, 200, {
                success: true,
                message: "Lista de usuários obtida com sucesso.",
                data: {
                    totalItems: totalItems,
                    totalPages: totalPages,
                    currentPage: page,
                    users: users
                },
                arrayName: "data"
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { success: false, error: "Erro Interno do Servidor", details: "Ocorreu um problema ao buscar a lista de usuários." });
        }
    }

    static async getUserById(req, res) {
        const { idUser } = req.params;
        const { userId } = req;

        if (userId != idUser) {
            return handleResponse(res, 403, {
                success: false,
                error: "Acesso negado",
                details: "Você só pode visualizar seu próprio perfil."
            });
        }

        try {
            const user = await findUserById(idUser);

            if (!user) {
                return handleResponse(res, 404, {
                    success: false,
                    error: "Usuário não encontrado",
                    details: "O usuário que você está tentando buscar não existe."
                });
            }

            delete user.hashedPassword;

            return handleResponse(res, 200, {
                success: true,
                message: "Dados do usuário obtidos com sucesso.",
                data: user,
                arrayName: "user"
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, {
                success: false,
                error: "Erro Interno do Servidor",
                details: "Ocorreu um problema inesperado ao buscar o usuário."
            });
        }
    }

    static async updateUser(req, res) {
        const { idUser } = req.params;
        const { name, email, password, role: newRole } = req.body;
        const { role, userId } = req;

        if (role !== "manager" && userId != idUser) {
            return handleResponse(res, 403, { success: false, error: "Não autorizado", details: "Você não tem permissão para alterar este usuário." });
        }

        const updateValidationError = validateUser.validateUpdate(req.body);
        if (updateValidationError) {
            return handleResponse(res, 400, { success: false, ...updateValidationError });
        }

        try {
            const userToUpdate = await findUserById(idUser);
            if (!userToUpdate) {
                return handleResponse(res, 404, { success: false, error: "Usuário não encontrado", details: "O usuário que você está tentando atualizar não existe." });
            }

            if (email && email !== userToUpdate.email) {
                const emailValidationError = await validateUser.validateEmailAllStates(email, idUser); 
                if (emailValidationError) {
                    return handleResponse(res, 400, { success: false, ...emailValidationError });
                }

                const verificationCode = generateRandomCode();
                const emailSent = await mailSender.sendVerificationEmail(email, verificationCode, "updateVerification.html");

                if (!emailSent) {
                    return handleResponse(res, 500, { success: false, error: "Erro ao enviar o e-mail de verificação.", details: "Falha na comunicação com o serviço de e-mail." });
                }

                const hashedPassword = password ? bcrypt.hashSync(password, Number(process.env.SALTROUNDS)) : userToUpdate.hashedPassword;

                tempUsers[email] = {
                    idUser,
                    name: name || userToUpdate.name,
                    oldEmail: userToUpdate.email,
                    newEmail: email,
                    hashedPassword,
                    newRole: newRole || userToUpdate.role,
                    verificationCode,
                    expiresAt: Date.now() + 5 * 60 * 1000,
                };

                return handleResponse(res, 200, { success: true, message: "Verificação de e-mail necessária.", details: "Um código foi enviado para o novo e-mail para confirmar a alteração.", data: { requiresEmailVerification: true }, arrayName: "data" });
            }

            const fieldsToUpdate = [];
            const values = [];

            if (name) {
                fieldsToUpdate.push("name = ?");
                values.push(name);
            }

            if (password) {
                const saltRounds = Number(process.env.SALTROUNDS);
                const hashedPassword = bcrypt.hashSync(password, saltRounds);
                fieldsToUpdate.push("hashedPassword = ?");
                values.push(hashedPassword);
            }

            if (newRole) {
                if (role === "manager") {
                    fieldsToUpdate.push("role = ?");
                    values.push(newRole);
                } else {
                    return handleResponse(res, 403, { success: false, error: "Não autorizado", details: "Você não tem permissão para alterar a função do usuário." });
                }
            }

            if (fieldsToUpdate.length === 0) {
                return handleResponse(res, 400, { success: false, error: "Nenhum campo para atualizar foi fornecido.", details: "Por favor, forneça 'name', 'email', 'password' ou 'role' para atualizar." });
            }

            const updateQuery = `UPDATE user SET ${fieldsToUpdate.join(", ")} WHERE idUser = ?`;
            values.push(idUser);

            await queryAsync(updateQuery, values);
            const updatedUser = await findUserById(idUser);
            await mailSender.sendProfileUpdatedEmail(updatedUser.email, updatedUser);

            return handleResponse(res, 200, {
                success: true,
                message: "Usuário atualizado com sucesso.",
                details: "As informações do seu perfil foram modificadas.",
                data: updatedUser,
                arrayName: "user"
            });

        } catch (error) {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                return handleResponse(res, 409, { success: false, error: "Conflito de E-mail", details: "O novo e-mail fornecido já está em uso por outro usuário." });
            }
            return handleResponse(res, 500, { success: false, error: "Erro Interno do Servidor", details: "Ocorreu um problema inesperado durante a atualização." });
        }
    }

    static async verifyUpdate(req, res) {
        const { email, code } = req.body;

        if (!email || !code) {
            return handleResponse(res, 400, { success: false, error: "E-mail e código são obrigatórios.", details: "Os campos 'email' e 'code' não foram fornecidos." });
        }

        const storedUpdate = tempUsers[email];

        if (!storedUpdate || storedUpdate.verificationCode !== code || Date.now() > storedUpdate.expiresAt) {
            return handleResponse(res, 401, { success: false, error: "Código de verificação inválido ou expirado.", details: "O código fornecido não corresponde ou o tempo de validade expirou." });
        }

        try {
            const { idUser, name, newEmail, hashedPassword, newRole } = storedUpdate;

            const originalUser = await findUserById(idUser);

            if (!originalUser) {
                return handleResponse(res, 404, { success: false, error: "Usuário não encontrado.", details: "O usuário com o ID especificado na atualização temporária não existe." });
            }

            if (!originalUser.isActive) {
                delete tempUsers[email];
                return handleResponse(res, 403, { success: false, error: "Atualização não permitida.", details: "O usuário que você está tentando atualizar está desativado." });
            }

            if (newEmail && newEmail !== originalUser.email) {
                const existingUserWithNewEmail = await validateUser.validateEmailAllStates(newEmail);

                if (existingUserWithNewEmail && existingUserWithNewEmail.idUser !== idUser) {
                    delete tempUsers[email];
                    return handleResponse(res, 409, {
                        success: false,
                        error: "E-mail já está em uso.",
                        details: "O novo e-mail fornecido já está cadastrado para outro usuário (ativo ou desativado)."
                    });
                }
            }

            const fieldsToUpdate = [];
            const values = [];

            fieldsToUpdate.push("name = ?");
            values.push(name);

            fieldsToUpdate.push("email = ?");
            values.push(newEmail);

            fieldsToUpdate.push("hashedPassword = ?");
            values.push(hashedPassword);

            if (newRole && newRole !== originalUser.role) {
                fieldsToUpdate.push("role = ?");
                values.push(newRole);
            }

            const updateQuery = `UPDATE user SET ${fieldsToUpdate.join(", ")} WHERE idUser = ?`;
            values.push(idUser);

            await queryAsync(updateQuery, values);

            const updatedUser = await findUserById(idUser);

            delete tempUsers[email];
            await mailSender.sendProfileUpdatedEmail(updatedUser.email, updatedUser);

            return handleResponse(res, 200, {
                success: true,
                message: "Usuário atualizado com sucesso.",
                details: "Seu e-mail e outras informações foram alteradas.",
                data: updatedUser,
                arrayName: "user"
            });
        } catch (error) {
            console.error(error);

            return handleResponse(res, 500, { success: false, error: "Erro Interno do Servidor", details: "Ocorreu um problema inesperado durante a verificação de atualização." });
        }
    }

    static async deleteUser(req, res) {
        const { idUser } = req.params;
        const { role, userId } = req;

        if (role !== "manager" && userId != idUser) {
            return handleResponse(res, 403, {
                success: false,
                error: "Não autorizado",
                details: "Você não tem permissão para desativar este usuário."
            });
        }

        try {
            const userToDelete = await findUserById(idUser);
            
            if (!userToDelete || !userToDelete.isActive) {
                return handleResponse(res, 404, {
                    success: false,
                    error: "Usuário não encontrado ou já desativado",
                    details: "O usuário não existe ou já foi desativado anteriormente."
                });
            }

            const updateQuery = `UPDATE user SET isActive = FALSE WHERE idUser = ?`;
            await queryAsync(updateQuery, [idUser]);
            await mailSender.sendDeletionEmail(userToDelete.email, userToDelete.name);

            return handleResponse(res, 200, {
                success: true,
                message: "Usuário desativado com sucesso.",
                details: "Sua conta foi desativada e um e-mail de confirmação foi enviado."
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, {
                success: false,
                error: "Erro Interno do Servidor",
                details: "Ocorreu um problema inesperado durante a desativação do usuário."
            });
        }
    }

    static async verifyRecoveryPassword(req, res) {
        const { email } = req.body;

        try {
            const user = await findUserByEmail(email);
            if (!user) {
                return handleResponse(res, 404, { success: false, error: "E-mail não encontrado.", details: "O e-mail fornecido não está cadastrado em nossa base de dados." });
            }

            const verificationCode = generateRandomCode();
            const emailSent = await mailSender.sendPasswordRecoveryEmail(email, verificationCode);

            if (!emailSent) {
                return handleResponse(res, 500, { success: false, error: "Erro ao enviar o e-mail de recuperação.", details: "Falha na comunicação com o serviço de e-mail." });
            }

            tempUsers[email] = {
                verificationCode,
                expiresAt: Date.now() + 5 * 60 * 1000,
            };

            return handleResponse(res, 200, {
                success: true,
                message: "Código de recuperação enviado para o seu e-mail.",
                details: "Verifique sua caixa de entrada, incluindo a pasta de spam."
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { success: false, error: "Erro Interno do Servidor", details: "Ocorreu um problema ao processar a solicitação de recuperação." });
        }
    }

    static async validateRecoveryCode(req, res) {
        const { email, code } = req.body;

        if (!email || !code) {
            return handleResponse(res, 400, { success: false, error: "E-mail e código são obrigatórios.", details: "Os campos 'email' e 'code' não foram fornecidos." });
        }

        const storedRecovery = tempUsers[email];

        if (!storedRecovery || storedRecovery.verificationCode !== code || Date.now() > storedRecovery.expiresAt) {
            return handleResponse(res, 401, { success: false, error: "Código de recuperação inválido ou expirado.", details: "O código não corresponde ou o tempo de validade expirou. Por favor, solicite um novo código." });
        }

        return handleResponse(res, 200, {
            success: true,
            message: "Código de recuperação validado com sucesso.",
            details: "Agora você pode alterar sua senha."
        });
    }

    static async recoveryPassword(req, res) {
        const { email, password } = req.body;

        const storedRecovery = tempUsers[email];
        if (!storedRecovery || Date.now() > storedRecovery.expiresAt) {
            return handleResponse(res, 401, { success: false, error: "Código de recuperação inválido ou expirado.", details: "Por favor, solicite um novo código para alterar sua senha." });
        }

        const recoveryValidationError = validateUser.validateRecovery(req.body);
        if (recoveryValidationError) {
            return handleResponse(res, 400, { success: false, ...recoveryValidationError });
        }

        try {
            const saltRounds = Number(process.env.SALTROUNDS);
            const hashedPassword = bcrypt.hashSync(password, saltRounds);

            const updateQuery = `UPDATE user SET hashedPassword = ? WHERE email = ?`;
            await queryAsync(updateQuery, [hashedPassword, email]);
            delete tempUsers[email];

            return handleResponse(res, 200, {
                success: true,
                message: "Senha alterada com sucesso.",
                details: "Você pode agora fazer login com sua nova senha."
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { success: false, error: "Erro Interno do Servidor", details: "Ocorreu um problema ao alterar a senha." });
        }
    }

    static async validatePassword(req, res) {
        const { idUser } = req.params;
        const { password } = req.body;

        if (!password) {
            return handleResponse(res, 400, { success: false, error: "Senha é obrigatória.", details: "O campo 'password' não foi fornecido." });
        }

        try {
            const user = await findUserById(idUser);
            if (!user) {
                return handleResponse(res, 404, { success: false, error: "Usuário não encontrado.", details: "O ID do usuário não corresponde a nenhum registro." });
            }

            const passwordOK = bcrypt.compareSync(password, user.hashedPassword);

            return handleResponse(res, 200, {
                success: true,
                message: "Validação de senha concluída.",
                details: `A senha fornecida é ${passwordOK ? 'válida' : 'inválida'}.`,
                data: { isValid: passwordOK },
                arrayName: "data"
            });
        } catch (error) {
            console.error(error);
            return handleResponse(res, 500, { success: false, error: "Erro Interno do Servidor.", details: "Ocorreu um problema durante a validação da senha." });
        }
    }
};