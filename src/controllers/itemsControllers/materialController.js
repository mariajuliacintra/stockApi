const { queryAsync } = require("../../utils/functions");
const TransactionController = require("../transactionController");
const validateItem = require("../../services/validateItem");

module.exports = class MaterialController {
    static async createMaterial(req, res) {
        const validationResult = validateItem.validateMaterial(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.message });
        }
        const { fkIdUser, name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation } = req.body;
        const query = 'INSERT INTO material (name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation];
        try {
            const result = await queryAsync(query, values);
            const itemId = result.insertId;

            if (quantity > 0) {
                await TransactionController.createTransaction(fkIdUser, 'material', itemId, 'IN', quantity, 0, quantity);
            }
            
            res.status(201).json({ message: 'Material criado com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getAllMaterials(req, res) {
        const query = 'SELECT * FROM material';
        try {
            const results = await queryAsync(query);
            res.status(200).json(results);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getMaterialById(req, res) {
        const { idMaterial } = req.params;
        const query = 'SELECT * FROM material WHERE idMaterial = ?';
        try {
            const results = await queryAsync(query, [idMaterial]);
            if (results.length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404).json({ message: 'Material não encontrado.' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async updateMaterial(req, res) {
        const validationResult = validateItem.validateMaterial(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.message });
        }

        const { idMaterial } = req.params;
        const { fkIdUser, name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation } = req.body;
        
        try {
            const oldMaterialResult = await queryAsync('SELECT quantity FROM material WHERE idMaterial = ?', [idMaterial]);
            if (oldMaterialResult.length === 0) {
                return res.status(404).json({ message: 'Material não encontrado para atualização.' });
            }
            const oldQuantity = oldMaterialResult[0].quantity;
            const quantityChange = quantity - oldQuantity;
            const actionDescription = quantityChange > 0 ? 'IN' : quantityChange < 0 ? 'OUT' : 'AJUST';
            
            const query = 'UPDATE material SET name = ?, aliases = ?, brand = ?, description = ?, technicalSpecs = ?, quantity = ?, expirationDate = ?, batchNumber = ?, fkIdLocation = ? WHERE idMaterial = ?';
            const values = [name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation, idMaterial];
            
            await queryAsync(query, values);

            await TransactionController.createTransaction(
                fkIdUser,
                'material',
                idMaterial,
                actionDescription,
                quantityChange,
                oldQuantity,
                quantity
            );
            
            res.status(200).json({ message: 'Material atualizado com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async deleteMaterial(req, res) {
        const { idMaterial } = req.params;
        const query = 'DELETE FROM material WHERE idMaterial = ?';
        try {
            await queryAsync(query, [idMaterial]);
            res.status(200).json({ message: 'Material deletado com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
