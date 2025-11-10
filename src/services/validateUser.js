const { validatePassword, validateDomain } = require("../utils/functions");
const { queryAsync } = require("../utils/functions");

const validateUser = function ({ name, email, password, confirmPassword }) {
    if (!name || !email || !password || !confirmPassword) {
        return { error: "Todos os campos devem ser preenchidos", details: "Os campos 'name', 'email', 'password' e 'confirmPassword' são obrigatórios." };
    }
    const domainError = validateDomain(email);
    if (domainError) {
        return { error: domainError.error, details: "O email deve pertencer a um domínio válido. Domínios permitidos: docente.senai.br, sp.senai.br" };
    }
    if (password != confirmPassword) {
        return { error: "As senhas não coincidem", details: "O campo 'password' deve ser idêntico ao campo 'confirmPassword'." };
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return {
            error: "A senha é muito fraca.",
            details: passwordValidation.errors.join(" "),
        };
    }
    return null;
};

const validateEmail = async function (email) {
    try {
        let query = "SELECT idUser FROM user WHERE email = ? AND isActive = TRUE";
        const values = [email];
        const results = await queryAsync(query, values);
        if (results.length > 0) {
            return {
                error: "O Email já está vinculado a outro usuário",
                details: "Este endereço de e-mail já está em uso por uma conta ativa."
            };
        }
        return null;
    } catch (err) {
        console.error(err);
        return { error: "Erro ao verificar email", details: "Ocorreu um problema ao consultar o banco de dados para verificar o e-mail." };
    }
};

const findUserByEmailAndActiveStatus = async (email, isActive) => {
    try {
        const query = `SELECT * FROM user WHERE email = ? AND isActive = ?`;
        const results = await queryAsync(query, [email, isActive]);
        return results[0] || null;
    } catch (err) {
        console.error(err);
        return null;
    }
};

const findUserByEmailAllStates = async function (email) {
    try {
        let query = "SELECT idUser FROM user WHERE email = ?";
        const values = [email];
        const results = await queryAsync(query, values);
        return results.length > 0 ? results[0] : null;
    } catch (err) {
        console.error(err);
        return null;
    }
};

const validateEmailAllStates = async function (email, currentUserId) {
    try {
        const existingUser = await findUserByEmailAllStates(email);
        
        if (existingUser && existingUser.idUser != currentUserId) {
            return {
                error: "O Email já está vinculado a outro usuário",
                details: "Este endereço de e-mail já está em uso por outra conta (ativa ou desativada)."
            };
        }
        return null;
    } catch (err) {
        console.error(err);
        return { error: "Erro ao verificar email", details: "Ocorreu um problema ao consultar o banco de dados para verificar o e-mail." };
    }
};

const validateLogin = function ({ email, password }) {
    if (!email || !password) {
        return { error: "Todos os campos devem ser preenchidos", details: "Os campos 'email' e 'password' são obrigatórios para o login." };
    }
    const domainError = validateDomain(email);
    if (domainError) {
        return { error: domainError.error, details: "O email deve pertencer a um domínio válido. Domínios permitidos: yahoo.com, hotmail.com, outlook.com e gmail.com." };
    }
    return null;
};

const validateUpdate = function ({ name, email, password, confirmPassword }) {
    if (!name && !email && !password) {
        return { error: "Nenhum campo para atualizar foi fornecido.", details: "Por favor, forneça 'name', 'email' ou 'password' para atualizar." };
    }

    if (email) {
        const domainError = validateDomain(email);
        if (domainError) {
            return { error: domainError.error, details: "O novo e-mail deve pertencer a um domínio válido. Domínios permitidos: yahoo.com, hotmail.com, outlook.com e gmail.com." };
        }
    }

    if (password) {
        if (!confirmPassword) {
            return { error: "A confirmação de senha é obrigatória.", details: "É necessário confirmar a nova senha." };
        }
        if (password !== confirmPassword) {
            return { error: "As senhas não coincidem.", details: "O campo 'password' deve ser idêntico ao campo 'confirmPassword'." };
        }
        
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return {
                error: "A nova senha é muito fraca.",
                details: passwordValidation.errors.join(" "),
            };
        }
    }

    return null;
};

const validateRecovery = function ({ password, confirmPassword }) {
    if (!password || !confirmPassword) {
        return { error: "A senha e confirmação de senha são obrigatórias.", details: "Os campos 'password' e 'confirmPassword' são obrigatórios." };
    }
    if (password !== confirmPassword) {
        return { error: "As senhas não coincidem.", details: "O campo 'password' deve ser idêntico ao campo 'confirmPassword'." };
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        return {
            error: "A nova senha é muito fraca.",
            details: passwordValidation.errors.join(" "),
        };
    }
    return null;
}

module.exports = {
    validateUser,
    validateEmail,
    validateLogin,
    validateUpdate,
    validateRecovery,
    findUserByEmailAndActiveStatus,
    findUserByEmailAllStates,
    validateEmailAllStates
};