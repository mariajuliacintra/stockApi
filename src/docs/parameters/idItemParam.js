// src/docs/parameters/idItemParam.js

module.exports = {
  idItemParam: {
    name: "idItem",
    in: "path",
    description: "ID do Item (Produto) ao qual o lote pertence",
    required: true,
    schema: {
      type: "integer",
      format: "int32",
      minimum: 1,
    },
  },
};
