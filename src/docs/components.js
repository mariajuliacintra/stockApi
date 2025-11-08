const locationSchema = require("./schemas/locationSchema");
const userSchema = require("./schemas/userSchema");
const errorResponses = require("./schemas/errorResponses");
const categorySchema = require("./schemas/categorySchema");
const lotSchema = require("./schemas/lotSchema");
const technicalSpecSchema = require("./schemas/technicalSpecSchema");
const transactionSchema = require("./schemas/transactionSchema");

const idLocationParam = require("./parameters/idLocationParam");
const idUserParam = require("./parameters/idUserParam");
const idCategoryParam = require("./parameters/idCategoryParam");
const idLotParam = require("./parameters/idLotParam");
const idItemParam = require("./parameters/idItemParam");
const sapCodeParam = require("./parameters/sapCodeParam");
const idTechnicalSpecParam = require("./parameters/idTechnicalSpecParam");
const idTransactionParam = require("./parameters/idTransactionParam");

module.exports = {
  components: {
    schemas: {
      ...locationSchema,
      ...userSchema,
      ...categorySchema,
      ...lotSchema,
      ...technicalSpecSchema,
      ...transactionSchema,
      ...errorResponses,
    },
    parameters: {
      ...idLocationParam,
      ...idUserParam,
      ...idCategoryParam,
      ...idLotParam,
      ...idItemParam,
      ...sapCodeParam,
      ...idTechnicalSpecParam,
      ...idTransactionParam,
    },
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Autenticação via Token JWT. Exemplo: 'Bearer <token>'",
      },
    },
    responses: {
      SuccessMessage: {
        description: "Operação bem-sucedida, sem retorno de dados específicos.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean", example: true },
                message: {
                  type: "string",
                  example: "Operação realizada com sucesso!",
                },
              },
            },
          },
        },
      },
      BadRequest: {
        description: "Requisição inválida (Ex: campos obrigatórios ausentes ou formato incorreto).",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: {
              success: false,
              error: "Campos obrigatórios ausentes",
              details: "O 'place' e 'code' da localização são obrigatórios.",
            },
          },
        },
      },
      Unauthorized: {
        description: "Não autenticado (Token JWT ausente ou inválido).",
      },
      Forbidden: {
        description:
          "Não autorizado (Usuário não tem a permissão necessária - Ex: não é 'manager' ou não pode acessar o recurso).",
      },
      NotFound: {
        description: "Recurso não encontrado (ID fornecido não existe).",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: {
              success: false,
              error: "Usuário não encontrado",
              details: "O ID do usuário fornecido não existe.",
            },
          },
        },
      },
      Conflict: {
        description:
          "Conflito (Ex: chave duplicada ou restrição de chave estrangeira que impede a operação).",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            examples: {
              DuplicateEntry: {
                summary: "Erro de Duplicidade",
                value: {
                  success: false,
                  error: "E-mail já cadastrado",
                  details:
                    "Este e-mail já está sendo utilizado por outro usuário.",
                },
              },
            },
          },
        },
      },
      InternalServerError: {
        description: "Erro interno do servidor (geralmente erro não tratado pelo backend).",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: {
              success: false,
              error: "Erro Interno do Servidor",
              details: "Mensagem de erro do servidor ou do banco de dados.",
            },
          },
        },
      },
    },
  },
};