// tests/services/validateLot.test.js

// Mocka as dependências externas
const { queryAsync } = require('../../utils/functions');
const { validateForeignKey } = require('../../utils/querys'); // Note que o path original pode ser 'querys' ou 'query'

jest.mock('../../utils/functions', () => ({
  queryAsync: jest.fn(),
}));

jest.mock('../../utils/querys', () => ({
  validateForeignKey: jest.fn(),
}));

// Importa as funções a serem testadas
const { validateCreateLot, validateUpdateLotQuantity, validateUpdateLotInformation } = require('../../services/validateLot');

describe('validateCreateLot', () => {
  // Limpa os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Teste para campos obrigatórios ausentes
  it('deve retornar erro se campos obrigatórios estiverem ausentes', async () => {
    const result = await validateCreateLot({ fkIdLocation: 1, fkIdUser: 1 }); // Quantidade ausente
    expect(result.success).toBe(false);
    expect(result.error).toBe('Campos obrigatórios ausentes');
  });

  // Teste para quantidade inválida
  it('deve retornar erro se a quantidade for inválida', async () => {
    const result = await validateCreateLot({ quantity: -5, fkIdLocation: 1, fkIdUser: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Quantidade inválida');
  });

  // Teste de sucesso com item identificado por ID
  it('deve retornar sucesso se todos os campos e chaves estrangeiras forem válidos (com idItem)', async () => {
    validateForeignKey.mockResolvedValueOnce({ success: true }); // Mock para location
    validateForeignKey.mockResolvedValueOnce({ success: true }); // Mock para user
    validateForeignKey.mockResolvedValueOnce({ success: true }); // Mock para item

    const result = await validateCreateLot({ quantity: 10, fkIdLocation: 1, fkIdUser: 1, idItem: 5 });
    expect(result.success).toBe(true);
    expect(validateForeignKey).toHaveBeenCalledWith('location', 'idLocation', 1);
    expect(validateForeignKey).toHaveBeenCalledWith('user', 'idUser', 1);
    expect(validateForeignKey).toHaveBeenCalledWith('item', 'idItem', 5);
  });

  // Teste de sucesso com item identificado por SAP Code
  it('deve retornar sucesso se todos os campos e chaves estrangeiras forem válidos (com sapCode)', async () => {
    validateForeignKey.mockResolvedValueOnce({ success: true }); // Mock para location
    validateForeignKey.mockResolvedValueOnce({ success: true }); // Mock para user
    // queryAsync para verificar SAP Code
    queryAsync.mockResolvedValueOnce([{ idItem: 5 }]); // Simula que o SAP Code existe

    const result = await validateCreateLot({ quantity: 10, fkIdLocation: 1, fkIdUser: 1, sapCode: '12345' });
    expect(result.success).toBe(true);
    expect(validateForeignKey).toHaveBeenCalledWith('location', 'idLocation', 1);
    expect(validateForeignKey).toHaveBeenCalledWith('user', 'idUser', 1);
    expect(queryAsync).toHaveBeenCalledWith('SELECT idItem FROM item WHERE sapCode = ?', ['12345']);
  });

  // Teste para item não encontrado por SAP Code
  it('deve retornar erro se o item não for encontrado pelo sapCode', async () => {
    validateForeignKey.mockResolvedValueOnce({ success: true }); // Mock para location
    validateForeignKey.mockResolvedValueOnce({ success: true }); // Mock para user
    queryAsync.mockResolvedValueOnce([undefined]); // Simula que o SAP Code não existe

    const result = await validateCreateLot({ quantity: 10, fkIdLocation: 1, fkIdUser: 1, sapCode: '99999' });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Item não encontrado');
  });

  // Teste para identificador de item ausente
  it('deve retornar erro se nem idItem nem sapCode forem fornecidos', async () => {
    validateForeignKey.mockResolvedValueOnce({ success: true }); // Mock para location
    validateForeignKey.mockResolvedValueOnce({ success: true }); // Mock para user

    const result = await validateCreateLot({ quantity: 10, fkIdLocation: 1, fkIdUser: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Identificador ausente');
  });

  // Teste para falha na validação de chave estrangeira (ex: location)
  it('deve retornar erro se a validação da chave estrangeira falhar', async () => {
    const validationError = { success: false, error: 'Chave estrangeira inválida', details: 'Location não encontrada' };
    validateForeignKey.mockResolvedValueOnce(validationError); // Mock para location falhar

    const result = await validateCreateLot({ quantity: 10, fkIdLocation: 999, fkIdUser: 1 });
    expect(result).toEqual(validationError);
  });

  // Teste para erro interno do servidor durante a validação
  it('deve retornar erro interno do servidor em caso de erro inesperado', async () => {
    validateForeignKey.mockRejectedValueOnce(new Error('Erro de banco de dados'));

    const result = await validateCreateLot({ quantity: 10, fkIdLocation: 1, fkIdUser: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Erro interno do servidor');
  });
});

describe('validateUpdateLotQuantity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar erro se campos obrigatórios estiverem ausentes', async () => {
    const result = await validateUpdateLotQuantity({ fkIdUser: 1 }); // Quantity ausente
    expect(result.success).toBe(false);
    expect(result.error).toBe('Campos obrigatórios ausentes');
  });

  it('deve retornar erro se a quantidade for inválida', async () => {
    const result = await validateUpdateLotQuantity({ quantity: 'abc', fkIdUser: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Quantidade inválida');
  });

  it('deve retornar sucesso se a quantidade e o fkIdUser forem válidos', async () => {
    validateForeignKey.mockResolvedValueOnce({ success: true }); // Mock para user

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
    validateForeignKey.mockResolvedValueOnce({ success: true }); // Mock para location

    const result = await validateUpdateLotInformation({ fkIdLocation: 3 });
    expect(result.success).toBe(true);
    expect(validateForeignKey).toHaveBeenCalledWith('location', 'idLocation', 3);
  });

  it('deve retornar sucesso se apenas expirationDate for fornecido e válido', async () => {
    const result = await validateUpdateLotInformation({ expirationDate: '2025-12-31' });
    expect(result.success).toBe(true);
    // Não esperamos que validateForeignKey seja chamado aqui
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
  });
});