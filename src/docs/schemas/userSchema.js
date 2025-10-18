// src/docs/schemas/userSchema.js

module.exports = {
    // Esquema completo do usuário retornado pelo sistema
    User: {
        type: 'object',
        properties: {
            idUser: { type: 'integer', description: 'ID único do usuário.' },
            name: { type: 'string', description: 'Nome completo do usuário.' },
            email: { type: 'string', format: 'email', description: 'Endereço de e-mail do usuário.' },
            role: { type: 'string', enum: ['user', 'manager'], description: 'Função de acesso do usuário.' },
            isActive: { type: 'boolean', description: 'Status de ativação da conta.' },
            createdAt: { type: 'string', format: 'date-time', description: 'Data de criação da conta.' }
        },
        example: {
            idUser: 1,
            name: 'João Silva',
            email: 'joao.silva@exemplo.com',
            role: 'user',
            isActive: true,
            createdAt: '2023-10-18T15:00:00.000Z'
        }
    },

    // Esquema para entrada de registro (usuário final)
    RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
            name: { type: 'string', description: 'Nome completo.' },
            email: { type: 'string', format: 'email', description: 'E-mail para registro/reativação.' },
            password: { type: 'string', format: 'password', description: 'Senha (mínimo de 6 caracteres).' }
        },
        example: { name: 'Novo Usuário', email: 'novo.usuario@exemplo.com', password: 'senhaForte123' }
    },

    // Esquema para entrada de registro (gerente)
    RegisterManagerInput: {
        allOf: [
            { '$ref': '#/components/schemas/RegisterInput' },
            {
                type: 'object',
                required: ['role'],
                properties: {
                    role: { type: 'string', enum: ['user', 'manager'], description: 'Função a ser atribuída ao novo usuário.' }
                }
            }
        ]
    },

    // Esquema para entrada de verificação de código (registro ou atualização)
    VerificationInput: {
        type: 'object',
        required: ['email', 'code'],
        properties: {
            email: { type: 'string', format: 'email', description: 'E-mail do usuário em verificação.' },
            code: { type: 'string', description: 'Código de 6 dígitos enviado por e-mail.' }
        },
        example: { email: 'user@exemplo.com', code: '123456' }
    },

    // Esquema para entrada de Login
    LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email', description: 'E-mail do usuário.' },
            password: { type: 'string', format: 'password', description: 'Senha do usuário.' }
        },
        example: { email: 'joao.silva@exemplo.com', password: 'senhaForte123' }
    },

    // Esquema de entrada para Alteração de Senha/Recuperação
    PasswordRecoveryInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email', description: 'E-mail do usuário.' },
            password: { type: 'string', format: 'password', description: 'Nova senha (mínimo de 6 caracteres).' }
        },
        example: { email: 'joao.silva@exemplo.com', password: 'novaSenhaForte123' }
    },

    // Esquema de entrada para Update
    UpdateInput: {
        type: 'object',
        properties: {
            name: { type: 'string', description: 'Novo nome (opcional).' },
            email: { type: 'string', format: 'email', description: 'Novo e-mail (opcional, requer verificação).' },
            password: { type: 'string', format: 'password', description: 'Nova senha (opcional).' },
            role: { type: 'string', enum: ['user', 'manager'], description: 'Nova função (apenas para gerentes, opcional).' }
        },
        example: { name: 'João Atualizado', role: 'manager' }
    },

    // Esquema de resposta de login/verificação (inclui token)
    AuthResponse: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login Bem-sucedido' },
            details: { type: 'string', example: 'Bem-vindo de volta!' },
            data: {
                allOf: [
                    { '$ref': '#/components/schemas/User' },
                    {
                        type: 'object',
                        properties: {
                            isManager: { type: 'boolean', description: 'Indica se o usuário é gerente.' },
                            token: { type: 'string', description: 'Token JWT para requisições subsequentes.' },
                            auth: { type: 'boolean', example: true, description: 'Sinalizador de autenticação.' }
                        }
                    }
                ]
            }
        }
    }
};