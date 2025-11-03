// src/docs/schemas/categorySchema.js

module.exports = {
  Category: {
    type: "object",
    properties: {
      idCategory: {
        type: "integer",
        description: "ID único da categoria.",
      },
      categoryValue: {
        type: "string",
        description: "Nome da categoria (ex: Eletrônicos).",
      },
    },
    example: { idCategory: 1, categoryValue: "Consumíveis" },
  },
  CategoryInput: {
    type: "object",
    required: ["categoryValue"],
    properties: {
      categoryValue: {
        type: "string",
        description: "Nome da categoria.",
      },
    },
    example: { categoryValue: "Ferramentas" },
  },
};
