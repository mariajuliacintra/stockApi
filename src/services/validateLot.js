const { queryAsync } = require('../utils/functions'); // Assumindo que a função está em 'functions'

// Função auxiliar para validar chaves estrangeiras de forma genérica
const validateForeignKey = async (table, column, value) => {
    try {
        const query = `SELECT 1 FROM ${table} WHERE ${column} = ? LIMIT 1`;
        const result = await queryAsync(query, [value]);
        return result.length > 0;
    } catch (error) {
        console.error(`Erro ao validar chave estrangeira ${table}.${column}:`, error);
        return false;
    }
};

const validateCreateLot = async (data) => {
    const { quantity, expirationDate, fkIdLocation, fkIdUser, sapCode, idItem } = data;

    // 1. Validação de campos obrigatórios
    if (quantity === undefined || !fkIdLocation || !fkIdUser) {
        return { isValid: false, message: "Campos obrigatórios: 'quantity', 'fkIdLocation' e 'fkIdUser' são necessários." };
    }

    // 2. Validação da quantidade
    if (isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
        return { isValid: false, message: "A quantidade deve ser um número válido e maior que zero." };
    }

    // 3. Validação de chaves estrangeiras
    try {
        if (!(await validateForeignKey('location', 'idLocation', fkIdLocation))) {
            return { isValid: false, message: "A localização fornecida não existe." };
        }
        if (!(await validateForeignKey('user', 'idUser', fkIdUser))) {
            return { isValid: false, message: "O usuário fornecido não existe." };
        }

        if (idItem) {
            if (!(await validateForeignKey('item', 'idItem', idItem))) {
                return { isValid: false, message: "O item fornecido não existe." };
            }
        } else if (sapCode) {
            const itemQuery = "SELECT idItem FROM item WHERE sapCode = ?";
            const [item] = await queryAsync(itemQuery, [sapCode]);
            if (!item) {
                return { isValid: false, message: "Código SAP não encontrado. Não é possível criar um lote para um item inexistente." };
            }
        } else {
            return { isValid: false, message: "É necessário fornecer 'idItem' ou 'sapCode' para identificar o item." };
        }
        
    } catch (error) {
        console.error("Erro na validação de chaves estrangeiras do lote:", error);
        return { isValid: false, message: "Erro interno do servidor durante a validação." };
    }

    return { isValid: true };
};

const validateUpdateLotQuantity = async (data) => {
    const { quantity, fkIdUser } = data;

    // 1. Validação de campos obrigatórios
    if (quantity === undefined || !fkIdUser) {
        return { isValid: false, message: "Campos obrigatórios: 'quantity' e 'fkIdUser' são necessários." };
    }

    // 2. Validação do tipo de quantidade
    if (isNaN(parseFloat(quantity))) {
        return { isValid: false, message: "A quantidade deve ser um número válido." };
    }
    
    // 3. Validação de chaves estrangeiras
    try {
        if (!(await validateForeignKey('user', 'idUser', fkIdUser))) {
            return { isValid: false, message: "O usuário fornecido não existe." };
        }
    } catch (error) {
        console.error("Erro na validação de fkIdUser para atualização de quantidade:", error);
        return { isValid: false, message: "Erro interno do servidor durante a validação." };
    }

    return { isValid: true };
};

const validateUpdateLotInformation = async (data) => {
    const { expirationDate, fkIdLocation } = data;
    
    // Verifica se pelo menos um campo foi fornecido
    if (expirationDate === undefined && fkIdLocation === undefined) {
        return { isValid: false, message: "Pelo menos um campo para atualização de informações do lote deve ser fornecido." };
    }
    
    try {
        // 1. Validação de fkIdLocation
        if (fkIdLocation !== undefined) {
            if (!(await validateForeignKey('location', 'idLocation', fkIdLocation))) {
                return { isValid: false, message: "A localização fornecida não existe." };
            }
        }

        // 2. Validação de expirationDate
        if (expirationDate !== undefined) {
            if (isNaN(new Date(expirationDate).getTime())) {
                return { isValid: false, message: "A data de validade fornecida não é uma data válida." };
            }
        }
    } catch (error) {
        console.error("Erro na validação de informações do lote:", error);
        return { isValid: false, message: "Erro interno do servidor durante a validação." };
    }

    return { isValid: true };
};

module.exports = {
    validateCreateLot,
    validateUpdateLotQuantity,
    validateUpdateLotInformation,
};