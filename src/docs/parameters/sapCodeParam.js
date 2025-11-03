// src/docs/parameters/sapCodeParam.js

module.exports = {
  sapCodeParam: {
    name: "sapCode",
    in: "path",
    description: "Código SAP do Item (Produto)",
    required: true,
    schema: {
      type: "string",
      description: "Código alfanumérico único (ex: 10000001)",
    },
  },
};
