const { queryAsync } = require("../../utils/functions");
const TransactionController = require("../transactionController");
const validateItem = require("../../services/validateItem");

module.exports = class ProductController {
    static async createProduct(req, res) {
        const validationResult = validateItem.validateProduct(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.message });
        }
        const { fkIdUser, name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation } = req.body;
        const query = 'INSERT INTO product (name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation];
        try {
            const result = await queryAsync(query, values);
            const itemId = result.insertId;

            if (quantity > 0) {
                await TransactionController.createTransaction(fkIdUser, 'product', itemId, 'IN', quantity, 0, quantity);
            }

            res.status(201).json({ message: 'Produto criado com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getAllProducts(req, res) {
        const query = 'SELECT * FROM product';
        try {
            const results = await queryAsync(query);
            res.status(200).json(results);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getProductById(req, res) {
        const { idProduct } = req.params;
        const query = 'SELECT * FROM product WHERE idProduct = ?';
        try {
            const results = await queryAsync(query, [idProduct]);
            if (results.length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404).json({ message: 'Produto não encontrado.' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async updateProduct(req, res) {
        const validationResult = validateItem.validateProduct(req.body);
        if (!validationResult.success) {
            return res.status(400).json({ error: validationResult.message });
        }

        const { idProduct } = req.params;
        const { fkIdUser, name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation } = req.body;
        
        try {
            const oldProductResult = await queryAsync('SELECT quantity FROM product WHERE idProduct = ?', [idProduct]);
            if (oldProductResult.length === 0) {
                return res.status(404).json({ message: 'Produto não encontrado para atualização.' });
            }
            const oldQuantity = oldProductResult[0].quantity;
            const quantityChange = quantity - oldQuantity;
            const actionDescription = quantityChange > 0 ? 'IN' : quantityChange < 0 ? 'OUT' : 'AJUST';
            
            const query = 'UPDATE product SET name = ?, aliases = ?, brand = ?, description = ?, technicalSpecs = ?, quantity = ?, expirationDate = ?, batchNumber = ?, fkIdLocation = ? WHERE idProduct = ?';
            const values = [name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation, idProduct];
            
            await queryAsync(query, values);

            await TransactionController.createTransaction(
                fkIdUser,
                'product',
                idProduct,
                actionDescription,
                quantityChange,
                oldQuantity,
                quantity
            );
            
            res.status(200).json({ message: 'Produto atualizado com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async deleteProduct(req, res) {
        const { idProduct } = req.params;
        const query = 'DELETE FROM product WHERE idProduct = ?';
        try {
            await queryAsync(query, [idProduct]);
            res.status(200).json({ message: 'Produto deletado com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
