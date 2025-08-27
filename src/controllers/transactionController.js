const { queryAsync, createToken, validateToken } = require('../utils/functions');
const jwt = require("jsonwebtoken");

module.exports = class TransactionController {
    static async getAllTransactions (req, res) {
        try {
            const query = "SELECT * FROM transactions";
            const transactions = await queryAsync(query);
            res.status(200).json(transactions);
        } catch (error) {
            console.error("Erro ao buscar transações:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    static async getTransactionById (req, res) {
        const { idTransaction } = req.params;
        try {
            const query = "SELECT * FROM transactions WHERE idTransaction = ?";
            const transaction = await queryAsync(query, [idTransaction]);
            if (transaction.length === 0) {
                return res.status(404).json({ message: "Transação não encontrada." });
            }
            res.status(200).json(transaction[0]);
        } catch (error) {
            console.error("Erro ao buscar transação por ID:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    static async addTransaction (req, res) {
        const { fkIdUser, fkIdItem, actionDescription, quantityChange } = req.body;
        try {
            if (!fkIdUser || !fkIdItem || !actionDescription || quantityChange === undefined || isNaN(quantityChange) || quantityChange <= 0) {
                return res.status(400).json({ message: "Campos obrigatórios inválidos ou ausentes." });
            }

            const userQuery = "SELECT COUNT(*) AS count FROM user WHERE idUser = ?";
            const itemQuery = "SELECT * FROM item WHERE idItem = ?";

            const userResult = await queryAsync(userQuery, [fkIdUser]);
            const itemResult = await queryAsync(itemQuery, [fkIdItem]);

            if (userResult[0].count === 0) {
                return res.status(404).json({ message: "Usuário não encontrado." });
            }

            if (itemResult.length === 0) {
                return res.status(404).json({ message: "Item não encontrado." });
            }

            const oldQuantity = itemResult[0].quantity;
            let newQuantity;

            if (actionDescription === 'IN') {
                newQuantity = parseFloat(oldQuantity) + parseFloat(quantityChange);
            } else if (actionDescription === 'OUT') {
                if (parseFloat(oldQuantity) < parseFloat(quantityChange)) {
                    return res.status(400).json({ message: "Quantidade insuficiente em estoque." });
                }
                newQuantity = parseFloat(oldQuantity) - parseFloat(quantityChange);
            } else if (actionDescription === 'AJUST') {
                newQuantity = parseFloat(oldQuantity) + parseFloat(quantityChange);
            } else {
                return res.status(400).json({ message: "Ação inválida. Use 'IN', 'OUT' ou 'AJUST'." });
            }

            const insertTransactionQuery = "INSERT INTO transactions (fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity, transactionDate) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
            const updateItemQuery = "UPDATE item SET quantity = ? WHERE idItem = ?";

            await queryAsync("START TRANSACTION");

            const transactionValues = [fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity];
            await queryAsync(insertTransactionQuery, transactionValues);

            const itemValues = [newQuantity, fkIdItem];
            await queryAsync(updateItemQuery, itemValues);

            await queryAsync("COMMIT");

            res.status(201).json({ message: "Transação registrada e item atualizado com sucesso!" });

        } catch (error) {
            await queryAsync("ROLLBACK");
            console.error("Erro ao registrar transação:", error);
            res.status(500).json({ error: "Erro interno do servidor", details: error.message });
        }
    }

    static async getTransactionByItem (req, res) {
        const { fkIdItem } = req.params;
        try {
            const query = "SELECT * FROM transactions WHERE fkIdItem = ? ORDER BY transactionDate DESC";
            const transactions = await queryAsync(query, [fkIdItem]);

            if (transactions.length === 0) {
                return res.status(404).json({ message: "Nenhuma transação encontrada para este item." });
            }

            res.status(200).json(transactions);
        } catch (error) {
            console.error("Erro ao buscar transações por item:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    static async getTransactionByUser (req, res) {
        const { fkIdUser } = req.params;
        try {
            const query = "SELECT * FROM transactions WHERE fkIdUser = ? ORDER BY transactionDate DESC";
            const transactions = await queryAsync(query, [fkIdUser]);

            if (transactions.length === 0) {
                return res.status(404).json({ message: "Nenhuma transação encontrada para este usuário." });
            }

            res.status(200).json(transactions);
        } catch (error) {
            console.error("Erro ao buscar transações por usuário:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }
};
