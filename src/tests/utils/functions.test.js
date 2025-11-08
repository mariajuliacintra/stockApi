const {
    queryAsync,
    validateDomain,
    validatePassword,
    generateRandomCode
} = require("../../utils/functions");

const connect = require("../../db/connect");

jest.mock("../../db/connect", () => ({
    pool: {
        query: jest.fn(),
    },
    closePool: jest.fn().mockResolvedValue(true),
}));

const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

afterAll(async () => {
    mockConsoleError.mockRestore();
    await connect.closePool();
});

describe("validateDomain", () => {
    it("deve retornar null para um domínio SENAI válido", () => {
        const email = "usuario@sp.senai.br";
        const result = validateDomain(email);
        expect(result).toBeNull();
    });

    it("deve retornar um objeto de erro para um domínio inválido", () => {
        const email = "usuario@empresa.com";
        const result = validateDomain(email);
        expect(result).toEqual({
            error: "Email inválido. Deve pertencer a um domínio SENAI autorizado"
        });
    });

    it("deve retornar um objeto de erro se o email não tiver o caractere '@'", () => {
        const email = "emailinvalido.com";
        const result = validateDomain(email);
        expect(result).toEqual({
            error: "Email inválido. Deve conter @"
        });
    });
});

describe("validatePassword", () => {
    it("deve retornar true para uma senha válida", () => {
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

    it("deve retornar false para uma senha sem número", () => {
        const invalidPassword = "SemNumero@";
        const result = validatePassword(invalidPassword);
        expect(result).toBe(false);
    });

    it("deve retornar false para uma senha sem letra maiúscula", () => {
        const invalidPassword = "senhasemcaps@1";
        const result = validatePassword(invalidPassword);
        expect(result).toBe(false);
    });

    it("deve retornar false para uma senha sem letra minúscula", () => {
        const invalidPassword = "SENHASMCAPS@1";
        const result = validatePassword(invalidPassword);
        expect(result).toBe(false);
    });
});

describe("generateRandomCode", () => {
    it("deve gerar um código de 6 dígitos", () => {
        const code = generateRandomCode();
        expect(typeof code).toBe("string");
        expect(code.length).toBe(6);
        expect(code).toMatch(/^\d{6}$/);
    });
});

describe("queryAsync", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve resolver a promise com os resultados em caso de sucesso", async () => {
        const mockResults = [{
            id: 1,
            name: "Teste"
        }];
        connect.pool.query.mockImplementationOnce((query, values, callback) => {
            callback(null, mockResults);
        });

        const results = await queryAsync("SELECT * FROM table", []);
        expect(results).toEqual(mockResults);
        expect(connect.pool.query).toHaveBeenCalledWith("SELECT * FROM table", [], expect.any(Function));
        expect(mockConsoleError).not.toHaveBeenCalled();
    });

    it("deve rejeitar a promise com um erro em caso de falha", async () => {
        const mockError = new Error("Erro no banco de dados");
        connect.pool.query.mockImplementationOnce((query, values, callback) => {
            callback(mockError, null);
        });

        await expect(queryAsync("SELECT * FROM table", [])).rejects.toThrow("Erro no banco de dados");
        expect(connect.pool.query).toHaveBeenCalledWith("SELECT * FROM table", [], expect.any(Function));
    });
});