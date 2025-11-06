const { queryAsync } = require('../../utils/functions');
const { validateForeignKey } = require('../../utils/querys');
const { validateCreateLot, validateUpdateLotQuantity, validateUpdateLotInformation } = require('../../services/validateLot');

const mockClosePool = jest.fn().mockResolvedValue(true);

jest.mock('../../utils/functions', () => ({
  queryAsync: jest.fn(),
}));

jest.mock('../../utils/querys', () => ({
  validateForeignKey: jest.fn(),
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

describe('validateCreateLot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar erro se campos obrigatórios estiverem ausentes', async () => {
    const result = await validateCreateLot({ fkIdLocation: 1, fkIdUser: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Campos obrigatórios ausentes');
  });

  it('deve retornar erro se a quantidade for inválida', async () => {
    const result = await validateCreateLot({ quantity: -5, fkIdLocation: 1, fkIdUser: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Quantidade inválida');
  });

  it('deve retornar sucesso se todos os campos e chaves estrangeiras forem válidos (com idItem)', async () => {
    validateForeignKey.mockResolvedValueOnce({ success: true })
                       .mockResolvedValueOnce({ success: true })
                       .mockResolvedValueOnce({ success: true });

    const result = await validateCreateLot({ quantity: 10, fkIdLocation: 1, fkIdUser: 1, idItem: 5 });
    expect(result.success).toBe(true);
    expect(validateForeignKey).toHaveBeenCalledTimes(3);
    expect(validateForeignKey).toHaveBeenCalledWith('location', 'idLocation', 1);
    expect(validateForeignKey).toHaveBeenCalledWith('user', 'idUser', 1);
    expect(validateForeignKey).toHaveBeenCalledWith('item', 'idItem', 5);
  });

  it('deve retornar sucesso se todos os campos e chaves estrangeiras forem válidos (com sapCode)', async () => {
    validateForeignKey.mockResolvedValueOnce({ success: true })
                       .mockResolvedValueOnce({ success: true });
    queryAsync.mockResolvedValueOnce([{ idItem: 5 }]);

    const result = await validateCreateLot({ quantity: 10, fkIdLocation: 1, fkIdUser: 1, sapCode: '12345' });
    expect(result.success).toBe(true);
    expect(validateForeignKey).toHaveBeenCalledTimes(2);
    expect(validateForeignKey).toHaveBeenCalledWith('location', 'idLocation', 1);
    expect(validateForeignKey).toHaveBeenCalledWith('user', 'idUser', 1);
    expect(queryAsync).toHaveBeenCalledWith('SELECT idItem FROM item WHERE sapCode = ?', ['12345']);
  });

  it('deve retornar erro se o item não for encontrado pelo sapCode', async () => {
    validateForeignKey.mockResolvedValueOnce({ success: true })
                       .mockResolvedValueOnce({ success: true });
    queryAsync.mockResolvedValueOnce([]);

    const result = await validateCreateLot({ quantity: 10, fkIdLocation: 1, fkIdUser: 1, sapCode: '99999' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Item não encontrado');
  });

  it('deve retornar erro se identificador de item for ausente', async () => {
    validateForeignKey.mockResolvedValueOnce({ success: true })
                       .mockResolvedValueOnce({ success: true });

    const result = await validateCreateLot({ quantity: 10, fkIdLocation: 1, fkIdUser: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Identificador ausente');
  });

  it('deve retornar erro se a validação da chave estrangeira falhar', async () => {
    const validationError = { success: false, error: 'Chave estrangeira inválida', details: 'Location não encontrada' };
    validateForeignKey.mockResolvedValueOnce(validationError);

    const result = await validateCreateLot({ quantity: 10, fkIdLocation: 999, fkIdUser: 1, idItem: 5 });
    expect(result).toEqual(validationError);
  });

  it('deve retornar erro interno do servidor em caso de erro inesperado', async () => {
    validateForeignKey.mockRejectedValueOnce(new Error('Erro de banco de dados'));

    const result = await validateCreateLot({ quantity: 10, fkIdLocation: 1, fkIdUser: 1, idItem: 5 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro interno do servidor');
    expect(mockConsoleError).toHaveBeenCalled();
  });
});

describe('validateUpdateLotQuantity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar erro se campos obrigatórios estiverem ausentes', async () => {
    const result = await validateUpdateLotQuantity({ fkIdUser: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Campos obrigatórios ausentes');
  });

  it('deve retornar erro se a quantidade for inválida', async () => {
    const result = await validateUpdateLotQuantity({ quantity: 'abc', fkIdUser: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Quantidade inválida');
  });

  it('deve retornar sucesso se a quantidade e o fkIdUser forem válidos', async () => {
    validateForeignKey.mockResolvedValueOnce({ success: true });

    const result = await validateUpdateLotQuantity({ quantity: 50, fkIdUser: 2 });
    expect(result.success).toBe(true);
    expect(validateForeignKey).toHaveBeenCalledWith('user', 'idUser', 2);
  });

  it('deve retornar erro se a validação de fkIdUser falhar', async () => {
    const validationError = { success: false, error: 'Chave estrangeira inválida', details: 'User não encontrado' };
    validateForeignKey.mockResolvedValueOnce(validationError);

    const result = await validateUpdateLotQuantity({ quantity: 50, fkIdUser: 999 });
    expect(result).toEqual(validationError);
  });

  it('deve retornar erro interno do servidor em caso de erro inesperado', async () => {
    validateForeignKey.mockRejectedValueOnce(new Error('Erro de banco de dados'));

    const result = await validateUpdateLotQuantity({ quantity: 50, fkIdUser: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro interno do servidor');
    expect(mockConsoleError).toHaveBeenCalled();
  });
});

describe('validateUpdateLotInformation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar erro se nenhum campo para atualização for fornecido', async () => {
    const result = await validateUpdateLotInformation({});
    expect(result.success).toBe(false);
    expect(result.error).toBe('Nenhum campo para atualização');
  });

  it('deve retornar sucesso se apenas fkIdLocation for fornecido e válido', async () => {
    validateForeignKey.mockResolvedValueOnce({ success: true });

    const result = await validateUpdateLotInformation({ fkIdLocation: 3 });
    expect(result.success).toBe(true);
    expect(validateForeignKey).toHaveBeenCalledWith('location', 'idLocation', 3);
  });

  it('deve retornar sucesso se apenas expirationDate for fornecido e válido', async () => {
    const result = await validateUpdateLotInformation({ expirationDate: '2025-12-31' });
    expect(result.success).toBe(true);
    expect(validateForeignKey).not.toHaveBeenCalled();
  });

  it('deve retornar erro se a data de validade for inválida', async () => {
    const result = await validateUpdateLotInformation({ expirationDate: 'data-invalida' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Data inválida');
  });

  it('deve retornar erro se fkIdLocation for inválido', async () => {
    const validationError = { success: false, error: 'Chave estrangeira inválida', details: 'Location não encontrada' };
    validateForeignKey.mockResolvedValueOnce(validationError);

    const result = await validateUpdateLotInformation({ fkIdLocation: 999, expirationDate: '2025-12-31' });
    expect(result).toEqual(validationError);
  });

  it('deve retornar erro interno do servidor em caso de erro inesperado', async () => {
    validateForeignKey.mockRejectedValueOnce(new Error('Erro de banco de dados'));

    const result = await validateUpdateLotInformation({ fkIdLocation: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro interno do servidor');
    expect(mockConsoleError).toHaveBeenCalled();
  });
});