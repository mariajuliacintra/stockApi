const {
    queryAsync,
    validateDomain,
    validatePassword,
    generateRandomCode,
    createToken,
    handleResponse
} = require("../../utils/functions");

const connect = require("../../db/connect");
const jwt = require("jsonwebtoken");

jest.mock("../../db/connect", () => ({
    pool: {
        query: jest.fn(),
    },
    closePool: jest.fn().mockResolvedValue(true),
}));

jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
}));

const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

afterAll(async () => {
    mockConsoleError.mockRestore();
    await connect.closePool();
});

describe("validateDomain", () => {
    it("deve retornar null para um domínio SENAI válido (@sp.senai.br)", () => {
        const email = "usuario@sp.senai.br";
        const result = validateDomain(email);
        expect(result).toBeNull();
    });

    it("deve retornar null para o domínio '@gmail.com' (agora permitido em functions.js)", () => {
        const email = "usuario@gmail.com";
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
    it("deve retornar { valid: true, errors: [] } para uma senha válida", () => {
        const validPassword = "Senha@123."; 
        const result = validatePassword(validPassword);
        expect(result).toEqual({ valid: true, errors: [] });
    });

    it("deve retornar { valid: false } e erros para uma senha muito curta (menos de 8)", () => {
        const invalidPassword = "S@1m23";
        const result = validatePassword(invalidPassword);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(expect.stringContaining("no mínimo 8 caracteres"));
    });

    it("deve retornar { valid: false } e erros para uma senha sem caracter especial", () => {
        const invalidPassword = "Senhasemcaractere123";
        const result = validatePassword(invalidPassword);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(expect.stringContaining("pelo menos um caractere especial"));
        expect(result.errors.length).toBe(1);
    });

    it("deve retornar { valid: false } e erros para uma senha sem número", () => {
        const invalidPassword = "SemNumeroMin@";
        const result = validatePassword(invalidPassword);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(expect.stringContaining("pelo menos um número"));
        expect(result.errors.length).toBe(1);
    });

    it("deve retornar { valid: false } e erros para uma senha sem letra maiúscula", () => {
        const invalidPassword = "senhasemcaps@123";
        const result = validatePassword(invalidPassword);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(expect.stringContaining("pelo menos uma letra maiúscula"));
        expect(result.errors.length).toBe(1);
    });

    it("deve retornar { valid: false } e erros para uma senha sem letra minúscula", () => {
        const invalidPassword = "SENHASMCAPS@123";
        const result = validatePassword(invalidPassword);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(expect.stringContaining("pelo menos uma letra minúscula"));
        expect(result.errors.length).toBe(1);
    });

    it("deve retornar { valid: false } e erros para uma senha com caractere não permitido (emoji)", () => {
        const invalidPassword = "Senha@123😊"; 
        const result = validatePassword(invalidPassword);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(expect.stringContaining("contém caracteres não permitidos"));
        expect(result.errors.length).toBe(1);
    });
    
    it("deve retornar { valid: false } e erros para uma senha com caractere especial não permitido (parêntese)", () => {
        const invalidPassword = "Senha@123("; 
        const result = validatePassword(invalidPassword);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(expect.stringContaining("contém caracteres não permitidos"));
        expect(result.errors.length).toBe(1);
    });

    it("deve retornar { valid: false } e múltiplos erros para uma senha que falha em vários critérios", () => {
        const invalidPassword = "1"; 
        const result = validatePassword(invalidPassword);
        
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(3); 
        expect(result.errors).toContainEqual(expect.stringContaining("no mínimo 8 caracteres"));
        expect(result.errors).toContainEqual(expect.stringContaining("pelo menos uma letra maiúscula"));
        expect(result.errors).toContainEqual(expect.stringContaining("pelo menos uma letra minúscula"));
        expect(result.errors).toContainEqual(expect.stringContaining("pelo menos um caractere especial"));
    });
});

describe("generateRandomCode", () => {
    it("deve gerar um código de 6 dígitos numéricos (string)", () => {
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
        const mockResults = [{ id: 1, name: "Teste" }];
        connect.pool.query.mockImplementationOnce((query, values, callback) => {
            callback(null, mockResults);
        });

        const results = await queryAsync("SELECT * FROM table", []);
        expect(results).toEqual(mockResults);
        expect(connect.pool.query).toHaveBeenCalledWith("SELECT * FROM table", [], expect.any(Function));
    });

    it("deve rejeitar a promise com um erro em caso de falha no banco de dados", async () => {
        const mockError = new Error("Erro no banco de dados");
        connect.pool.query.mockImplementationOnce((query, values, callback) => {
            callback(mockError, null);
        });

        await expect(queryAsync("SELECT * FROM table", [])).rejects.toThrow("Erro no banco de dados");
        expect(connect.pool.query).toHaveBeenCalledWith("SELECT * FROM table", [], expect.any(Function));
    });
});

describe("createToken", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve chamar jwt.sign com o payload e tempo de expiração padrão (1h)", () => {
        const payload = { userId: 1 };
        const mockToken = "mocked.jwt.token";
        jwt.sign.mockReturnValue(mockToken);

        const token = createToken(payload);

        expect(jwt.sign).toHaveBeenCalledWith(
            payload,
            process.env.SECRETKEY,
            { expiresIn: "1h" }
        );
        expect(token).toBe(mockToken);
    });

    it("deve chamar jwt.sign com um tempo de expiração customizado", () => {
        const payload = { userId: 2 };
        const expirationTime = "30m";
        const mockToken = "mocked.jwt.token.custom";
        jwt.sign.mockReturnValue(mockToken);

        const token = createToken(payload, expirationTime);

        expect(jwt.sign).toHaveBeenCalledWith(
            payload,
            process.env.SECRETKEY,
            { expiresIn: expirationTime }
        );
        expect(token).toBe(mockToken);
    });
});

describe("handleResponse", () => {
    let mockRes;
    let mockStatus;
    let mockJson;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn(() => ({ json: mockJson }));
        mockRes = { status: mockStatus };
    });

    it("deve retornar 200 e mensagem padrão em caso de sucesso mínimo", () => {
        const result = handleResponse(mockRes, 200, { success: true });
        
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: "Operação realizada com sucesso.",
            details: null,
        });
        expect(result).toBe(mockRes.status().json());
    });

    it("deve retornar o status customizado e mensagem customizada em caso de sucesso", () => {
        const result = handleResponse(mockRes, 201, { 
            success: true, 
            message: "Criado com sucesso." 
        });
        
        expect(mockStatus).toHaveBeenCalledWith(201);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
            message: "Criado com sucesso.",
        }));
    });

    it("deve incluir dados no formato de arrayName e array de objetos", () => {
        const mockData = [{ id: 1, item: "A" }];
        handleResponse(mockRes, 200, { 
            success: true, 
            data: mockData, 
            arrayName: "items" 
        });
        
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
            items: mockData,
        }));
    });

    it("deve incluir pagination se fornecido", () => {
        const mockPagination = { total: 10, page: 1 };
        handleResponse(mockRes, 200, { 
            success: true, 
            pagination: mockPagination 
        });
        
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
            pagination: mockPagination,
        }));
    });

    it("deve retornar 500 e erro padrão em caso de falha mínima", () => {
        handleResponse(mockRes, 500, { success: false });
        
        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
            success: false,
            error: "Ocorreu um erro na operação.",
            details: null,
        });
    });

    it("deve retornar o status customizado e erro customizado em caso de falha", () => {
        handleResponse(mockRes, 400, { 
            success: false, 
            error: "Requisição inválida.", 
            details: "Dados faltando." 
        });
        
        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
            error: "Requisição inválida.",
            details: "Dados faltando."
        }));
    });

    it("deve usar status 500 se o status de falha não for fornecido", () => {
        handleResponse(mockRes, undefined, { 
            success: false, 
            error: "Erro desconhecido." 
        });
        
        expect(mockStatus).toHaveBeenCalledWith(500);
    });
});