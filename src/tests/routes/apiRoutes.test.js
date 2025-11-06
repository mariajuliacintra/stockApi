const request = require('supertest');
const connect = require('../../db/connect');
const cronjobVerification = require('../../services/cron/cronjobVerification');
const app = require('../../index');

jest.mock('../../db/connect', () => ({
    query: jest.fn(),
    closePool: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../services/cron/cronjobVerification', () => ({
    stop: jest.fn(),
    start: jest.fn(),
}));

const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

afterAll(async () => {
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
    
    await connect.closePool();
    
    cronjobVerification.stop();
});

describe('Testando as rotas da API', () => {
    it('Deve retornar 200 ao acessar a rota /api', async () => {
        const response = await request(app).get('/api');
        expect(response.statusCode).toBe(200);
    });
});