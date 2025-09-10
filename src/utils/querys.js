const { queryAsync } = require('./functions');

const findUserByEmail = async (email) => {
    const query = `SELECT * FROM user WHERE email = ? AND isActive = TRUE`;
    const results = await queryAsync(query, [email]);
    return results[0] || null;
};

const findUserById = async (idUser) => {
    const query = `SELECT * FROM user WHERE idUser = ? AND isActive = TRUE`;
    const results = await queryAsync(query, [idUser]);
    return results[0] || null;
};

module.exports = { findUserByEmail, findUserById };