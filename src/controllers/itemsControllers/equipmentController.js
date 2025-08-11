const { queryAsync } = require("../../utils/functions");
const TransactionController = require("../transactionController");
const validateItem = require("../../services/validateItem");

module.exports = class EquipmentController {
    static async createEquipment(req, res) {
        const validationResult = validateItem.validateEquipment(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.message });
        }

        const { fkIdUser, name, aliases, brand, description, technicalSpecs, quantity, batchNumber, fkIdLocation } = req.body;
        const query = 'INSERT INTO equipment (name, aliases, brand, description, technicalSpecs, quantity, batchNumber, fkIdLocation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [name, aliases, brand, description, technicalSpecs, quantity, batchNumber, fkIdLocation];
        try {
            const result = await queryAsync(query, values);
            const itemId = result.insertId;

            if (quantity > 0) {
                await TransactionController.createTransaction(fkIdUser, 'equipment', itemId, 'IN', quantity, 0, quantity);
            }

            res.status(201).json({ message: 'Equipamento criado com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getAllEquipment(req, res) {
        const query = 'SELECT * FROM equipment';
        try {
            const results = await queryAsync(query);
            res.status(200).json(results);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getEquipmentById(req, res) {
        const { idEquipment } = req.params;
        const query = 'SELECT * FROM equipment WHERE idEquipment = ?';
        try {
            const results = await queryAsync(query, [idEquipment]);
            if (results.length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404).json({ message: 'Equipamento não encontrado.' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async updateEquipment(req, res) {
        const validationResult = validateItem.validateEquipment(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.message });
        }

        const { idEquipment } = req.params;
        const { fkIdUser, name, aliases, brand, description, technicalSpecs, quantity, batchNumber, fkIdLocation } = req.body;
        
        try {
            const oldEquipmentResult = await queryAsync('SELECT quantity FROM equipment WHERE idEquipment = ?', [idEquipment]);
            if (oldEquipmentResult.length === 0) {
                return res.status(404).json({ message: 'Equipamento não encontrado para atualização.' });
            }
            const oldQuantity = oldEquipmentResult[0].quantity;
            const quantityChange = quantity - oldQuantity;
            const actionDescription = quantityChange > 0 ? 'IN' : quantityChange < 0 ? 'OUT' : 'AJUST';
            
            const query = 'UPDATE equipment SET name = ?, aliases = ?, brand = ?, description = ?, technicalSpecs = ?, quantity = ?, batchNumber = ?, fkIdLocation = ? WHERE idEquipment = ?';
            const values = [name, aliases, brand, description, technicalSpecs, quantity, batchNumber, fkIdLocation, idEquipment];
            
            await queryAsync(query, values);
            
            await TransactionController.createTransaction(
                fkIdUser,
                'equipment',
                idEquipment,
                actionDescription,
                quantityChange,
                oldQuantity,
                quantity
            );
            
            res.status(200).json({ message: 'Equipamento atualizado com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async deleteEquipment(req, res) {
        const { idEquipment } = req.params;
        const query = 'DELETE FROM equipment WHERE idEquipment = ?';
        try {
            await queryAsync(query, [idEquipment]);
            res.status(200).json({ message: 'Equipamento deletado com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
