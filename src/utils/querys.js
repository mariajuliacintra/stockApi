const { queryAsync } = require('./functions');

const findUserByEmail = async (email) => {
    const query = `SELECT * FROM user WHERE email = ? AND isActive = TRUE`;
    const results = await queryAsync(query, [email]);
    return results[0] || null;
};

const findUserById = async (idUser) => {
    const query = `SELECT * FROM user WHERE idUser = ? AND isActive = TRUE`;
    const results = await queryAsync(query, [idUser]);
    return results[0] || null;
};

const validateForeignKey = async (tableName, idName, idValue) => {
    const numericIdValue = Number(idValue);
    if (isNaN(numericIdValue)) {
        return { success: false, message: `O valor para ${idName} deve ser um número válido.`, error: "Erro de validação", details: `O valor '${idValue}' não é um número.` };
    }

    try {
        const query = `SELECT COUNT(*) AS count FROM ${tableName} WHERE ${idName} = ?`;
        const [result] = await queryAsync(query, [numericIdValue]);
        if (result.count === 0) {
            return { success: false, message: `O ID fornecido para a tabela '${tableName}' não existe.`, error: "Chave estrangeira inválida", details: `Não foi encontrado um registro com ${idName} = ${idValue}.` };
        }
        return { success: true };
    } catch (error) {
        console.error("Erro na validação de chaves estrangeiras:", error);
        return { success: false, error: "Erro interno do servidor", details: "Ocorreu um problema inesperado durante a validação." };
    }
};

module.exports = { findUserByEmail, findUserById, validateForeignKey };