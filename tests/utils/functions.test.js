const connect = require("../../src/db/connect");
const { queryAsync } = require("../../src/utils/functions");

// Mocka o módulo connect para simular a resposta do banco de dados
// Isso substitui a implementação real de `db/connect.js`
jest.mock("../../src/db/connect", () => ({
  query: jest.fn(),
}));

const { validateDomain } = require("../../src/utils/functions");

describe("validateDomain", () => {
  it("deve retornar null para um domínio SENAI válido", () => {
    // E-mail com domínio permitido
    const email = "usuario@sp.senai.br";
    const result = validateDomain(email);

    // Espera que o resultado seja null (sem erro)
    expect(result).toBeNull();
  });

  it("deve retornar um objeto de erro para um domínio inválido", () => {
    // E-mail com domínio não permitido
    const email = "usuario@empresa.com";
    const result = validateDomain(email);

    // Espera que o resultado seja um objeto de erro
    expect(result).toEqual({ error: "Email inválido. Deve pertencer a um domínio SENAI autorizado" });
  });

  it("deve retornar um objeto de erro se o email não tiver o caractere '@'", () => {
    // E-mail sem o caractere @
    const email = "emailinvalido.com";
    const result = validateDomain(email);

    // Espera que o resultado seja um objeto de erro
    expect(result).toEqual({ error: "Email inválido. Deve conter @" });
  });
});

const { validatePassword } = require("../../src/utils/functions");

describe("validatePassword", () => {
  it("deve retornar true para uma senha válida", () => {
    // Senha que atende a todos os critérios
    const validPassword = "Senha@123";
    const result = validatePassword(validPassword);
    expect(result).toBe(true);
  });

  it("deve retornar false para uma senha muito curta", () => {
    const invalidPassword = "S@123";
    const result = validatePassword(invalidPassword);
    expect(result).toBe(false);
  });
  
  it("deve retornar false para uma senha sem caracter especial", () => {
    const invalidPassword = "senhasemcaractere123";
    const result = validatePassword(invalidPassword);
    expect(result).toBe(false);
  });
  
  // Adicione outros testes para diferentes falhas (sem número, sem letra, etc.)
});

const { generateRandomCode } = require("../../src/utils/functions");

describe("generateRandomCode", () => {
  it("deve gerar um código de 6 dígitos", () => {
    const code = generateRandomCode();
    // Verifica se o código é uma string
    expect(typeof code).toBe("string");
    // Verifica se o comprimento da string é 6
    expect(code.length).toBe(6);
    // Verifica se a string contém apenas dígitos
    expect(code).toMatch(/^\d{6}$/);
  });
});

describe("queryAsync", () => {
  it("deve resolver a promise com os resultados em caso de sucesso", async () => {
    // Define o comportamento da função mock: sucesso com resultados
    const mockResults = [{ id: 1, name: "Teste" }];
    connect.query.mockImplementationOnce((query, values, callback) => {
      callback(null, mockResults); // Retorna sucesso
    });

    const results = await queryAsync("SELECT * FROM table", []);
    expect(results).toEqual(mockResults);
    expect(connect.query).toHaveBeenCalledWith("SELECT * FROM table", [], expect.any(Function));
  });

  it("deve rejeitar a promise com um erro em caso de falha", async () => {
    // Define o comportamento da função mock: falha com um erro
    const mockError = new Error("Erro no banco de dados");
    connect.query.mockImplementationOnce((query, values, callback) => {
      callback(mockError, null); // Retorna erro
    });

    // Espera que a promise seja rejeitada com o erro
    await expect(queryAsync("SELECT * FROM table", [])).rejects.toThrow("Erro no banco de dados");
  });
});