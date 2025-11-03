// src/docs/parameters/idCategoryParam.js

module.exports = {
  idCategoryParam: {
    name: "idCategory",
    in: "path",
    description: "ID da Categoria",
    required: true,
    schema: {
      type: "integer",
      format: "int32",
      minimum: 1,
    },
  },
};
