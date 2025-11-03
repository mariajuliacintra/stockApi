// src/docs/schemas/lotSchema.js

module.exports = {
  LotBaseInput: {
    type: "object",
    required: ["quantity", "expirationDate", "fkIdLocation", "fkIdUser"],
    properties: {
      quantity: {
        type: "number",
        format: "float",
        description: "Quantidade inicial do lote (deve ser maior que zero).",
        minimum: 0.01,
      },
      expirationDate: {
        type: "string",
        format: "date",
        description: "Data de validade do lote no formato YYYY-MM-DD.",
        example: "2025-12-31",
      },
      fkIdLocation: {
        type: "integer",
        description:
          "ID da localização (prateleira/armário) onde o lote será armazenado.",
      },
      fkIdUser: {
        type: "integer",
        description:
          "ID do usuário responsável pelo cadastro do lote (para o registro da transação).",
      },
    },
  },
  LotUpdateQuantityInput: {
    type: "object",
    required: ["quantity", "fkIdUser"],
    properties: {
      quantity: {
        type: "number",
        format: "float",
        description:
          "Variação da quantidade (positivo para entrada, negativo para saída). Se `isAjust` for `true`, este será o novo valor total.",
      },
      fkIdUser: {
        type: "integer",
        description:
          "ID do usuário que está realizando a transação (para o registro da transação).",
      },
      isAjust: {
        type: "boolean",
        description:
          "Se verdadeiro, o campo `quantity` define a nova quantidade total do lote (Ajuste). Caso contrário, é uma adição/remoção.",
        default: false,
      },
    },
    example: { quantity: 50, fkIdUser: 1, isAjust: false },
  },
  LotUpdateInformationInput: {
    type: "object",
    properties: {
      expirationDate: {
        type: "string",
        format: "date",
        description: "Nova data de validade do lote no formato YYYY-MM-DD.",
        example: "2026-06-30",
      },
      fkIdLocation: {
        type: "integer",
        description: "Novo ID da localização.",
      },
    },
    minProperties: 1,
    description:
      "Pelo menos um dos campos ('expirationDate' ou 'fkIdLocation') deve ser fornecido.",
  },
  LotResponse: {
    type: "object",
    properties: {
      idLot: { type: "integer" },
      lotNumber: { type: "integer" },
      quantity: { type: "number", format: "float" },
      expirationDate: { type: "string", format: "date" },
      fkIdLocation: { type: "integer" },
      fkIdItem: { type: "integer" },
    },
    example: {
      idLot: 10,
      lotNumber: 3,
      quantity: 150.5,
      expirationDate: "2025-12-31",
      fkIdLocation: 5,
      fkIdItem: 2,
    },
  },
};
