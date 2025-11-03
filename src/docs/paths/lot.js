// src/docs/paths/lot.js

module.exports = {
  // POST /lot/sapcode/{sapCode}
  "/lot/sapcode/{sapCode}": {
    post: {
      summary: "Cria um novo lote, buscando o ID do Item pelo Código SAP",
      tags: ["Lot"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/sapCodeParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LotBaseInput",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Lote criado com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Novo lote criado com sucesso!",
                  },
                  data: {
                    type: "object",
                    properties: {
                      lotId: { type: "integer" },
                      lotNumber: { type: "integer" },
                      sapCode: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: {
          $ref: "#/components/responses/NotFound",
          description: "Código SAP não encontrado.",
        },
        409: {
          $ref: "#/components/responses/Conflict",
          description:
            "Conflito de chave estrangeira (Localização ou Usuário inválido).",
        },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },

  // POST /lot/item/{idItem}
  "/lot/item/{idItem}": {
    post: {
      summary: "Cria um novo lote diretamente pelo ID do Item",
      tags: ["Lot"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/idItemParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LotBaseInput",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Lote criado com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Novo lote criado com sucesso!",
                  },
                  data: {
                    type: "object",
                    properties: {
                      lotId: { type: "integer" },
                      lotNumber: { type: "integer" },
                      idItem: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        409: {
          $ref: "#/components/responses/Conflict",
          description:
            "Conflito de chave estrangeira (Item, Localização ou Usuário inválido).",
        },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },

  // PUT /lot/quantity/{idLot}
  "/lot/quantity/{idLot}": {
    put: {
      summary: "Atualiza a quantidade de um lote e registra a transação",
      tags: ["Lot"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/idLotParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LotUpdateQuantityInput",
            },
          },
        },
      },
      responses: {
        200: { $ref: "#/components/responses/SuccessMessage" },
        400: {
          $ref: "#/components/responses/BadRequest",
          description: "Requisição inválida (Ex: quantidade final negativa).",
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        409: {
          $ref: "#/components/responses/Conflict",
          description: "Conflito de chave estrangeira (Usuário inválido).",
        },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },

  // PUT /lot/information/{idLot}
  "/lot/information/{idLot}": {
    put: {
      summary: "Atualiza a data de validade e/ou a localização de um lote",
      tags: ["Lot"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/idLotParam" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LotUpdateInformationInput",
            },
          },
        },
      },
      responses: {
        200: { $ref: "#/components/responses/SuccessMessage" },
        400: {
          $ref: "#/components/responses/BadRequest",
          description:
            "Requisição inválida (Ex: nenhum campo fornecido para atualização).",
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        409: {
          $ref: "#/components/responses/Conflict",
          description: "Conflito de chave estrangeira (Localização inválida).",
        },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },

  // DELETE /lot/{idLot}
  "/lot/{idLot}": {
    delete: {
      summary: "Exclui um lote por ID",
      tags: ["Lot"],
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: "#/components/parameters/idLotParam" }],
      responses: {
        200: { $ref: "#/components/responses/SuccessMessage" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
        409: {
          $ref: "#/components/responses/Conflict",
          description:
            "Conflito de chave estrangeira (O lote está referenciado em outro lugar).",
        },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
};
