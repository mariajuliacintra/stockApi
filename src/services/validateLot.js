const { queryAsync } = require('../utils/functions');
const { validateForeignKey } = require('../utils/querys');

const validateCreateLot = async (data) => {
    const { quantity, fkIdLocation, fkIdUser, sapCode, idItem } = data;
    if (quantity === undefined || fkIdLocation === undefined || fkIdUser === undefined) {
        return { success: false, error: "Campos obrigatórios ausentes", details: "Os campos 'quantity', 'fkIdLocation' e 'fkIdUser' são obrigatórios." };
    }
    const numericQuantity = parseFloat(quantity);
    if (isNaN(numericQuantity) || numericQuantity <= 0) {
        return { success: false, error: "Quantidade inválida", details: "A quantidade deve ser um número válido e maior que zero." };
    }
    try {
        const locationValidation = await validateForeignKey('location', 'idLocation', fkIdLocation);
        if (!locationValidation.success) return locationValidation;
        const userValidation = await validateForeignKey('user', 'idUser', fkIdUser);
        if (!userValidation.success) return userValidation;
        if (idItem) {
            const itemValidation = await validateForeignKey('item', 'idItem', idItem);
            if (!itemValidation.success) return itemValidation;
        } else if (sapCode) {
            const itemQuery = "SELECT idItem FROM item WHERE sapCode = ?";
            const [item] = await queryAsync(itemQuery, [sapCode]);
            if (!item) {
                return { success: false, error: "Item não encontrado", details: "Código SAP não encontrado. Não é possível criar um lote para um item inexistente." };
            }
        } else {
            return { success: false, error: "Identificador ausente", details: "É necessário fornecer 'idItem' ou 'sapCode' para identificar o item." };
        }
    } catch (error) {
        console.error("Erro na validação de chaves estrangeiras do lote:", error);
        return { success: false, error: "Erro interno do servidor", details: "Ocorreu um problema inesperado durante a validação." };
    }
    return { success: true };
};

const validateUpdateLotQuantity = async (data) => {
    const { quantity, fkIdUser } = data;
    if (quantity === undefined || fkIdUser === undefined) {
        return { success: false, error: "Campos obrigatórios ausentes", details: "Os campos 'quantity' e 'fkIdUser' são obrigatórios." };
    }
    if (isNaN(parseFloat(quantity))) {
        return { success: false, error: "Quantidade inválida", details: "A quantidade deve ser um número válido." };
    }
    try {
        const userValidation = await validateForeignKey('user', 'idUser', fkIdUser);
        if (!userValidation.success) return userValidation;
    } catch (error) {
        console.error("Erro na validação de fkIdUser para atualização de quantidade:", error);
        return { success: false, error: "Erro interno do servidor", details: "Ocorreu um problema inesperado durante a validação." };
    }
    return { success: true };
};

const validateUpdateLotInformation = async (data) => {
    const { expirationDate, fkIdLocation } = data;
    if (expirationDate === undefined && fkIdLocation === undefined) {
        return { success: false, error: "Nenhum campo para atualização", details: "Pelo menos um campo para atualização de informações do lote deve ser fornecido." };
    }
    try {
        if (fkIdLocation !== undefined) {
            const locationValidation = await validateForeignKey('location', 'idLocation', fkIdLocation);
            if (!locationValidation.success) return locationValidation;
        }
        if (expirationDate !== undefined) {
            if (isNaN(new Date(expirationDate).getTime())) {
                return { success: false, error: "Data inválida", details: "A data de validade fornecida não é uma data válida." };
            }
        }
    } catch (error) {
        console.error("Erro na validação de informações do lote:", error);
        return { success: false, error: "Erro interno do servidor", details: "Ocorreu um problema inesperado durante a validação." };
    }
    return { success: true };
};

module.exports = {
    validateCreateLot,
    validateUpdateLotQuantity,
    validateUpdateLotInformation,
};