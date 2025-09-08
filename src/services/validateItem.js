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

const validateUpdateInformation = async (data) => {
    const { category, fkIdLocation } = data;
    const updateFields = ['name', 'aliases', 'brand', 'description', 'technicalSpecs', 'expirationDate', 'lastMaintenance', 'category', 'fkIdLocation'];
    const hasUpdateField = updateFields.some(field => data[field] !== undefined);

    if (!hasUpdateField) {
        return { isValid: false, message: "Pelo menos um campo para atualização de informações deve ser fornecido." };
    }

    if (category !== undefined) {
        const validCategories = ['tool', 'material', 'rawMaterial', 'equipment', 'product', 'diverses'];
        if (!validCategories.includes(category)) {
            return { isValid: false, message: "A categoria fornecida não é válida." };
        }
    }

    if (fkIdLocation !== undefined) {
        try {
            const locationQuery = "SELECT COUNT(*) AS count FROM location WHERE idLocation = ?";
            const locationResult = await queryAsync(locationQuery, [fkIdLocation]);
            if (locationResult[0].count === 0) {
                return { isValid: false, message: "A localização fornecida não existe." };
            }
        } catch (error) {
            console.error("Erro na validação de atualização de informações:", error);
            return { isValid: false, message: "Erro interno do servidor durante a validação." };
        }
    }

    return { isValid: true };
};

const validateUpdateQuantity = async (data) => {
    const { quantity, isAjust, fkIdUser } = data;

    if (quantity === undefined || isAjust === undefined || !fkIdUser) {
        return { isValid: false, message: "Campos obrigatórios: 'quantity', 'isAjust' e 'fkIdUser' são necessários." };
    }

    if (isNaN(parseFloat(quantity))) {
        return { isValid: false, message: "A quantidade deve ser um número válido." };
    }

    if (isAjust !== true && isAjust !== false) {
        return { isValid: false, message: "'isAjust' deve ser um valor booleano (true/false)." };
    }

    return { isValid: true };
};

module.exports = {
    validateCreateItem,
    validateUpdateInformation,
    validateUpdateQuantity
};
