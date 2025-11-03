// src/docs/parameters/idLotParam.js

module.exports = {
  idLotParam: {
    name: "idLot",
    in: "path",
    description: "ID único do Lote",
    required: true,
    schema: {
      type: "integer",
      format: "int32",
      minimum: 1,
    },
  },
};
