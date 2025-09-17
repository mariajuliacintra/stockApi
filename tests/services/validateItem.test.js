// tests/services/validateItem.test.js

// Mocka a função queryAsync de ../utils/functions
const { queryAsync } = require('../../src/utils/functions');
jest.mock('../../src/utils/functions', () => ({
  queryAsync: jest.fn(),
}));

// Mocka a função validateForeignKey de ../utils/querys
// Note: certifique-se de que o caminho está correto. Se for ../utils/query.js, ajuste.
const { validateForeignKey } = require('../../src/utils/querys');
jest.mock('../../src/utils/querys', () => ({
  validateForeignKey: jest.fn(),
}));

// Importa as funções a serem testadas
const { validateCreateItem, validateUpdateInformation } = require('../../src/services/validateItem');

describe('validateCreateItem', () => {
  // Limpa os mocks antes de cada teste para garantir um estado limpo
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Cenário de sucesso
  it('deve retornar sucesso se todos os campos forem válidos e chaves estrangeiras existirem', async () => {
    // Mocka o retorno de validateForeignKey para simular chaves existentes
    validateForeignKey.mockResolvedValue({ success: true });
    // Mocka queryAsync para o caso de validação de sapCode
    queryAsync.mockResolvedValue([{ count: 0 }]); // sapCode não existe

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
    // Verifica se as validações de chave estrangeira foram chamadas corretamente
    expect(validateForeignKey).toHaveBeenCalledWith('category', 'idCategory', 1);
    expect(validateForeignKey).toHaveBeenCalledWith('location', 'idLocation', 1);
    expect(validateForeignKey).toHaveBeenCalledWith('user', 'idUser', 1);
  });

  // Cenário: Campos obrigatórios ausentes
  it('deve retornar erro se campos obrigatórios ausentes', async () => {
    const itemData = {
      name: 'Test Item',
      quantity: 10,
      fkIdLocation: 1,
      fkIdUser: 1,
      // fkIdCategory, minimumStock, sapCode, technicalSpecs ausentes
    };

    const result = await validateCreateItem(itemData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Campos obrigatórios ausentes");
  });

  // Cenário: Quantidade inválida
  it('deve retornar erro se a quantidade for inválida', async () => {
    const itemData = {
      name: 'Test Item',
      fkIdCategory: 1,
      quantity: 0, // Quantidade inválida
      fkIdLocation: 1,
      fkIdUser: 1,
    };

    const result = await validateCreateItem(itemData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Quantidade inválida");
  });

  // Cenário: Código SAP já em uso
  it('deve retornar erro se o código SAP já estiver em uso', async () => {
    validateForeignKey.mockResolvedValue({ success: true }); // Simula chaves OK
    queryAsync.mockResolvedValue([{ count: 1 }]); // Simula sapCode já em uso

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
  });

  // Cenário: Chave estrangeira inválida (categoria)
  it('deve retornar erro se fkIdCategory for inválido', async () => {
    // Mocka validateForeignKey para retornar falha para a categoria
    validateForeignKey.mockResolvedValueOnce({ success: false, error: "Chave estrangeira inválida", message: "ID de categoria inválido." });

    const itemData = {
      name: 'Test Item',
      fkIdCategory: 999, // ID inválido
      quantity: 10,
      fkIdLocation: 1,
      fkIdUser: 1,
    };

    const result = await validateCreateItem(itemData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Chave estrangeira inválida");
  });

  // Cenário: Especificações técnicas com chave não numérica
  it('deve retornar erro se uma chave em technicalSpecs não for numérica', async () => {
    const itemData = {
      name: 'Test Item',
      fkIdCategory: 1,
      quantity: 10,
      fkIdLocation: 1,
      fkIdUser: 1,
      technicalSpecs: { 'invalid_key': 'value' } // Chave inválida
    };

    const result = await validateCreateItem(itemData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Formato de especificações técnicas inválido");
    expect(result.message).toContain("deve ser um número inteiro (ID)");
  });

  // Cenário: Especificações técnicas com valor nulo
  it('deve retornar erro se um valor em technicalSpecs for nulo', async () => {
    const itemData = {
      name: 'Test Item',
      fkIdCategory: 1,
      quantity: 10,
      fkIdLocation: 1,
      fkIdUser: 1,
      technicalSpecs: { 1: 'value1', 2: null } // Valor nulo
    };

    const result = await validateCreateItem(itemData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Valor de especificação técnica inválido");
    expect(result.message).toContain("não pode ser nulo ou indefinido");
  });
});

describe('validateUpdateInformation', () => {
  // Limpa os mocks antes de cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Cenário de sucesso: Nenhum campo fornecido (o que pode ser um caso válido para não fazer nada)
  // Ou, se você preferir, pode forçar que PELO MENOS UM campo seja fornecido
  it('deve retornar erro se nenhum campo de atualização for fornecido', () => {
    const updateData = {}; // Nenhum campo para atualizar

    const result = validateUpdateInformation(updateData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Nenhum campo para atualização");
  });

  // Cenário de sucesso: Atualização parcial válida
  it('deve retornar sucesso se um campo válido for fornecido', () => {
    const updateData = { name: 'Updated Name' }; // Apenas o nome para atualizar

    const result = validateUpdateInformation(updateData);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Validação de atualização de item bem-sucedida.");
  });

  // Cenário: FK de categoria inválida
  it('deve retornar erro se fkIdCategory for inválido', () => {
    const updateData = { fkIdCategory: 'invalid_id' };
    const result = validateUpdateInformation(updateData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("ID de categoria inválido");
  });

  // Cenário: Código SAP inválido
  it('deve retornar erro se sapCode for inválido', () => {
    const updateData = { sapCode: 'non-integer-sap' };
    const result = validateUpdateInformation(updateData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Código SAP inválido");
  });

  // Cenário: Estoque mínimo inválido
  it('deve retornar erro se minimumStock for inválido', () => {
    const updateData = { minimumStock: -5 }; // Estoque mínimo negativo inválido
    const result = validateUpdateInformation(updateData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Valor de estoque mínimo inválido");
  });

  // Cenário: Múltiplos campos válidos
  it('deve retornar sucesso com múltiplos campos válidos', () => {
    const updateData = {
      name: 'Another Update',
      minimumStock: 10
    };
    const result = validateUpdateInformation(updateData);
    expect(result.success).toBe(true);
  });
});

