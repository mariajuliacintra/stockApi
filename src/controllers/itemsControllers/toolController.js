const { queryAsync } = require("../../utils/functions");
const TransactionController = require("../transactionController");

module.exports = class ToolController {
    static async createTool(req, res) {
        const { fkIdUser, name, aliases, brand, description, technicalSpecs, quantity, lastMaintenance, batchNumber, fkIdLocation } = req.body;
        const query = 'INSERT INTO tool (name, aliases, brand, description, technicalSpecs, quantity, lastMaintenance, batchNumber, fkIdLocation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [name, aliases, brand, description, technicalSpecs, quantity, lastMaintenance, batchNumber, fkIdLocation];
        try {
            const result = await queryAsync(query, values);
            const itemId = result.insertId;

            if (quantity > 0) {
                await TransactionController.createTransaction(fkIdUser, 'tool', itemId, 'IN', quantity, 0, quantity);
            }

            res.status(201).json({ message: 'Ferramenta criada com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getAllTools(req, res) {
        const query = 'SELECT * FROM tool';
        try {
            const results = await queryAsync(query);
            res.status(200).json(results);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getToolById(req, res) {
        const { idTool } = req.params;
        const query = 'SELECT * FROM tool WHERE idTool = ?';
        try {
            const results = await queryAsync(query, [idTool]);
            if (results.length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404).json({ message: 'Ferramenta não encontrada.' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async updateTool(req, res) {
        const { idTool } = req.params;
        const { fkIdUser, name, aliases, brand, description, technicalSpecs, quantity, lastMaintenance, batchNumber, fkIdLocation } = req.body;

        try {
            const oldToolResult = await queryAsync('SELECT quantity FROM tool WHERE idTool = ?', [idTool]);
            if (oldToolResult.length === 0) {
                return res.status(404).json({ message: 'Ferramenta não encontrada para atualização.' });
            }
            const oldQuantity = oldToolResult[0].quantity;
            const quantityChange = quantity - oldQuantity;
            const actionDescription = quantityChange > 0 ? 'IN' : quantityChange < 0 ? 'OUT' : 'AJUST';

            const query = 'UPDATE tool SET name = ?, aliases = ?, brand = ?, description = ?, technicalSpecs = ?, quantity = ?, lastMaintenance = ?, batchNumber = ?, fkIdLocation = ? WHERE idTool = ?';
            const values = [name, aliases, brand, description, technicalSpecs, quantity, lastMaintenance, batchNumber, fkIdLocation, idTool];

            await queryAsync(query, values);

            await TransactionController.createTransaction(
                fkIdUser,
                'tool',
                idTool,
                actionDescription,
                quantityChange,
                oldQuantity,
                quantity
            );

            res.status(200).json({ message: 'Ferramenta atualizada com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async deleteTool(req, res) {
        const { idTool } = req.params;
        const query = 'DELETE FROM tool WHERE idTool = ?';
        try {
            await queryAsync(query, [idTool]);
            res.status(200).json({ message: 'Ferramenta deletada com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};