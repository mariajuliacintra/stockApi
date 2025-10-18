// src/docs/schemas/locationSchema.js (Inalterado)

module.exports = {
    Location: {
        type: 'object',
        properties: {
            idLocation: {
                type: 'integer',
                description: 'ID único da localização.',
            },
            place: {
                type: 'string',
                description: 'Nome do local (ex: Armazém A).',
            },
            code: {
                type: 'string',
                description: 'Código da localização (ex: A01).',
            },
        },
        example: { idLocation: 1, place: 'Armazém A', code: 'A01' },
    },
    LocationInput: {
        type: 'object',
        required: ['place', 'code'],
        properties: {
            place: {
                type: 'string',
                description: 'Nome do local.',
            },
            code: {
                type: 'string',
                description: 'Código da localização.',
            },
        },
        example: { place: 'Armazém B', code: 'B01' },
    },
};