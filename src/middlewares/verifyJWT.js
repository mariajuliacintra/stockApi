const jwt = require("jsonwebtoken");
const { queryAsync, handleResponse } = require("../utils/functions");

async function verifyJWT(req, res, next) {
    const token = req.headers["authorization"];

    if (!token) {
        return handleResponse(res, 401, { success: false, error: "Token não fornecido", details: "Um token de autenticação é necessário para acessar este recurso." });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRETKEY);
        const query = `SELECT idUser, email, role FROM user WHERE idUser = ? AND isActive = TRUE`;
        const results = await queryAsync(query, [decoded.idUser]);

        if (results.length === 0) {
            return handleResponse(res, 403, { success: false, error: "Usuário não encontrado ou inativo", details: "O usuário associado ao token não foi encontrado ou está inativo." });
        }

        req.userId = results[0].idUser;
        req.email = results[0].email;
        req.role = results[0].role;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return handleResponse(res, 401, { success: false, error: "Token expirado", details: "Seu token de autenticação expirou. Por favor, faça o login novamente." });
        }
        return handleResponse(res, 403, { success: false, error: "Autenticação falhou", details: "O token fornecido é inválido ou foi corrompido." });
    }
}

module.exports = verifyJWT;