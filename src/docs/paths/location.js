// src/docs/paths/locations.js

module.exports = {
  "/location": {
    get: {
      summary: "Lista todas as localizações",
      tags: ["Location"],
      security: [
        {
          jwtAuth: [],
        },
      ],
      responses: {
        200: {
          description: "Sucesso na obtenção da lista de localizações",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Location",
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
      summary: "Cria uma nova localização",
      tags: ["Location"],
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
              $ref: "#/components/schemas/LocationInput",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Localização criada com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Localização criada com sucesso!",
                  },
                  data: {
                    type: "object",
                    properties: {
                      locationId: {
                        type: "integer",
                        description: "ID da localização inserida",
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
        409: { $ref: "#/components/responses/Conflict" },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
  "/location/{idLocation}": {
    // Uso de idLocation conforme o parâmetro comum
    get: {
      summary: "Busca localização por ID",
      tags: ["Location"],
      security: [
        {
          jwtAuth: [],
        },
      ],
      parameters: [
        {
          $ref: "#/components/parameters/idLocationParam",
        },
      ],
      responses: {
        200: {
          description: "Sucesso na obtenção da localização",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Location",
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
      summary: "Atualiza uma localização por ID",
      tags: ["Location"],
      security: [
        {
          jwtAuth: [],
        },
      ],
      parameters: [
        {
          $ref: "#/components/parameters/idLocationParam",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LocationInput",
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
        409: { $ref: "#/components/responses/Conflict" },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
    delete: {
      summary: "Exclui uma localização por ID",
      tags: ["Location"],
      security: [
        {
          jwtAuth: [],
        },
      ],
      parameters: [
        {
          $ref: "#/components/parameters/idLocationParam",
        },
      ],
      responses: {
        200: { $ref: "#/components/responses/SuccessMessage" },
        401: { $ref: "#/components/responses/Unauthorized" },
        403: { $ref: "#/components/responses/Forbidden" },
        404: { $ref: "#/components/responses/NotFound" },
        409: { $ref: "#/components/responses/Conflict" },
        500: { $ref: "#/components/responses/InternalServerError" },
      },
    },
  },
};
