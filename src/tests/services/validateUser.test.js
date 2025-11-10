const { validateUser, validateUpdate, validateRecovery, validateEmail, validateLogin } = require("../../services/validateUser");
const { validatePassword, validateDomain, queryAsync } = require("../../utils/functions");

jest.mock("../../utils/functions", () => ({
    validateDomain: jest.fn(),
    validatePassword: jest.fn(),
    queryAsync: jest.fn(),
}));

describe("validateUser", () => {
    const validPasswordValidation = { valid: true, errors: [] };
    const passwordValidationOneFailure = { valid: false, errors: ["A senha deve conter pelo menos uma letra maiúscula."] };
    const passwordValidationMultipleFailures = { valid: false, errors: ["A senha é muito curta.", "A senha não tem número."] };
    
    const validUserPayload = {
        name: "Test User",
        email: "test@sp.senai.br",
        password: "ValidPassword@123",
        confirmPassword: "ValidPassword@123",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        validateDomain.mockReturnValue(null);
        validatePassword.mockReturnValue(validPasswordValidation);
    });

    it("deve retornar erro se campos obrigatórios estiverem faltando", () => {
        const payload = { name: "Test", email: "a@b.c", password: "p" };
        const result = validateUser(payload);
        expect(result).toHaveProperty("error", "Todos os campos devem ser preenchidos");
    });

    it("deve retornar erro se o domínio do email for inválido", () => {
        validateDomain.mockReturnValue({ error: "Email inválido. Deve pertencer a um domínio SENAI autorizado" });
        const result = validateUser(validUserPayload);
        expect(result).toHaveProperty("error", "Email inválido. Deve pertencer a um domínio SENAI autorizado");
    });

    it("deve retornar erro se as senhas não coincidirem", () => {
        const payload = { ...validUserPayload, confirmPassword: "MismatchedPassword" };
        const result = validateUser(payload);
        expect(result).toHaveProperty("error", "As senhas não coincidem");
    });

    it("deve retornar erro específico se a senha falhar em APENAS um critério", () => {
        validatePassword.mockReturnValue(passwordValidationOneFailure);
        const result = validateUser(validUserPayload);
        expect(result).toHaveProperty("error", "A senha não atende a um critério de segurança.");
        expect(result).toHaveProperty("details", "A senha deve conter pelo menos uma letra maiúscula.");
    });

    it("deve retornar erro geral se a senha falhar em DOIS ou mais critérios", () => {
        validatePassword.mockReturnValue(passwordValidationMultipleFailures);
        const result = validateUser(validUserPayload);
        expect(result).toHaveProperty("error", "A senha é muito fraca e não atende aos requisitos de segurança.");
        expect(result.details).not.toContain("A senha é muito curta.");
    });

    it("deve retornar null se todas as validações passarem", () => {
        const result = validateUser(validUserPayload);
        expect(result).toBeNull();
    });
});

describe("validateEmail", () => {
    let mockConsoleError;
    
    beforeAll(() => {
        mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        mockConsoleError.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve retornar erro se o email já estiver em uso por um usuário ativo", async () => {
        queryAsync.mockResolvedValue([{ idUser: 1 }]);
        const result = await validateEmail("existing@email.com");
        expect(result).toHaveProperty("error", "O Email já está vinculado a outro usuário");
    });

    it("deve retornar null se o email não estiver em uso", async () => {
        queryAsync.mockResolvedValue([]);
        const result = await validateEmail("new@email.com");
        expect(result).toBeNull();
    });

    it("deve retornar erro em caso de falha na consulta ao banco de dados", async () => {
        queryAsync.mockRejectedValue(new Error("DB Error"));
        const result = await validateEmail("any@email.com");
        expect(result).toHaveProperty("error", "Erro ao verificar email");
    });
});

describe("validateLogin", () => {
    const validLoginPayload = {
        email: "login@sp.senai.br",
        password: "ValidPassword@123",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        validateDomain.mockReturnValue(null);
    });

    it("deve retornar erro se campos obrigatórios estiverem faltando", () => {
        const payload = { email: "a@b.c" };
        const result = validateLogin(payload);
        expect(result).toHaveProperty("error", "Todos os campos devem ser preenchidos");
    });

    it("deve retornar erro se o domínio do email for inválido", () => {
        validateDomain.mockReturnValue({ error: "Email inválido. Deve pertencer a um domínio SENAI autorizado" });
        const result = validateLogin(validLoginPayload);
        expect(result).toHaveProperty("error", "Email inválido. Deve pertencer a um domínio SENAI autorizado");
    });

    it("deve retornar null se todas as validações passarem", () => {
        const result = validateLogin(validLoginPayload);
        expect(result).toBeNull();
    });
});

describe("validateUpdate", () => {
    const validUpdatePayload = {
        name: "Novo Nome",
        email: "novo@sp.senai.br",
        password: "NewPassword@123",
        confirmPassword: "NewPassword@123"
    };
    const passwordValidationSuccess = { valid: true, errors: [] };
    const passwordValidationOneFailure = { valid: false, errors: ["A senha deve conter pelo menos uma letra maiúscula."] };
    const passwordValidationMultipleFailures = { valid: false, errors: ["A senha é muito curta.", "A senha não tem número."] };

    beforeEach(() => {
        jest.clearAllMocks();
        validateDomain.mockReturnValue(null);
        validatePassword.mockReturnValue(passwordValidationSuccess);
    });

    it("deve retornar erro se nenhum campo para atualizar for fornecido", () => {
        const payload = {};
        const result = validateUpdate(payload);
        expect(result).toHaveProperty("error", "Nenhum campo para atualizar foi fornecido.");
    });
    
    it("deve retornar null e NÃO chamar validações de domínio/senha se apenas o nome for atualizado", () => {
        const result = validateUpdate({ name: "Novo Nome" });
        expect(result).toBeNull();
        expect(validateDomain).not.toHaveBeenCalled();
        expect(validatePassword).not.toHaveBeenCalled();
    });

    it("deve retornar erro se o novo email tiver domínio inválido", () => {
        validateDomain.mockReturnValue({ error: "Email inválido." });
        const result = validateUpdate({ email: "invalid@domain.com" });
        expect(result).toHaveProperty("error", "Email inválido.");
    });

    it("deve retornar erro se a senha for fornecida sem a confirmação", () => {
        const result = validateUpdate({ password: "NewPassword@123" });
        expect(result).toHaveProperty("error", "A confirmação de senha é obrigatória.");
    });

    it("deve retornar erro se a senha e a confirmação não coincidirem", () => {
        const result = validateUpdate({ password: "NewPassword@123", confirmPassword: "Mismatched" });
        expect(result).toHaveProperty("error", "As senhas não coincidem.");
    });

    it("deve retornar erro específico se a nova senha falhar em APENAS um critério", () => {
        validatePassword.mockReturnValue(passwordValidationOneFailure);
        const result = validateUpdate({ password: "weak", confirmPassword: "weak" });
        expect(result).toHaveProperty("error", "A nova senha não atende a um critério de segurança.");
        expect(result).toHaveProperty("details", "A senha deve conter pelo menos uma letra maiúscula.");
    });

    it("deve retornar erro geral se a nova senha falhar em DOIS ou mais critérios", () => {
        validatePassword.mockReturnValue(passwordValidationMultipleFailures);
        const result = validateUpdate({ password: "weak", confirmPassword: "weak" });
        expect(result).toHaveProperty("error", "A nova senha é muito fraca e não atende aos requisitos de segurança.");
        expect(result.details).not.toContain("A senha é muito curta.");
    });

    it("deve retornar null se apenas o email for atualizado", () => {
        const result = validateUpdate({ email: "new@sp.senai.br" });
        expect(result).toBeNull();
    });

    it("deve retornar null se a senha for atualizada corretamente", () => {
        const result = validateUpdate({ password: validUpdatePayload.password, confirmPassword: validUpdatePayload.confirmPassword });
        expect(result).toBeNull();
    });
});

describe("validateRecovery", () => {
    const validRecoveryPayload = {
        password: "ValidPassword@123",
        confirmPassword: "ValidPassword@123",
    };
    const passwordValidationSuccess = { valid: true, errors: [] };
    const passwordValidationOneFailure = { valid: false, errors: ["A senha deve conter pelo menos uma letra maiúscula."] };
    const passwordValidationMultipleFailures = { valid: false, errors: ["A senha é muito curta.", "A senha não tem número."] };

    beforeEach(() => {
        jest.clearAllMocks();
        validatePassword.mockReturnValue(passwordValidationSuccess);
    });

    it("deve retornar erro se a senha ou confirmação estiverem faltando", () => {
        const payload = { password: "p" };
        const result = validateRecovery(payload);
        expect(result).toHaveProperty("error", "A senha e confirmação de senha são obrigatórias.");
    });

    it("deve retornar erro se as senhas não coincidirem", () => {
        const payload = { password: "p1", confirmPassword: "p2" };
        const result = validateRecovery(payload);
        expect(result).toHaveProperty("error", "As senhas não coincidem.");
    });

    it("deve retornar erro específico se a nova senha falhar em APENAS um critério", () => {
        validatePassword.mockReturnValue(passwordValidationOneFailure);
        const result = validateRecovery({ password: "weak", confirmPassword: "weak" });
        expect(result).toHaveProperty("error", "A nova senha não atende a um critério de segurança.");
        expect(result).toHaveProperty("details", "A senha deve conter pelo menos uma letra maiúscula.");
    });

    it("deve retornar erro geral se a nova senha falhar em DOIS ou mais critérios", () => {
        validatePassword.mockReturnValue(passwordValidationMultipleFailures);
        const result = validateRecovery({ password: "weak", confirmPassword: "weak" });
        expect(result).toHaveProperty("error", "A nova senha é muito fraca e não atende aos requisitos de segurança.");
        expect(result.details).not.toContain("A senha é muito curta.");
    });

    it("deve retornar null se a senha de recuperação for válida", () => {
        const result = validateRecovery(validRecoveryPayload);
        expect(result).toBeNull();
    });
});