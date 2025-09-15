const { queryAsync } = require('../utils/functions');

// Função auxiliar para validar a existência de uma chave estrangeira
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

const validateCreateItem = async (data) => {
    const { name, fkIdCategory, quantity, fkIdLocation, fkIdUser, minimumStock, sapCode } = data;

    if (!name || fkIdCategory === undefined || quantity === undefined || fkIdLocation === undefined || fkIdUser === undefined) {
        return { success: false, error: "Campos obrigatórios ausentes", message: "Os campos 'name', 'fkIdCategory', 'quantity', 'fkIdLocation' e 'fkIdUser' são obrigatórios.", details: "Verifique se todos os campos necessários foram fornecidos." };
    }

    if (minimumStock !== undefined) {
        const numericMinimumStock = Number(minimumStock);
        if (isNaN(numericMinimumStock) || !Number.isInteger(numericMinimumStock) || numericMinimumStock < 0) {
            return { success: false, error: "Valor de estoque mínimo inválido", message: "O estoque mínimo deve ser um número inteiro não negativo.", details: "O valor fornecido não atende aos critérios de estoque mínimo." };
        }
    }

    const numericQuantity = Number(quantity);
    if (isNaN(numericQuantity) || numericQuantity <= 0) {
        return { success: false, error: "Quantidade inválida", message: "A quantidade deve ser um número válido e maior que zero.", details: "Por favor, forneça uma quantidade válida para a criação do item." };
    }

    if (sapCode !== undefined) {
        const numericSapCode = Number(sapCode);
        if (isNaN(numericSapCode) || !Number.isInteger(numericSapCode)) {
            return { success: false, error: "Código SAP inválido", message: "O código SAP deve ser um número inteiro.", details: "O valor fornecido para o código SAP não é um número inteiro." };
        }
    }

    try {
        const categoryValidation = await validateForeignKey('category', 'idCategory', fkIdCategory);
        if (!categoryValidation.success) return categoryValidation;

        const locationValidation = await validateForeignKey('location', 'idLocation', fkIdLocation);
        if (!locationValidation.success) return locationValidation;

        const userValidation = await validateForeignKey('user', 'idUser', fkIdUser);
        if (!userValidation.success) return userValidation;

        if (sapCode !== undefined) {
            const sapCodeQuery = "SELECT COUNT(*) AS count FROM item WHERE sapCode = ?";
            const [sapCodeResult] = await queryAsync(sapCodeQuery, [sapCode]);
            if (sapCodeResult.count > 0) {
                return { success: false, error: "Código SAP já em uso", message: "O código SAP fornecido já está em uso por outro item.", details: "Por favor, use um código SAP único." };
            }
        }
    } catch (error) {
        console.error("Erro na validação de chaves estrangeiras do item:", error);
        return { success: false, error: "Erro interno do servidor", details: "Ocorreu um problema inesperado durante a validação." };
    }
    
    return { success: true, message: "Validação de criação de item bem-sucedida." };
};

const validateUpdateInformation = (data) => {
    const updateFields = ['name', 'aliases', 'brand', 'description', 'technicalSpecs', 'fkIdCategory', 'sapCode', 'minimumStock'];
    const hasUpdateField = updateFields.some(field => data[field] !== undefined);

    if (!hasUpdateField) {
        return { success: false, error: "Nenhum campo para atualização", message: "Pelo menos um campo para atualização de informações deve ser fornecido.", details: "Você deve fornecer 'name', 'aliases', 'brand', 'description', 'technicalSpecs', 'fkIdCategory', 'sapCode' ou 'minimumStock'." };
    }
    
    const { fkIdCategory, sapCode, minimumStock } = data;

    if (fkIdCategory !== undefined) {
        const numericCategory = Number(fkIdCategory);
        if (isNaN(numericCategory)) {
            return { success: false, error: "ID de categoria inválido", message: "A categoria deve ser um número válido.", details: "O valor fornecido para 'fkIdCategory' não é um número." };
        }
    }
    
    if (sapCode !== undefined) {
        const numericSapCode = Number(sapCode);
        if (isNaN(numericSapCode) || !Number.isInteger(numericSapCode)) {
            return { success: false, error: "Código SAP inválido", message: "O código SAP deve ser um número inteiro.", details: "O valor fornecido para 'sapCode' não é um número inteiro." };
        }
    }

    if (minimumStock !== undefined) {
        const numericMinimumStock = Number(minimumStock);
        if (isNaN(numericMinimumStock) || !Number.isInteger(numericMinimumStock) || numericMinimumStock < 0) {
            return { success: false, error: "Valor de estoque mínimo inválido", message: "O estoque mínimo deve ser um número inteiro não negativo.", details: "O valor fornecido para 'minimumStock' não atende aos critérios." };
        }
    }

    return { success: true, message: "Validação de atualização de item bem-sucedida." };
};

module.exports = {
    validateCreateItem,
    validateUpdateInformation,
    validateForeignKey
};