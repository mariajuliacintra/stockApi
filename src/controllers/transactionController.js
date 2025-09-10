const { queryAsync, handleResponse } = require('../utils/functions');

module.exports = class TransactionController {
    static async getAllTransactions (req, res) {
        try {
            const query = "SELECT * FROM transactions";
            const transactions = await queryAsync(query);
            handleResponse(res, 200, transactions);
        } catch (error) {
            console.error("Erro ao buscar transações:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async getTransactionById (req, res) {
        const { idTransaction } = req.params;
        try {
            const query = "SELECT * FROM transactions WHERE idTransaction = ?";
            const transaction = await queryAsync(query, [idTransaction]);

            if (transaction.length === 0) {
                return handleResponse(res, 404, { message: "Transação não encontrada." });
            }

            handleResponse(res, 200, transaction[0]);
        } catch (error) {
            console.error("Erro ao buscar transação por ID:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async addTransaction (req, res) {
        const { fkIdUser, fkIdItem, actionDescription, quantityChange } = req.body;
        try {
            if (!fkIdUser || !fkIdItem || !actionDescription || quantityChange === undefined || isNaN(quantityChange) || quantityChange <= 0) {
                return handleResponse(res, 400, { message: "Campos obrigatórios inválidos ou ausentes." });
            }

            const userQuery = "SELECT COUNT(*) AS count FROM user WHERE idUser = ?";
            const itemQuery = "SELECT * FROM item WHERE idItem = ?";

            const userResult = await queryAsync(userQuery, [fkIdUser]);
            const itemResult = await queryAsync(itemQuery, [fkIdItem]);

            if (userResult[0].count === 0) {
                return handleResponse(res, 404, { message: "Usuário não encontrado." });
            }

            if (itemResult.length === 0) {
                return handleResponse(res, 404, { message: "Item não encontrado." });
            }

            const oldQuantity = itemResult[0].quantity;
            let newQuantity;

            if (actionDescription === 'IN') {
                newQuantity = parseFloat(oldQuantity) + parseFloat(quantityChange);
            } else if (actionDescription === 'OUT') {
                if (parseFloat(oldQuantity) < parseFloat(quantityChange)) {
                    return handleResponse(res, 400, { message: "Quantidade insuficiente em estoque." });
                }
                newQuantity = parseFloat(oldQuantity) - parseFloat(quantityChange);
            } else if (actionDescription === 'AJUST') {
                newQuantity = parseFloat(oldQuantity) + parseFloat(quantityChange);
            } else {
                return handleResponse(res, 400, { message: "Ação inválida. Use 'IN', 'OUT' ou 'AJUST'." });
            }

            const insertTransactionQuery = "INSERT INTO transactions (fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity, transactionDate) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
            const updateItemQuery = "UPDATE item SET quantity = ? WHERE idItem = ?";

            await queryAsync("START TRANSACTION");

            const transactionValues = [fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity];
            await queryAsync(insertTransactionQuery, transactionValues);

            const itemValues = [newQuantity, fkIdItem];
            await queryAsync(updateItemQuery, itemValues);

            await queryAsync("COMMIT");

            handleResponse(res, 201, { message: "Transação registrada e item atualizado com sucesso!" });

        } catch (error) {
            await queryAsync("ROLLBACK");
            console.error("Erro ao registrar transação:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async getTransactionByItem (req, res) {
        const { fkIdItem } = req.params;
        try {
            const query = "SELECT * FROM transactions WHERE fkIdItem = ? ORDER BY transactionDate DESC";
            const transactions = await queryAsync(query, [fkIdItem]);

            if (transactions.length === 0) {
                return handleResponse(res, 404, { message: "Nenhuma transação encontrada para este item." });
            }

            handleResponse(res, 200, transactions);
        } catch (error) {
            console.error("Erro ao buscar transações por item:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async getTransactionByUser (req, res) {
        const { fkIdUser } = req.params;
        try {
            const query = "SELECT * FROM transactions WHERE fkIdUser = ? ORDER BY transactionDate DESC";
            const transactions = await queryAsync(query, [fkIdUser]);

            if (transactions.length === 0) {
                return handleResponse(res, 404, { message: "Nenhuma transação encontrada para este usuário." });
            }

            handleResponse(res, 200, transactions);
        } catch (error) {
            console.error("Erro ao buscar transações por usuário:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }
};