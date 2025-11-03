// src/docs/parameters/idTransactionParam.js

module.exports = {
  idTransactionParam: {
    name: "idTransaction",
    in: "path",
    description: "ID único da Transação",
    required: true,
    schema: {
      type: "integer",
      format: "int32",
      minimum: 1,
    },
  },
};
