// src/docs/parameters/idLocationParam.js

module.exports = {
    idLocationParam: {
        name: "idLocation",
        in: "path",
        description: "ID da localização",
        required: true,
        schema: {
            type: "integer",
            format: "int32",
            minimum: 1
        }
    }
};