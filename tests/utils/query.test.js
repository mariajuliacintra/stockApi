// tests/utils/query.test.js

// Mock do módulo functions.js para simular o comportamento de queryAsync
const { queryAsync } = require('../../src/utils/functions');
jest.mock('../../src/utils/functions', () => ({
  queryAsync: jest.fn(),
}));

// Importe as funções que você vai testar
const { findUserByEmail, findUserById, validateForeignKey } = require('../../src/utils/querys');


describe('findUserByEmail', () => {
  // Cenário de sucesso: usuário encontrado
  it('deve retornar o usuário se o e-mail for encontrado', async () => {
    const mockUser = { idUser: 1, email: 'test@sp.senai.br', isActive: true };
    // Configura o mock para resolver a promise com um array contendo o usuário
    queryAsync.mockResolvedValueOnce([mockUser]);

    const user = await findUserByEmail('test@sp.senai.br');
    expect(user).toEqual(mockUser);
    expect(queryAsync).toHaveBeenCalledWith('SELECT * FROM user WHERE email = ? AND isActive = TRUE', ['test@sp.senai.br']);
  });

  // Cenário de falha: usuário não encontrado
  it('deve retornar null se o e-mail não for encontrado', async () => {
    // Configura o mock para resolver a promise com um array vazio
    queryAsync.mockResolvedValueOnce([]);

    const user = await findUserByEmail('naoencontrado@sp.senai.br');
    expect(user).toBeNull();
  });
});

describe('findUserById', () => {
  // Cenário de sucesso: usuário encontrado
  it('deve retornar o usuário se o ID for encontrado', async () => {
    const mockUser = { idUser: 1, email: 'test@sp.senai.br', isActive: true };
    queryAsync.mockResolvedValueOnce([mockUser]);

    const user = await findUserById(1);
    expect(user).toEqual(mockUser);
    expect(queryAsync).toHaveBeenCalledWith('SELECT * FROM user WHERE idUser = ? AND isActive = TRUE', [1]);
  });

  // Cenário de falha: usuário não encontrado
  it('deve retornar null se o ID não for encontrado', async () => {
    queryAsync.mockResolvedValueOnce([]);

    const user = await findUserById(999);
    expect(user).toBeNull();
  });
});

describe('validateForeignKey', () => {
  // Cenário de sucesso: ID existe no banco
  it('deve retornar sucesso se o ID da chave estrangeira for encontrado', async () => {
    // Configura o mock para retornar um resultado com count > 0
    queryAsync.mockResolvedValueOnce([{ count: 1 }]);

    const result = await validateForeignKey('users', 'idUser', 1);
    expect(result.success).toBe(true);
  });

  // Cenário de falha: ID não existe no banco
  it('deve retornar erro se o ID da chave estrangeira não for encontrado', async () => {
    // Configura o mock para retornar um resultado com count === 0
    queryAsync.mockResolvedValueOnce([{ count: 0 }]);

    const result = await validateForeignKey('users', 'idUser', 999);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Chave estrangeira inválida');
    expect(result.message).toContain('não existe.');
  });
  
  // Cenário de falha: valor do ID não é um número
  it('deve retornar erro se o ID não for um número válido', async () => {
    const result = await validateForeignKey('users', 'idUser', 'nao-numerico');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro de validação');
    expect(result.message).toContain('um número válido.');
  });

  // Cenário de falha: erro do banco de dados
  it('deve retornar erro interno do servidor se ocorrer um erro no banco', async () => {
    // Configura o mock para rejeitar a promise com um erro
    queryAsync.mockRejectedValueOnce(new Error('Erro de conexão com o DB'));

    const result = await validateForeignKey('users', 'idUser', 1);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro interno do servidor');
  });
});