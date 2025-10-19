// src/docs/components.js

// Importa esquemas e parâmetros
const locationSchema = require('./schemas/locationSchema'); // Arquivo existente
const userSchema = require('./schemas/userSchema'); // Novo arquivo de esquemas do usuário
const errorResponses = require('./schemas/errorResponses'); // Arquivo de esquemas de erro
const idLocationParam = require('./parameters/idLocationParam'); // Parâmetro de Localização
const idUserParam = require('./parameters/idUserParam'); // Novo parâmetro de Usuário

module.exports = {
    components: {
        schemas: {
            // Esquemas de Localização
            ...locationSchema,
            // Esquemas de Usuário (resolve os erros de referência)
            ...userSchema, 
            // Esquemas de Erro
            ...errorResponses,
        },
        parameters: {
            // Parâmetros reutilizáveis
            ...idLocationParam,
            ...idUserParam // Adiciona o novo parâmetro de usuário
        },
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                description: "Autenticação via Token JWT. Exemplo: 'Bearer <token>'"
            }
        },
        responses: {
            // Respostas de Sucesso
            SuccessMessage: {
                description: "Operação bem-sucedida, sem retorno de dados específicos.",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                success: { type: "boolean", example: true },
                                message: { type: "string", example: "Operação realizada com sucesso!" }
                            }
                        }
                    }
                }
            },
            // Respostas de Erro Comuns (Baseado no errorResponses.js)
            BadRequest: {
                description: "Requisição inválida (Ex: campos obrigatórios ausentes).",
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/ErrorResponse" },
                        example: {
                            success: false,
                            error: "Campos obrigatórios ausentes",
                            details: "O 'place' e 'code' da localização são obrigatórios."
                        }
                    }
                }
            },
            Unauthorized: {
                description: "Não autenticado (Token JWT ausente ou inválido)."
            },
            Forbidden: {
                description: "Não autorizado (Usuário não tem a permissão necessária - Ex: não é 'manager' ou não pode acessar o recurso)."
            },
            NotFound: {
                description: "Recurso não encontrado (ID não existe).",
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/ErrorResponse" },
                        example: {
                            success: false,
                            error: "Usuário não encontrado",
                            details: "O ID do usuário fornecido não existe."
                        }
                    }
                }
            },
            Conflict: {
                description: "Conflito (Ex: chave duplicada ou restrição de chave estrangeira).",
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/ErrorResponse" },
                        examples: {
                            DuplicateEntry: {
                                summary: "Erro de Duplicidade",
                                value: {
                                    success: false,
                                    error: "E-mail já cadastrado",
                                    details: "Este e-mail já está sendo utilizado por outro usuário."
                                }
                            }
                        }
                    }
                }
            },
            InternalServerError: {
                description: "Erro interno do servidor.",
                content: {
                    "application/json": {
                        schema: { "$ref": "#/components/schemas/ErrorResponse" },
                        example: {
                            success: false,
                            error: "Erro Interno do Servidor",
                            details: "Mensagem de erro do servidor ou do banco de dados."
                        }
                    }
                }
            }
        }
    }
};