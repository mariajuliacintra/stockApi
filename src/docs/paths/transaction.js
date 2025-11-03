// src/docs/paths/transaction.js

module.exports = {
    // Rotas GET /transactions e POST /transactions
    "/transactions": {
        "get": {
            "summary": "Lista todas as transações registradas",
            "tags": ["Transaction"],
            "security": [{ "bearerAuth": [] }],
            "responses": {
                "200": {
                    "description": "Sucesso na obtenção da lista de transações",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "Transações obtidas com sucesso." },
                                    data: {
                                        type: "array",
                                        items: { "$ref": "#/components/schemas/TransactionResponse" }
                                    }
                                }
                            }
                        }
                    }
                },
                "401": { "$ref": "#/components/responses/Unauthorized" },
                "403": { "$ref": "#/components/responses/Forbidden" },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        },
        "post": {
            "summary": "Registra uma nova transação e atualiza o saldo do Lote e do Item",
            "tags": ["Transaction"],
            "security": [{ "bearerAuth": [] }],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": { "$ref": "#/components/schemas/TransactionInput" }
                    }
                }
            },
            "responses": {
                "201": {
                    "description": "Transação registrada com sucesso",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "Transação registrada, lote e item atualizados com sucesso!" },
                                    data: {
                                        type: "object",
                                        properties: {
                                            newLotQuantity: { type: "number", format: "float" },
                                            newItemQuantity: { type: "number", format: "float" },
                                            fkIdItem: { type: "integer" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "400": { 
                    "$ref": "#/components/responses/BadRequest",
                    "description": "Dados inválidos (ex: campos ausentes, 'OUT' sem estoque, quantidade negativa)."
                },
                "401": { "$ref": "#/components/responses/Unauthorized" },
                "403": { "$ref": "#/components/responses/Forbidden" },
                "404": { 
                    "$ref": "#/components/responses/NotFound",
                    "description": "Usuário ou Lote não encontrados.",
                },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        }
    },
    
    // Rotas GET /transactions/{idTransaction}
    "/transactions/{idTransaction}": {
        "get": {
            "summary": "Busca uma transação específica por ID",
            "tags": ["Transaction"],
            "security": [{ "bearerAuth": [] }],
            "parameters": [{ "$ref": "#/components/parameters/idTransactionParam" }],
            "responses": {
                "200": {
                    "description": "Sucesso na obtenção da transação",
                    "content": { "application/json": { "schema": { "$ref": "#/components/schemas/TransactionResponse" } } }
                },
                "401": { "$ref": "#/components/responses/Unauthorized" },
                "403": { "$ref": "#/components/responses/Forbidden" },
                "404": { "$ref": "#/components/responses/NotFound" },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        }
    },
    
    // Rotas GET /transactions/item/{fkIdItem}
    "/transactions/item/{fkIdItem}": {
        "get": {
            "summary": "Lista transações por ID do Item associado ao Lote",
            "tags": ["Transaction"],
            "security": [{ "bearerAuth": [] }],
            "parameters": [{ "$ref": "#/components/parameters/idItemParam" }],
            "responses": {
                "200": {
                    "description": "Sucesso na obtenção das transações do item",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "Transações do item obtidas com sucesso." },
                                    data: { type: "array", items: { "$ref": "#/components/schemas/TransactionResponse" } }
                                }
                            }
                        }
                    }
                },
                "401": { "$ref": "#/components/responses/Unauthorized" },
                "403": { "$ref": "#/components/responses/Forbidden" },
                "404": { "$ref": "#/components/responses/NotFound" },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        }
    },
    
    // Rotas GET /transactions/user/{fkIdUser}
    "/transactions/user/{fkIdUser}": {
        "get": {
            "summary": "Lista transações por ID do Usuário (apenas transações do próprio usuário ou acesso de Gerente)",
            "tags": ["Transaction"],
            "security": [{ "bearerAuth": [] }],
            "parameters": [{ "$ref": "#/components/parameters/idUserParam" }],
            "responses": {
                "200": {
                    "description": "Sucesso na obtenção das transações do usuário",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    success: { type: "boolean", example: true },
                                    message: { type: "string", example: "Transações do usuário obtidas com sucesso." },
                                    data: { type: "array", items: { "$ref": "#/components/schemas/TransactionResponse" } }
                                }
                            }
                        }
                    }
                },
                "401": { "$ref": "#/components/responses/Unauthorized" },
                "404": { "$ref": "#/components/responses/NotFound" },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        }
    }
};