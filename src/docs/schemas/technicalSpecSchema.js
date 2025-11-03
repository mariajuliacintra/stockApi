// src/docs/schemas/technicalSpecSchema.js

module.exports = {
  TechnicalSpec: {
    type: "object",
    properties: {
      idTechnicalSpec: {
        type: "integer",
        description: "ID único da especificação técnica.",
      },
      technicalSpecKey: {
        type: "string",
        description:
          "Chave da especificação técnica (ex: Tensão, Cor, Capacidade).",
      },
    },
    example: { idTechnicalSpec: 1, technicalSpecKey: "Tensão" },
  },
  TechnicalSpecInput: {
    type: "object",
    required: ["technicalSpecKey"],
    properties: {
      technicalSpecKey: {
        type: "string",
        description: "Chave da especificação técnica.",
      },
    },
    example: { technicalSpecKey: "Potência" },
  },
};
