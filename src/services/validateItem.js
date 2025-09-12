const { queryAsync } = require('../utils/functions');

// Função auxiliar para validar a existência de uma chave estrangeira
const validateForeignKey = async (tableName, idName, idValue) => {
    const numericIdValue = Number(idValue);
    if (isNaN(numericIdValue)) {
        return false;
    }
    const query = `SELECT COUNT(*) AS count FROM ${tableName} WHERE ${idName} = ?`;
    const [result] = await queryAsync(query, [numericIdValue]);
    return result.count > 0;
};

const validateCreateItem = async (data) => {
    const { name, aliases, brand, description, technicalSpecs, fkIdCategory, quantity, expirationDate, fkIdLocation, fkIdUser, sapCode } = data;

    if (!name || fkIdCategory === undefined || quantity === undefined || fkIdLocation === undefined || fkIdUser === undefined) {
        return { isValid: false, message: "Campos obrigatórios: 'name', 'fkIdCategory', 'quantity', 'fkIdLocation', e 'fkIdUser' são necessários." };
    }

    const numericQuantity = Number(quantity);
    if (isNaN(numericQuantity) || numericQuantity < 0) {
        return { isValid: false, message: "A quantidade deve ser um número válido e não pode ser negativa." };
    }

    try {
        if (!(await validateForeignKey('category', 'idCategory', fkIdCategory))) {
            return { isValid: false, message: "A categoria fornecida não existe." };
        }
        if (!(await validateForeignKey('location', 'idLocation', fkIdLocation))) {
            return { isValid: false, message: "A localização fornecida não existe." };
        }
        if (!(await validateForeignKey('user', 'idUser', fkIdUser))) {
            return { isValid: false, message: "O usuário fornecido não existe." };
        }
    } catch (error) {
        console.error("Erro na validação de chaves estrangeiras do item:", error);
        return { isValid: false, message: "Erro interno do servidor durante a validação." };
    }
    
    if (sapCode !== undefined) {
        const numericSapCode = Number(sapCode);
        if (isNaN(numericSapCode) || !Number.isInteger(numericSapCode)) {
            return { isValid: false, message: "O código SAP deve ser um número inteiro." };
        }
        try {
            const sapCodeQuery = "SELECT COUNT(*) AS count FROM item WHERE sapCode = ?";
            const [sapCodeResult] = await queryAsync(sapCodeQuery, [numericSapCode]);
            if (sapCodeResult.count > 0) {
                return { isValid: false, message: "O código SAP fornecido já está em uso." };
            }
        } catch (error) {
            console.error("Erro na validação do código SAP:", error);
            return { isValid: false, message: "Erro interno do servidor durante a validação do SAP Code." };
        }
    }

    return { isValid: true };
};

const validateUpdateInformation = (data) => {
    const updateFields = ['name', 'aliases', 'brand', 'description', 'technicalSpecs', 'fkIdCategory', 'sapCode'];
    const hasUpdateField = updateFields.some(field => data[field] !== undefined);

    if (!hasUpdateField) {
        return { isValid: false, message: "Pelo menos um campo para atualização de informações deve ser fornecido." };
    }

    const { category: fkIdCategory, sapCode } = data;

    if (fkIdCategory !== undefined) {
        const numericCategory = Number(fkIdCategory);
        if (isNaN(numericCategory)) {
            return { isValid: false, message: "A categoria deve ser um número válido." };
        }
        // A validação de existência da categoria é feita no controller
    }
    
    if (sapCode !== undefined) {
        const numericSapCode = Number(sapCode);
        if (isNaN(numericSapCode) || !Number.isInteger(numericSapCode)) {
            return { isValid: false, message: "O código SAP deve ser um número inteiro." };
        }
    }

    return { isValid: true };
};

module.exports = {
    validateCreateItem,
    validateUpdateInformation,
};