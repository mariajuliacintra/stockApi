// tests/services/validateUser.test.js

// Mocka utils/functions.js para controlar validateDomain e validatePassword
jest.mock('../../src/utils/functions', () => ({
  validateDomain: jest.fn(),
  validatePassword: jest.fn(),
  queryAsync: jest.fn(), // Necessário pois validateEmail e findUserByEmailAndActiveStatus usam queryAsync
}));

// Importa as funções que você vai testar e os mocks das dependências
const { validateUser, validateEmail, findUserByEmailAndActiveStatus, validateLogin, validateUpdate, validateRecovery } = require('../../src/services/validateUser');
const { validateDomain, validatePassword, queryAsync } = require('../../src/utils/functions'); // Importa os mocks

describe('validateUser', () => {
  // Limpa os mocks antes de cada teste para garantir isolamento
  beforeEach(() => {
    jest.clearAllMocks();
    // Define valores padrão para os mocks que serão chamados
    validateDomain.mockReturnValue(null); // Por padrão, o domínio é válido
    validatePassword.mockReturnValue(true); // Por padrão, a senha é válida
    queryAsync.mockResolvedValue([]); // Por padrão, email não existe
  });

  it('deve retornar erro se algum campo obrigatório estiver faltando', () => {
    const result = validateUser({}); // Objeto vazio
    expect(result.error).toBe('Todos os campos devem ser preenchidos');
    expect(result.details).toContain("'name', 'email', 'password' e 'confirmPassword' são obrigatórios");
  });

  it('deve retornar erro se o domínio do email for inválido', () => {
    validateDomain.mockReturnValue({ error: 'Domínio inválido' }); // Simula erro de domínio
    const result = validateUser({ name: 'Test', email: 'test@invalid.com', password: 'Password@123', confirmPassword: 'Password@123' });
    expect(result.error).toBe('Domínio inválido');
    expect(result.details).toContain('domínio válido');
    expect(validateDomain).toHaveBeenCalledWith('test@invalid.com');
  });

  it('deve retornar erro se as senhas não coincidirem', () => {
    const result = validateUser({ name: 'Test', email: 'test@senai.br', password: 'Password@123', confirmPassword: 'DifferentPassword@123' });
    expect(result.error).toBe('As senhas não coincidem');
    expect(result.details).toContain("'password' deve ser idêntico ao campo 'confirmPassword'");
  });

  it('deve retornar erro se a senha for fraca', () => {
    validatePassword.mockReturnValue(false); // Simula senha fraca
    const result = validateUser({ name: 'Test', email: 'test@senai.br', password: 'weak', confirmPassword: 'weak' });
    expect(result.error).toBe('A senha é muito fraca.');
    expect(result.details).toContain('mínimo 8 caracteres');
    expect(validatePassword).toHaveBeenCalledWith('weak');
  });

  it('deve retornar null se todas as validações passarem', () => {
    const result = validateUser({ name: 'Test User', email: 'test@sp.senai.br', password: 'StrongPassword@123', confirmPassword: 'StrongPassword@123' });
    expect(result).toBeNull();
  });
});

describe('findUserByEmailAndActiveStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar o usuário se encontrado com o status especificado', async () => {
    const mockUser = { idUser: 1, email: 'test@sp.senai.br', isActive: true };
    queryAsync.mockResolvedValueOnce([mockUser]);
    const result = await findUserByEmailAndActiveStatus('test@sp.senai.br', true);
    expect(result).toEqual(mockUser);
    expect(queryAsync).toHaveBeenCalledWith('SELECT * FROM user WHERE email = ? AND isActive = ?', ['test@sp.senai.br', true]);
  });

  it('deve retornar null se o usuário não for encontrado', async () => {
    queryAsync.mockResolvedValueOnce([]);
    const result = await findUserByEmailAndActiveStatus('notfound@sp.senai.br', true);
    expect(result).toBeNull();
  });

  it('deve retornar null se ocorrer um erro no banco', async () => {
    queryAsync.mockRejectedValueOnce(new Error('DB connection error'));
    const result = await findUserByEmailAndActiveStatus('error@sp.senai.br', false);
    expect(result).toBeNull(); // A função retorna null em caso de erro
  });
});

describe('validateLogin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validateDomain.mockReturnValue(null); // Domínio válido por padrão
  });

  it('deve retornar erro se email ou senha estiverem faltando', () => {
    const result = validateLogin({});
    expect(result.error).toBe('Todos os campos devem ser preenchidos');
    expect(result.details).toContain("'email' e 'password' são obrigatórios");
  });

  it('deve retornar erro se o domínio do email for inválido', () => {
    validateDomain.mockReturnValue({ error: 'Domínio inválido' });
    const result = validateLogin({ email: 'test@invalid.com', password: 'Password@123' });
    expect(result.error).toBe('Domínio inválido');
    expect(validateDomain).toHaveBeenCalledWith('test@invalid.com');
  });

  it('deve retornar null se as validações de login passarem', () => {
    const result = validateLogin({ email: 'test@sp.senai.br', password: 'Password@123' });
    expect(result).toBeNull();
  });
});

describe('validateUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validateDomain.mockReturnValue(null);
    validatePassword.mockReturnValue(true);
  });

  it('deve retornar erro se nenhum campo para atualizar for fornecido', () => {
    const result = validateUpdate({});
    expect(result.error).toBe('Nenhum campo para atualizar foi fornecido.');
  });

  it('deve retornar erro se o novo email tiver um domínio inválido', () => {
    validateDomain.mockReturnValue({ error: 'Domínio inválido' });
    const result = validateUpdate({ email: 'new@invalid.com' });
    expect(result.error).toBe('Domínio inválido');
    expect(validateDomain).toHaveBeenCalledWith('new@invalid.com');
  });

  it('deve retornar erro se a senha for fornecida mas a confirmação não', () => {
    const result = validateUpdate({ password: 'NewPassword@123' });
    expect(result.error).toBe('A confirmação de senha é obrigatória.');
  });

  it('deve retornar erro se as senhas não coincidirem durante a atualização', () => {
    const result = validateUpdate({ password: 'NewPassword@123', confirmPassword: 'DifferentPassword@123' });
    expect(result.error).toBe('As senhas não coincidem.');
  });

  it('deve retornar erro se a nova senha for fraca', () => {
    validatePassword.mockReturnValue(false);
    const result = validateUpdate({ password: 'weak', confirmPassword: 'weak' });
    expect(result.error).toBe('A nova senha é muito fraca.');
    expect(validatePassword).toHaveBeenCalledWith('weak');
  });

  it('deve retornar null se o nome for atualizado corretamente', () => {
    const result = validateUpdate({ name: 'Updated Name' });
    expect(result).toBeNull();
  });

  it('deve retornar null se o email for atualizado corretamente', () => {
    const result = validateUpdate({ email: 'valid@sp.senai.br' });
    expect(result).toBeNull();
  });

  it('deve retornar null se a senha for atualizada corretamente', () => {
    const result = validateUpdate({ password: 'StrongPassword@123', confirmPassword: 'StrongPassword@123' });
    expect(result).toBeNull();
  });
});

describe('validateRecovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validatePassword.mockReturnValue(true);
  });

  it('deve retornar erro se senha ou confirmação estiverem faltando', () => {
    const result = validateRecovery({});
    expect(result.error).toBe('A senha e confirmação de senha são obrigatórias.');
  });

  it('deve retornar erro se as senhas não coincidirem', () => {
    const result = validateRecovery({ password: 'NewPassword@123', confirmPassword: 'DifferentPassword@123' });
    expect(result.error).toBe('As senhas não coincidem.');
  });

  it('deve retornar erro se a nova senha for fraca', () => {
    validatePassword.mockReturnValue(false);
    const result = validateRecovery({ password: 'weak', confirmPassword: 'weak' });
    expect(result.error).toBe('A nova senha é muito fraca.');
    expect(validatePassword).toHaveBeenCalledWith('weak');
  });

  it('deve retornar null se a senha de recuperação for válida', () => {
    const result = validateRecovery({ password: 'StrongPassword@123', confirmPassword: 'StrongPassword@123' });
    expect(result).toBeNull();
  });
});

