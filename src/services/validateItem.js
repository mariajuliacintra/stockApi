const { queryAsync } = require('../utils/functions');
const { validateForeignKey } = require('../utils/querys');

const validateCreateItem = async (data) => {
    const { name, fkIdCategory, quantity, fkIdLocation, fkIdUser, minimumStock, sapCode, technicalSpecs } = data;

    // 1. Validação de campos obrigatórios
    if (!name || fkIdCategory === undefined || quantity === undefined || fkIdLocation === undefined || fkIdUser === undefined) {
        return { success: false, error: "Campos obrigatórios ausentes", message: "Os campos 'name', 'fkIdCategory', 'quantity', 'fkIdLocation' e 'fkIdUser' são obrigatórios.", details: "Verifique se todos os campos necessários foram fornecidos." };
    }

    // 2. Validação de formato e tipo
    const numericQuantity = Number(quantity);
    if (isNaN(numericQuantity) || numericQuantity <= 0) {
        return { success: false, error: "Quantidade inválida", message: "A quantidade deve ser um número válido e maior que zero.", details: "Por favor, forneça uma quantidade válida para a criação do item." };
    }

    if (minimumStock !== undefined) {
        const numericMinimumStock = Number(minimumStock);
        if (isNaN(numericMinimumStock) || !Number.isInteger(numericMinimumStock) || numericMinimumStock < 0) {
            return { success: false, error: "Valor de estoque mínimo inválido", message: "O estoque mínimo deve ser um número inteiro não negativo.", details: "O valor fornecido não atende aos critérios de estoque mínimo." };
        }
    }

    if (sapCode !== undefined) {
        const numericSapCode = Number(sapCode);
        if (isNaN(numericSapCode) || !Number.isInteger(numericSapCode)) {
            return { success: false, error: "Código SAP inválido", message: "O código SAP deve ser um número inteiro.", details: "O valor fornecido para o código SAP não é um número inteiro." };
        }
    }

    try {
        // 3. Validação de chaves estrangeiras
        const categoryValidation = await validateForeignKey('category', 'idCategory', fkIdCategory);
        if (!categoryValidation.success) return categoryValidation;

        const locationValidation = await validateForeignKey('location', 'idLocation', fkIdLocation);
        if (!locationValidation.success) return locationValidation;

        const userValidation = await validateForeignKey('user', 'idUser', fkIdUser);
        if (!userValidation.success) return userValidation;

        // 4. Validação de especificações técnicas
        if (technicalSpecs !== undefined && technicalSpecs !== null) {
            if (typeof technicalSpecs !== 'object' || Object.keys(technicalSpecs).length === 0) {
                return { success: false, error: "Formato de especificações técnicas inválido", message: "As especificações técnicas devem ser um objeto não vazio.", details: "O valor fornecido para 'technicalSpecs' não é um objeto válido ou está vazio." };
            }

            const technicalSpecKeys = Object.keys(technicalSpecs);
            if (technicalSpecKeys.length > 0) {
                const placeholders = technicalSpecKeys.map(() => '?').join(',');
                const query = `SELECT idTechnicalSpec FROM technicalSpec WHERE idTechnicalSpec IN (${placeholders})`;
                const existingSpecs = await queryAsync(query, technicalSpecKeys);

                const existingSpecIds = new Set(existingSpecs.map(spec => String(spec.idTechnicalSpec)));
                const invalidKeys = technicalSpecKeys.filter(key => !existingSpecIds.has(key));

                if (invalidKeys.length > 0) {
                    return {
                        success: false,
                        error: "ID de especificação técnica inválido",
                        message: `Os seguintes IDs de especificação técnica não existem: ${invalidKeys.join(', ')}.`,
                        details: "Verifique se os IDs fornecidos em 'technicalSpecs' são válidos."
                    };
                }
            }
        }

        // 5. Validação de unicidade do SAP Code
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

const validateUpdateInformation = async (data) => {
    const updateFields = ['name', 'aliases', 'brand', 'description', 'technicalSpecs', 'fkIdCategory', 'sapCode', 'minimumStock'];
    const hasUpdateField = updateFields.some(field => data[field] !== undefined);

    if (!hasUpdateField) {
        return { success: false, error: "Nenhum campo para atualização", message: "Pelo menos um campo para atualização de informações deve ser fornecido.", details: "Você deve fornecer 'name', 'aliases', 'brand', 'description', 'technicalSpecs', 'fkIdCategory', 'sapCode' ou 'minimumStock'." };
    }
    
    const { fkIdCategory, sapCode, minimumStock, technicalSpecs } = data;

    // 1. Validação de formato e tipo de campos
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

    try {
        // 2. Validação de chaves estrangeiras no banco de dados
        if (fkIdCategory !== undefined) {
            const categoryValidation = await validateForeignKey('category', 'idCategory', fkIdCategory);
            if (!categoryValidation.success) return categoryValidation;
        }

        // 3. Validação de especificações técnicas
        if (technicalSpecs !== undefined && technicalSpecs !== null) {
            if (typeof technicalSpecs !== 'object' || Object.keys(technicalSpecs).length === 0) {
                return { success: false, error: "Formato de especificações técnicas inválido", message: "As especificações técnicas devem ser um objeto não vazio.", details: "O valor fornecido para 'technicalSpecs' não é um objeto válido ou está vazio." };
            }

            const technicalSpecKeys = Object.keys(technicalSpecs);
            if (technicalSpecKeys.length > 0) {
                const placeholders = technicalSpecKeys.map(() => '?').join(',');
                const query = `SELECT idTechnicalSpec FROM technicalSpec WHERE idTechnicalSpec IN (${placeholders})`;
                const existingSpecs = await queryAsync(query, technicalSpecKeys);

                const existingSpecIds = new Set(existingSpecs.map(spec => String(spec.idTechnicalSpec)));
                const invalidKeys = technicalSpecKeys.filter(key => !existingSpecIds.has(key));

                if (invalidKeys.length > 0) {
                    return {
                        success: false,
                        error: "ID de especificação técnica inválido",
                        message: `Os seguintes IDs de especificação técnica não existem: ${invalidKeys.join(', ')}.`,
                        details: "Verifique se os IDs fornecidos em 'technicalSpecs' são válidos."
                    };
                }
            }
        }
    } catch (error) {
        console.error("Erro na validação de atualização de item:", error);
        return { success: false, error: "Erro interno do servidor", details: "Ocorreu um problema inesperado durante a validação." };
    }
    
    return { success: true, message: "Validação de atualização de item bem-sucedida." };
};

module.exports = {
    validateCreateItem,
    validateUpdateInformation
};