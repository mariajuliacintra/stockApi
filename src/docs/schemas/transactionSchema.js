// src/docs/schemas/transactionSchema.js

module.exports = {
  TransactionInput: {
    type: "object",
    required: ["fkIdUser", "fkIdLot", "actionDescription", "quantityChange"],
    properties: {
      fkIdUser: {
        type: "integer",
        description: "ID do usuário que está realizando a transação.",
      },
      fkIdLot: {
        type: "integer",
        description: "ID do lote afetado pela transação.",
      },
      actionDescription: {
        type: "string",
        enum: ["IN", "OUT", "AJUST"],
        description:
          "Tipo de movimentação: IN (entrada), OUT (saída), AJUST (ajuste).",
      },
      quantityChange: {
        type: "number",
        format: "float",
        description:
          "Quantidade movida. Deve ser positivo para IN/OUT. Para AJUST, o valor pode ser o delta (positivo ou negativo) ou o novo total, dependendo da lógica do seu controller.",
      },
    },
    example: {
      fkIdUser: 1,
      fkIdLot: 10,
      actionDescription: "OUT",
      quantityChange: 5.5,
    },
  },
  TransactionResponse: {
    type: "object",
    properties: {
      idTransaction: { type: "integer" },
      fkIdUser: { type: "integer" },
      fkIdLot: { type: "integer" },
      actionDescription: { type: "string", enum: ["IN", "OUT", "AJUST"] },
      quantityChange: { type: "number", format: "float" },
      oldQuantity: {
        type: "number",
        format: "float",
        description: "Quantidade do lote antes da transação.",
      },
      newQuantity: {
        type: "number",
        format: "float",
        description: "Quantidade do lote após a transação.",
      },
      transactionDate: { type: "string", format: "date-time" },

      // Campos com JOIN
      userName: {
        type: "string",
        description: "Nome do usuário que realizou a transação.",
      },
      lotNumber: { type: "integer", description: "Número do lote afetado." },
      itemName: {
        type: "string",
        description: "Nome do item associado ao lote.",
      },
    },
    example: {
      idTransaction: 15,
      fkIdUser: 1,
      fkIdLot: 10,
      actionDescription: "OUT",
      quantityChange: 5.5,
      oldQuantity: 50.0,
      newQuantity: 44.5,
      transactionDate: "2025-11-03T18:00:00.000Z",
      userName: "João da Silva",
      lotNumber: 3,
      itemName: "Parafuso Philips M5",
    },
  },
};
