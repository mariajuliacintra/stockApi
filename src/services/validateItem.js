const { queryAsync } = require('../utils/functions');

// Função auxiliar para validar a existência de uma chave estrangeira
const validateForeignKey = async (tableName, idName, idValue) => {
    // Garante que idValue é um número antes de passar para a query
    const numericIdValue = Number(idValue);
    if (isNaN(numericIdValue)) {
        return false; // Retorna falso se o ID não for um número válido
    }
    const query = `SELECT COUNT(*) AS count FROM ${tableName} WHERE ${idName} = ?`;
    const [result] = await queryAsync(query, [numericIdValue]);
    return result.count > 0;
};

const validateCreateItem = async (data) => {
    const { name, aliases, brand, description, technicalSpecs, category, imageData, quantity, expirationDate, fkIdLocation, fkIdUser, sapCode } = data; // Adicionados campos para completar a validação de campos obrigatórios

    // 1. Validação de campos obrigatórios (mais explícita)
    if (!name || !category || quantity === undefined || fkIdLocation === undefined || fkIdUser === undefined) {
        // Consideramos `undefined` para os IDs para garantir que foram enviados.
        // `quantity` pode ser 0, então não usamos `!quantity`.
        return { isValid: false, message: "Campos obrigatórios: 'name', 'category', 'quantity', 'fkIdLocation', e 'fkIdUser' são necessários." };
    }

    // 2. Validação da quantidade
    const numericQuantity = Number(quantity);
    if (isNaN(numericQuantity) || numericQuantity < 0) {
        return { isValid: false, message: "A quantidade deve ser um número válido e não pode ser negativa." };
    }

    // 3. Validação de categoria
    const validCategories = ['tool', 'material', 'rawMaterial', 'equipment', 'product', 'diverses'];
    if (!validCategories.includes(category)) {
        return { isValid: false, message: "A categoria fornecida não é válida." };
    }
    
    // 4. Validação de fkIdLocation e fkIdUser (garantindo que são números)
    try {
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
    
    // 5. Validação de sapCode (se presente)
    if (sapCode !== undefined) {
        const numericSapCode = Number(sapCode);
        // Verifica se é um número inteiro válido
        if (isNaN(numericSapCode) || !Number.isInteger(numericSapCode)) {
            return { isValid: false, message: "O código SAP deve ser um número inteiro." };
        }
        try {
            // A validação de unicidade do sapCode já é feita no controller, mas pode ser útil ter uma
            // validação de formato aqui também. Se já está no controller, podemos remover essa parte.
            // Para manter a validação de formato aqui:
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
    const updateFields = ['name', 'aliases', 'brand', 'description', 'technicalSpecs', 'category', 'imageData', 'sapCode'];
    const hasUpdateField = updateFields.some(field => data[field] !== undefined);

    if (!hasUpdateField) {
        return { isValid: false, message: "Pelo menos um campo para atualização de informações deve ser fornecido." };
    }

    const { category, sapCode } = data;

    // Validação de Categoria (se fornecida)
    if (category !== undefined) {
        const validCategories = ['tool', 'material', 'rawMaterial', 'equipment', 'product', 'diverses'];
        if (!validCategories.includes(category)) {
            return { isValid: false, message: "A categoria fornecida não é válida." };
        }
    }
    
    // Validação de sapCode (se fornecido)
    if (sapCode !== undefined) {
        const numericSapCode = Number(sapCode);
        // Verifica se é um número inteiro válido
        if (isNaN(numericSapCode) || !Number.isInteger(numericSapCode)) {
            return { isValid: false, message: "O código SAP deve ser um número inteiro." };
        }
        // A validação de unicidade do sapCode é feita na função que manipula o banco (service/controller).
    }

    return { isValid: true };
};

module.exports = {
    validateCreateItem,
    validateUpdateInformation,
};