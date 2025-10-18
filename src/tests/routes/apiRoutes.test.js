const request = require('supertest');
const app = require('../../index'); // Certifique-se de que o caminho está correto

describe('Testando as rotas da API', () => {
  it('Deve retornar 200 ao acessar a rota /api', async () => {
    // Faz uma requisição GET para a rota /stock
    const response = await request(app).get('/api');

    // Espera que o status da resposta seja 200
    expect(response.statusCode).toBe(200);
  });
});