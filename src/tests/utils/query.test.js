const { queryAsync } = require('../../utils/functions');
const { findUserByEmail, findUserById, validateForeignKey } = require('../../utils/querys');

const mockClosePool = jest.fn().mockResolvedValue(true);

jest.mock('../../../src/utils/functions', () => ({
  queryAsync: jest.fn(),
}));

jest.mock('../../db/connect', () => ({
    query: jest.fn(),
    closePool: mockClosePool,
}));

const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

afterAll(async () => {
  mockConsoleError.mockRestore();
  await mockClosePool();
});

describe('findUserByEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar o usuário se o e-mail for encontrado', async () => {
    const mockUser = { idUser: 1, email: 'test@sp.senai.br', isActive: true };
    queryAsync.mockResolvedValueOnce([mockUser]);

    const user = await findUserByEmail('test@sp.senai.br');
    expect(user).toEqual(mockUser);
    expect(queryAsync).toHaveBeenCalledWith('SELECT * FROM user WHERE email = ? AND isActive = TRUE', ['test@sp.senai.br']);
  });

  it('deve retornar null se o e-mail não for encontrado', async () => {
    queryAsync.mockResolvedValueOnce([]);

    const user = await findUserByEmail('naoencontrado@sp.senai.br');
    expect(user).toBeNull();
  });
});

describe('findUserById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('deve retornar o usuário se o ID for encontrado', async () => {
    const mockUser = { idUser: 1, email: 'test@sp.senai.br', isActive: true };
    queryAsync.mockResolvedValueOnce([mockUser]);

    const user = await findUserById(1);
    expect(user).toEqual(mockUser);
    expect(queryAsync).toHaveBeenCalledWith('SELECT * FROM user WHERE idUser = ? AND isActive = TRUE', [1]);
  });

  it('deve retornar null se o ID não for encontrado', async () => {
    queryAsync.mockResolvedValueOnce([]);

    const user = await findUserById(999);
    expect(user).toBeNull();
  });
});

describe('validateForeignKey', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('deve retornar sucesso se o ID da chave estrangeira for encontrado', async () => {
    queryAsync.mockResolvedValueOnce([{ count: 1 }]);

    const result = await validateForeignKey('users', 'idUser', 1);
    expect(result.success).toBe(true);
    expect(queryAsync).toHaveBeenCalledWith('SELECT COUNT(*) AS count FROM users WHERE idUser = ?', [1]);
  });

  it('deve retornar erro se o ID da chave estrangeira não for encontrado', async () => {
    queryAsync.mockResolvedValueOnce([{ count: 0 }]);

    const result = await validateForeignKey('users', 'idUser', 999);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Chave estrangeira inválida');
    expect(result.message).toContain('não existe.');
  });
  
  it('deve retornar erro se o ID não for um número válido', async () => {
    const result = await validateForeignKey('users', 'idUser', 'nao-numerico');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro de validação');
    expect(result.message).toContain('um número válido.');
    expect(queryAsync).not.toHaveBeenCalled();
  });

  it('deve retornar erro interno do servidor se ocorrer um erro no banco', async () => {
    queryAsync.mockRejectedValueOnce(new Error('Erro de conexão com o DB'));

    const result = await validateForeignKey('users', 'idUser', 1);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro interno do servidor');
    expect(mockConsoleError).toHaveBeenCalled();
  });
});