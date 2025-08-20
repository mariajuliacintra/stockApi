const { queryAsync } = require("../utils/functions");

module.exports = class TransactionController {
    static async createTransaction(fkIdUser, itemType, itemId, actionDescription, quantityChange, oldQuantity, newQuantity) {
        const query = `
            INSERT INTO transactions (fkIdUser, itemType, itemId, actionDescription, quantityChange, oldQuantity, newQuantity)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [fkIdUser, itemType, itemId, actionDescription, quantityChange, oldQuantity, newQuantity];

        try {
            await queryAsync(query, values);
        } catch (err) {
            throw new Error(`Erro ao criar transação: ${err.message}`);
        }
    }

    static async ajust(fkIdUser, itemType, itemId, newQuantity) {
        let tableName;
        let idColumn;
        let quantityColumn;

        switch (itemType) {
            case 'tool':
                tableName = 'tool';
                idColumn = 'idTool';
                quantityColumn = 'quantity';
                break;
            case 'material':
                tableName = 'material';
                idColumn = 'idMaterial';
                quantityColumn = 'quantity';
                break;
            case 'rawMaterial':
                tableName = 'rawMaterial';
                idColumn = 'idRawMaterial';
                quantityColumn = 'quantity';
                break;
            case 'equipment':
                tableName = 'equipment';
                idColumn = 'idEquipment';
                quantityColumn = 'quantity';
                break;
            case 'product':
                tableName = 'product';
                idColumn = 'idProduct';
                quantityColumn = 'quantity';
                break;
            case 'diverses':
                tableName = 'diverses';
                idColumn = 'idDiverses';
                quantityColumn = 'quantity';
                break;
            default:
                throw new Error('Tipo de item inválido.');
        }

        const selectQuery = `SELECT ${quantityColumn} FROM ${tableName} WHERE ${idColumn} = ?`;
        const updateQuery = `UPDATE ${tableName} SET ${quantityColumn} = ? WHERE ${idColumn} = ?`;

        const oldQuantityResult = await queryAsync(selectQuery, [itemId]);
        const oldQuantity = oldQuantityResult[0][quantityColumn];
        const quantityChange = newQuantity - oldQuantity;

        await queryAsync(updateQuery, [newQuantity, itemId]);

        await this.createTransaction(
            fkIdUser,
            itemType,
            itemId,
            'AJUST',
            quantityChange,
            oldQuantity,
            newQuantity
        );
    }
    
    static async createTransactionFromRequest(req, res) {
        try {
            const { fkIdUser, itemType, itemId, actionDescription, quantityChange, oldQuantity, newQuantity } = req.body;
            await TransactionController.createTransaction(fkIdUser, itemType, itemId, actionDescription, quantityChange, oldQuantity, newQuantity);
            res.status(201).json({ message: 'Transação criada com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getAllTransactions(req, res) {
        const query = 'SELECT * FROM transactions ORDER BY transactionDate DESC';
        try {
            const results = await queryAsync(query);
            res.status(200).json(results);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getTransactionById(req, res) {
        const { idTransaction } = req.params;
        const query = 'SELECT * FROM transactions WHERE idTransaction = ?';
        try {
            const results = await queryAsync(query, [idTransaction]);
            if (results.length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404).json({ message: 'Transação não encontrada.' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async updateTransaction(req, res) {
        const { idTransaction } = req.params;
        const { fkIdUser, itemType, itemId, actionDescription, quantityChange, oldQuantity, newQuantity } = req.body;
        const query = `
            UPDATE transactions
            SET fkIdUser = ?, itemType = ?, itemId = ?, actionDescription = ?, quantityChange = ?, oldQuantity = ?, newQuantity = ?
            WHERE idTransaction = ?
        `;
        const values = [fkIdUser, itemType, itemId, actionDescription, quantityChange, oldQuantity, newQuantity, idTransaction];
        try {
            await queryAsync(query, values);
            res.status(200).json({ message: 'Transação atualizada com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async deleteTransaction(req, res) {
        const { idTransaction } = req.params;
        const query = 'DELETE FROM transactions WHERE idTransaction = ?';
        try {
            await queryAsync(query, [idTransaction]);
            res.status(200).json({ message: 'Transação deletada com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};