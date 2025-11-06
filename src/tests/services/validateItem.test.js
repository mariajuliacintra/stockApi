const { queryAsync } = require('../../utils/functions');
const { validateForeignKey } = require('../../utils/querys');
const { validateCreateItem, validateUpdateInformation } = require('../../services/validateItem');

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

describe('validateCreateItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar sucesso se todos os campos forem válidos e chaves estrangeiras existirem', async () => {
    validateForeignKey.mockResolvedValue({ success: true });
    queryAsync
      .mockResolvedValueOnce([
        { idTechnicalSpec: 1 },
        { idTechnicalSpec: 2 }
      ])
      .mockResolvedValueOnce([{ count: 0 }]);

    const itemData = {
      name: 'Test Item',
      fkIdCategory: 1,
      quantity: 10,
      fkIdLocation: 1,
      fkIdUser: 1,
      minimumStock: 5,
      sapCode: 12345,
      technicalSpecs: { 1: 'Value1', 2: 'Value2' }
    };

    const result = await validateCreateItem(itemData);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Validação de criação de item bem-sucedida.");
    expect(validateForeignKey).toHaveBeenCalledWith('category', 'idCategory', 1);
    expect(validateForeignKey).toHaveBeenCalledWith('location', 'idLocation', 1);
    expect(validateForeignKey).toHaveBeenCalledWith('user', 'idUser', 1);
    expect(queryAsync).toHaveBeenCalledTimes(2);
  });

  it('deve retornar erro se campos obrigatórios ausentes', async () => {
    const itemData = {
      name: 'Test Item',
      quantity: 10,
      fkIdLocation: 1,
      fkIdUser: 1,
    };

    const result = await validateCreateItem(itemData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Campos obrigatórios ausentes");
  });

  it('deve retornar erro se a quantidade for inválida', async () => {
    const itemData = {
      name: 'Test Item',
      fkIdCategory: 1,
      quantity: 0,
      fkIdLocation: 1,
      fkIdUser: 1,
    };

    const result = await validateCreateItem(itemData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Quantidade inválida");
  });

  it('deve retornar erro se o estoque mínimo for negativo', async () => {
    const itemData = {
      name: 'Test Item',
      fkIdCategory: 1,
      quantity: 10,
      fkIdLocation: 1,
      fkIdUser: 1,
      minimumStock: -5
    };

    const result = await validateCreateItem(itemData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Valor de estoque mínimo inválido");
  });

  it('deve retornar erro se o código SAP já estiver em uso', async () => {
    validateForeignKey.mockResolvedValue({ success: true });
    queryAsync.mockResolvedValueOnce([{ count: 1 }]);

    const itemData = {
      name: 'Test Item',
      fkIdCategory: 1,
      quantity: 10,
      fkIdLocation: 1,
      fkIdUser: 1,
      sapCode: 54321
    };

    const result = await validateCreateItem(itemData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Código SAP já em uso");
    expect(queryAsync).toHaveBeenCalledWith("SELECT COUNT(*) AS count FROM item WHERE sapCode = ?", [54321]);
  });

  it('deve retornar erro se fkIdCategory for inválido', async () => {
    validateForeignKey.mockResolvedValueOnce({ success: false, error: "Chave estrangeira inválida", message: "ID de categoria inválido." });

    const itemData = {
      name: 'Test Item',
      fkIdCategory: 999,
      quantity: 10,
      fkIdLocation: 1,
      fkIdUser: 1,
    };

    const result = await validateCreateItem(itemData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Chave estrangeira inválida");
    expect(validateForeignKey).toHaveBeenCalledWith('category', 'idCategory', 999);
    expect(validateForeignKey).toHaveBeenCalledTimes(1);
  });

  it('deve retornar erro se um ID de especificação técnica for inválido/não existente', async () => {
    validateForeignKey.mockResolvedValue({ success: true });
    queryAsync
      .mockResolvedValueOnce([{ idTechnicalSpec: 1 }])
      .mockResolvedValueOnce([{ count: 0 }]);

    const itemData = {
      name: 'Test Item',
      fkIdCategory: 1,
      quantity: 10,
      fkIdLocation: 1,
      fkIdUser: 1,
      sapCode: 12345,
      technicalSpecs: { 1: 'Value1', 99: 'Value99' }
    };

    const result = await validateCreateItem(itemData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("ID de especificação técnica inválido");
    expect(result.message).toContain("99");
    expect(queryAsync).toHaveBeenCalledWith(
      "SELECT idTechnicalSpec FROM technicalSpec WHERE idTechnicalSpec IN (?,?)",
      ['1', '99']
    );
  });

  it('deve retornar sucesso com campos opcionais ausentes', async () => {
    validateForeignKey.mockResolvedValue({ success: true });

    const itemData = {
      name: 'Test Item',
      fkIdCategory: 1,
      quantity: 10,
      fkIdLocation: 1,
      fkIdUser: 1,
    };

    const result = await validateCreateItem(itemData);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Validação de criação de item bem-sucedida.");
    expect(queryAsync).not.toHaveBeenCalled();
  });

  it('deve retornar erro se technicalSpecs for um objeto vazio', async () => {
    const itemData = {
      name: 'Test Item',
      fkIdCategory: 1,
      quantity: 10,
      fkIdLocation: 1,
      fkIdUser: 1,
      technicalSpecs: {}
    };

    const result = await validateCreateItem(itemData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Formato de especificações técnicas inválido");
  });
});

describe('validateUpdateInformation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve retornar sucesso se um campo válido for fornecido', async () => {
    const updateData = { name: 'Updated Name' };

    const result = await validateUpdateInformation(updateData);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Validação de atualização de item bem-sucedida.");
    expect(validateForeignKey).not.toHaveBeenCalled();
    expect(queryAsync).not.toHaveBeenCalled();
  });

  it('deve retornar erro se nenhum campo de atualização for fornecido', async () => {
    const updateData = {};

    const result = await validateUpdateInformation(updateData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Nenhum campo para atualização");
  });

  it('deve retornar erro se fkIdCategory for inválido (formato)', async () => {
    const updateData = { fkIdCategory: 'invalid_id' };
    const result = await validateUpdateInformation(updateData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("ID de categoria inválido");
    expect(validateForeignKey).not.toHaveBeenCalled();
  });

  it('deve retornar erro se fkIdCategory não existir no BD', async () => {
    validateForeignKey.mockResolvedValue({ success: false, error: "Chave estrangeira inválida" });
    const updateData = { fkIdCategory: 999 };
    const result = await validateUpdateInformation(updateData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Chave estrangeira inválida");
    expect(validateForeignKey).toHaveBeenCalledWith('category', 'idCategory', 999);
  });

  it('deve retornar erro se sapCode for inválido (formato)', async () => {
    const updateData = { sapCode: 'non-integer-sap' };
    const result = await validateUpdateInformation(updateData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Código SAP inválido");
  });

  it('deve retornar erro se minimumStock for inválido (negativo)', async () => {
    const updateData = { minimumStock: -5 };
    const result = await validateUpdateInformation(updateData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Valor de estoque mínimo inválido");
  });

  it('deve retornar erro se um ID de especificação técnica for inválido/não existente ao atualizar', async () => {
    queryAsync.mockResolvedValue([{ idTechnicalSpec: 1 }]);

    const updateData = {
      technicalSpecs: { 1: 'Value1', 99: 'Value99' }
    };

    const result = await validateUpdateInformation(updateData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("ID de especificação técnica inválido");
    expect(result.message).toContain("99");
    expect(queryAsync).toHaveBeenCalledWith(
      "SELECT idTechnicalSpec FROM technicalSpec WHERE idTechnicalSpec IN (?,?)",
      ['1', '99']
    );
  });
});