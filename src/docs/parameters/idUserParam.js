// src/docs/parameters/idUserParam.js

module.exports = {
    idUserParam: {
        name: "idUser",
        in: "path",
        description: "ID único do usuário.",
        required: true,
        schema: {
            type: "integer",
            format: "int32",
            minimum: 1
        }
    }
};