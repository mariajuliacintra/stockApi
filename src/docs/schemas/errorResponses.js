// src/docs/schemas/errorResponses.js

module.exports = {
    ErrorResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                description: "Sempre false em caso de erro",
                example: false
            },
            error: {
                type: "string",
                description: "Mensagem de erro de alto nível (Ex: 'Erro interno do servidor', 'Campos obrigatórios ausentes')"
            },
            details: {
                type: "string",
                description: "Detalhes técnicos ou específicos do erro, como a mensagem de exceção ou campo ausente."
            }
        },
        required: ["success", "error"]
    }
};