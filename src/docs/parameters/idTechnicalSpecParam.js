// src/docs/parameters/idTechnicalSpecParam.js

module.exports = {
  idTechnicalSpecParam: {
    name: "idTechnicalSpec",
    in: "path",
    description: "ID da Especificação Técnica",
    required: true,
    schema: {
      type: "integer",
      format: "int32",
      minimum: 1,
    },
  },
};
