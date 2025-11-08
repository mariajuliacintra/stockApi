// src/docs/paths/user.js

module.exports = {
    "/user/register": {
        "post": {
            "summary": "Inicia o registro de um novo usuário ou reativação de conta inativa.",
            "tags": ["User - Autenticação"],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": { "schema": { "$ref": "#/components/schemas/RegisterInput" } }
                }
            },
            "responses": {
                "200": { "description": "Código de verificação enviado (para novo usuário ou reativação)." },
                "400": { "$ref": "#/components/responses/BadRequest" },
                "409": { "description": "E-mail já cadastrado e ativo." },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        }
    },
    "/user/register/manager": {
        "post": {
            "summary": "Cadastra um novo usuário por um gerente.",
            "tags": ["User - Gerenciamento"],
            "security": [{ "jwtAuth": [] }],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": { "schema": { "$ref": "#/components/schemas/RegisterManagerInput" } }
                }
            },
            "responses": {
                "200": { "description": "Código de verificação enviado (para novo usuário ou reativação)." },
                "400": { "$ref": "#/components/responses/BadRequest" },
                "401": { "$ref": "#/components/responses/Unauthorized" },
                "403": { "$ref": "#/components/responses/Forbidden" },
                "409": { "description": "E-mail já cadastrado e ativo." },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        }
    },
    "/user/verify-register": {
        "post": {
            "summary": "Finaliza o registro/reativação do usuário com o código de verificação.",
            "tags": ["User - Autenticação"],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": { "schema": { "$ref": "#/components/schemas/VerificationInput" } }
                }
            },
            "responses": {
                "200": { "description": "Cadastro concluído e login automático (retorna token).", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AuthResponse" } } } },
                "201": { "description": "Usuário criado por gerente (sem login automático)." },
                "400": { "$ref": "#/components/responses/BadRequest" },
                "401": { "description": "Código inválido ou expirado." },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        }
    },
    "/user/login": {
        "post": {
            "summary": "Realiza o login do usuário.",
            "tags": ["User - Autenticação"],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": { "schema": { "$ref": "#/components/schemas/LoginInput" } }
                }
            },
            "responses": {
                "200": { "description": "Login bem-sucedido (retorna token).", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AuthResponse" } } } },
                "400": { "$ref": "#/components/responses/BadRequest" },
                "401": { "description": "Senha incorreta." },
                "403": { "description": "Conta inativa." },
                "404": { "$ref": "#/components/responses/NotFound" },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        }
    },
    "/user/{idUser}": {
        "get": {
            "summary": "Busca dados do usuário por ID (apenas o próprio usuário).",
            "tags": ["User - Perfil"],
            "security": [{ "jwtAuth": [] }],
            "parameters": [{ "$ref": "#/components/parameters/idUserParam" }],
            "responses": {
                "200": { "description": "Dados do usuário obtidos.", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/User" } } } },
                "401": { "$ref": "#/components/responses/Unauthorized" },
                "403": { "description": "Acesso negado (não é seu ID)." },
                "404": { "$ref": "#/components/responses/NotFound" },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        },
        "put": {
            "summary": "Atualiza o perfil do usuário (requer verificação de e-mail se alterado).",
            "tags": ["User - Perfil"],
            "security": [{ "jwtAuth": [] }],
            "parameters": [{ "$ref": "#/components/parameters/idUserParam" }],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": { "schema": { "$ref": "#/components/schemas/UpdateInput" } }
                }
            },
            "responses": {
                "200": { "description": "Atualização concluída ou verificação de e-mail iniciada." },
                "400": { "$ref": "#/components/responses/BadRequest" },
                "401": { "$ref": "#/components/responses/Unauthorized" },
                "403": { "$ref": "#/components/responses/Forbidden" },
                "404": { "$ref": "#/components/responses/NotFound" },
                "409": { "$ref": "#/components/responses/Conflict" },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        },
        "delete": {
            "summary": "Desativa o usuário (soft delete).",
            "tags": ["User - Perfil"],
            "security": [{ "jwtAuth": [] }],
            "parameters": [{ "$ref": "#/components/parameters/idUserParam" }],
            "responses": {
                "200": { "description": "Usuário desativado com sucesso." },
                "401": { "$ref": "#/components/responses/Unauthorized" },
                "403": { "$ref": "#/components/responses/Forbidden" },
                "404": { "$ref": "#/components/responses/NotFound" },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        }
    },
    "/user/verify-update": {
        "post": {
            "summary": "Finaliza a atualização de e-mail/dados com o código de verificação.",
            "tags": ["User - Perfil"],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": { "schema": { "$ref": "#/components/schemas/VerificationInput" } }
                }
            },
            "responses": {
                "200": { "description": "Atualização de e-mail/dados concluída." },
                "400": { "$ref": "#/components/responses/BadRequest" },
                "401": { "description": "Código inválido ou expirado." },
                "409": { "$ref": "#/components/responses/Conflict" },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        }
    },
    "/user/validate-password/{idUser}": {
        "post": {
            "summary": "Valida se a senha informada corresponde à senha do usuário.",
            "tags": ["User - Perfil"],
            "security": [{ "jwtAuth": [] }],
            "parameters": [{ "$ref": "#/components/parameters/idUserParam" }],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": { "schema": { "type": "object", "required": ["password"], "properties": { "password": { "type": "string" } } } }
                }
            },
            "responses": {
                "200": { "description": "Resultado da validação da senha." },
                "400": { "$ref": "#/components/responses/BadRequest" },
                "401": { "$ref": "#/components/responses/Unauthorized" },
                "404": { "$ref": "#/components/responses/NotFound" },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        }
    },
    "/users": {
        "get": {
            "summary": "Lista todos os usuários ativos com paginação (Apenas Gerentes).",
            "tags": ["User - Gerenciamento"],
            "security": [{ "jwtAuth": [] }],
            "parameters": [
                { "name": "page", "in": "query", "schema": { "type": "integer", "default": 1 } },
                { "name": "limit", "in": "query", "schema": { "type": "integer", "default": 25 } }
            ],
            "responses": {
                "200": { "description": "Lista de usuários obtida com sucesso." },
                "401": { "$ref": "#/components/responses/Unauthorized" },
                "403": { "$ref": "#/components/responses/Forbidden" },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        }
    },
    "/user/verify-recovery-password": {
        "post": {
            "summary": "Inicia o processo de recuperação de senha, enviando um código por e-mail.",
            "tags": ["User - Autenticação"],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": { "schema": { "type": "object", "required": ["email"], "properties": { "email": { "type": "string", "format": "email" } } } }
                }
            },
            "responses": {
                "200": { "description": "Código de recuperação enviado." },
                "404": { "$ref": "#/components/responses/NotFound" },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        }
    },
    "/user/validate-recovery-code": {
        "post": {
            "summary": "Valida o código de recuperação de senha.",
            "tags": ["User - Autenticação"],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": { "schema": { "$ref": "#/components/schemas/VerificationInput" } }
                }
            },
            "responses": {
                "200": { "description": "Código validado com sucesso." },
                "400": { "$ref": "#/components/responses/BadRequest" },
                "401": { "description": "Código inválido ou expirado." }
            }
        }
    },
    "/user/recovery-password": {
        "post": {
            "summary": "Altera a senha após a validação do código de recuperação.",
            "tags": ["User - Autenticação"],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": { "schema": { "$ref": "#/components/schemas/PasswordRecoveryInput" } }
                }
            },
            "responses": {
                "200": { "description": "Senha alterada com sucesso." },
                "400": { "$ref": "#/components/responses/BadRequest" },
                "401": { "description": "Código de recuperação inválido ou expirado (deve validar antes)." },
                "500": { "$ref": "#/components/responses/InternalServerError" }
            }
        }
    }
};