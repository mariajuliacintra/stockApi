// src/docs/paths/category.js

// Rotas GET /category e POST /category
module.exports = {
  "/category": {
    get: {
      summary: "Lista todas as categorias",
      tags: ["Category"],
      security: [
        {
          jwtAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Sucesso na obtenção da lista de categorias",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Categorias obtidas com sucesso.",
                  },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/Category",
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
      summary: "Cria uma nova categoria",
      tags: ["Category"],
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
              $ref: "#/components/schemas/CategoryInput",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Categoria criada com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Categoria criada com sucesso!",
                  },
                  data: {
                    type: "object",
                    properties: {
                      categoryId: {
                        type: "integer",
                        description: "ID da categoria inserida",
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
        409: {
          $ref: "#/components/responses/Conflict",
          description: "Conflito (Ex: chave duplicada).",
        },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
  // Rotas GET, PUT, DELETE /category/{idCategory}
  "/category/{idCategory}": {
    get: {
      summary: "Busca categoria por ID",
      tags: ["Category"],
      security: [
        {
          jwtAuth: [],
        },
      ],
      parameters: [
        {
          $ref: "#/components/parameters/idCategoryParam",
        },
      ],
      responses: {
        200: {
          description: "Sucesso na obtenção da categoria",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Category",
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
      summary: "Atualiza uma categoria por ID",
      tags: ["Category"],
      security: [
        {
          jwtAuth: [],
        },
      ],
      parameters: [
        {
          $ref: "#/components/parameters/idCategoryParam",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CategoryInput",
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
        409: {
          $ref: "#/components/responses/Conflict",
          description: "Conflito (Ex: chave duplicada).",
        },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
    delete: {
      summary: "Exclui uma categoria por ID",
      tags: ["Category"],
      security: [
        {
          jwtAuth: [],
        },
      ],
      parameters: [
        {
          $ref: "#/components/parameters/idCategoryParam",
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
            "Conflito (Ex: chave estrangeira, a categoria está em uso).",
        },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
};
