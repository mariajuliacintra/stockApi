// src/docs/paths/technicalSpec.js

module.exports = {
  // Rotas GET /technicalSpec e POST /technicalSpec
  "/technicalSpec": {
    get: {
      summary: "Lista todas as especificações técnicas",
      tags: ["Technical Spec"],
      security: [
        {
          jwtAuth: [],
        },
      ],
      responses: {
        200: {
          description:
            "Sucesso na obtenção da lista de especificações técnicas",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Especificações técnicas obtidas com sucesso.",
                  },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/TechnicalSpec",
                    },
                  },
                },
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
    post: {
      summary: "Cria uma nova especificação técnica",
      tags: ["Technical Spec"],
      security: [
        {
          jwtAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/TechnicalSpecInput",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Especificação técnica criada com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Especificação técnica criada com sucesso!",
                  },
                  data: {
                    type: "object",
                    properties: {
                      technicalSpecId: {
                        type: "integer",
                        description: "ID da especificação técnica inserida",
                      },
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
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
  // Rotas GET, PUT, DELETE /technicalSpec/{idTechnicalSpec}
  "/technicalSpec/{idTechnicalSpec}": {
    get: {
      summary: "Busca especificação técnica por ID",
      tags: ["Technical Spec"],
      security: [
        {
          jwtAuth: [],
        },
      ],
      parameters: [
        {
          $ref: "#/components/parameters/idTechnicalSpecParam",
        },
      ],
      responses: {
        200: {
          description: "Sucesso na obtenção da especificação técnica",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/TechnicalSpec",
              },
            },
          },
        },
        401: { $ref: "#/components/responses/Unauthorized" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
    put: {
      summary: "Atualiza uma especificação técnica por ID",
      tags: ["Technical Spec"],
      security: [
        {
          jwtAuth: [],
        },
      ],
      parameters: [
        {
          $ref: "#/components/parameters/idTechnicalSpecParam",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/TechnicalSpecInput",
            },
          },
        },
      },
      responses: {
        200: { $ref: "#/components/responses/SuccessMessage" },
        400: { $ref: "#/components/responses/BadRequest" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
    delete: {
      summary: "Exclui uma especificação técnica por ID",
      tags: ["Technical Spec"],
      security: [
        {
          jwtAuth: [],
        },
      ],
      parameters: [
        {
          $ref: "#/components/parameters/idTechnicalSpecParam",
        },
      ],
      responses: {
        200: { $ref: "#/components/responses/SuccessMessage" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
        409: {
          $ref: "#/components/responses/Conflict",
          description:
            "Conflito de chave estrangeira (A especificação está associada a um item).",
        },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
};
