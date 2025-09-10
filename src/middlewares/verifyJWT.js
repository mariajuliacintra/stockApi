const jwt = require("jsonwebtoken");
const { queryAsync } = require("../utils/functions");

async function verifyJWT(req, res, next) {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ auth: false, message: "Token não foi fornecido." });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        const query = `SELECT idUser, email, role FROM user WHERE idUser = ? AND isActive = TRUE`;
        const results = await queryAsync(query, [decoded.idUser]);

        if (results.length === 0) {
            return res.status(403).json({ auth: false, message: "Usuário não encontrado ou inativo." });
        }

        req.userId = results[0].idUser;
        req.email = results[0].email;
        req.role = results[0].role;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ auth: false, message: "Token expirado. Faça o login novamente." });
        }
        return res.status(403).json({ auth: false, message: "Falha na autenticação - Token Inválido." });
    }
}

module.exports = verifyJWT;