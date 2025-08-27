const { queryAsync } = require('../utils/functions');

const validateCreateItem = async (data) => {
    const { name, quantity, category, fkIdLocation } = data;

    if (!name || quantity === undefined || !category || !fkIdLocation) {
        return { isValid: false, message: "Campos obrigatórios: 'name', 'quantity', 'category', e 'fkIdLocation' são necessários." };
    }

    if (isNaN(quantity) || quantity < 0) {
        return { isValid: false, message: "A quantidade deve ser um número válido e não pode ser negativa." };
    }

    const validCategories = ['tool', 'material', 'rawMaterial', 'equipment', 'product', 'diverses'];
    if (!validCategories.includes(category)) {
        return { isValid: false, message: "A categoria fornecida não é válida." };
    }

    try {
        const locationQuery = "SELECT COUNT(*) AS count FROM location WHERE idLocation = ?";
        const locationResult = await queryAsync(locationQuery, [fkIdLocation]);
        if (locationResult[0].count === 0) {
            return { isValid: false, message: "A localização fornecida não existe." };
        }
    } catch (error) {
        console.error("Erro na validação de criação do item:", error);
        return { isValid: false, message: "Erro interno do servidor durante a validação." };
    }

    return { isValid: true };
};

const validateUpdateItem = async (data, idItem) => {
    const { name, quantity, batchCode, lotNumber, category, fkIdLocation, isAjust } = data;

    if (!name || quantity === undefined || !batchCode || !category || !fkIdLocation) {
        return { isValid: false, message: "Campos obrigatórios: 'name', 'quantity', 'batchCode', 'category', e 'fkIdLocation' são necessários." };
    }

    if (isNaN(quantity) || (isAjust && quantity < 0)) {
        return { isValid: false, message: "A quantidade deve ser um número válido e, se for um ajuste, não pode ser negativa." };
    }

    const validCategories = ['tool', 'material', 'rawMaterial', 'equipment', 'product', 'diverses'];
    if (!validCategories.includes(category)) {
        return { isValid: false, message: "A categoria fornecida não é válida." };
    }

    try {
        const locationQuery = "SELECT COUNT(*) AS count FROM location WHERE idLocation = ?";
        const locationResult = await queryAsync(locationQuery, [fkIdLocation]);
        if (locationResult[0].count === 0) {
            return { isValid: false, message: "A localização fornecida não existe." };
        }

        const batchQuery = "SELECT COUNT(*) AS count FROM item WHERE batchCode = ? AND lotNumber = ? AND idItem != ?";
        const batchResult = await queryAsync(batchQuery, [batchCode, lotNumber, idItem]);
        if (batchResult[0].count > 0) {
            return { isValid: false, message: "A combinação de lote (batchCode e lotNumber) já existe em outro item." };
        }
    } catch (error) {
        console.error("Erro na validação de atualização do item:", error);
        return { isValid: false, message: "Erro interno do servidor durante a validação." };
    }

    return { isValid: true };
};

module.exports = {
    validateCreateItem,
    validateUpdateItem
};
