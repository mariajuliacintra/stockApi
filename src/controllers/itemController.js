const { queryAsync } = require('../utils/functions');
const { validateCreateItem, validateUpdateItem } = require('../services/validateItem');

module.exports = class ItemController {
    static async getAllItems(req, res) {
        try {
            const query = "SELECT * FROM item";
            const items = await queryAsync(query);
            res.status(200).json(items);
        } catch (error) {
            console.error("Erro ao buscar itens:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    static async getItemsByCategory(req, res) {
        const { category } = req.params;
        try {
            const query = "SELECT * FROM item WHERE category = ?";
            const items = await queryAsync(query, [category]);
            if (items.length === 0) {
                return res.status(404).json({ message: "Nenhum item encontrado para esta categoria." });
            }
            res.status(200).json(items);
        } catch (error) {
            console.error("Erro ao buscar itens por categoria:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    static async createItem(req, res) {
        const { name, aliases, brand, description, technicalSpecs, quantity, expirationDate, lastMaintenance, batchCode, category, fkIdLocation, fkIdUser } = req.body;

        if (!fkIdUser) {
            return res.status(400).json({ message: "ID do usuário (fkIdUser) é obrigatório." });
        }

        try {
            const validation = await validateCreateItem(req.body);
            if (!validation.isValid) {
                return res.status(400).json({ message: validation.message });
            }

            await queryAsync("START TRANSACTION");

            let newItemId;
            let finalLotNumber;

            if (expirationDate) {
                const existingLotQuery = "SELECT idItem, quantity, lotNumber FROM item WHERE name = ? AND brand = ? AND expirationDate = ? AND fkIdLocation = ?";
                const existingLot = await queryAsync(existingLotQuery, [name, brand, expirationDate, fkIdLocation]);

                if (existingLot.length > 0) {
                    const existingItem = existingLot[0];
                    const newQuantity = parseFloat(existingItem.quantity) + parseFloat(quantity);
                    newItemId = existingItem.idItem;
                    finalLotNumber = existingItem.lotNumber;

                    const updateItemQuery = "UPDATE item SET quantity = ? WHERE idItem = ?";
                    await queryAsync(updateItemQuery, [newQuantity, newItemId]);

                    const insertTransactionQuery = "INSERT INTO transactions (fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity, transactionDate) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
                    await queryAsync(insertTransactionQuery, [fkIdUser, newItemId, 'IN', quantity, existingItem.quantity, newQuantity]);

                    await queryAsync("COMMIT");
                    return res.status(200).json({ message: "Quantidade do lote existente atualizada com sucesso!", itemId: newItemId, lotNumber: finalLotNumber });
                }
            }

            let lotNumber = 1;
            if (expirationDate) {
                const getLotQuery = "SELECT MAX(lotNumber) AS lastLot FROM item WHERE batchCode = ?";
                const lotResult = await queryAsync(getLotQuery, [batchCode]);
                if (lotResult.length > 0 && lotResult[0].lastLot !== null) {
                    lotNumber = lotResult[0].lastLot + 1;
                }
            }
            finalLotNumber = lotNumber;

            const insertItemQuery = "INSERT INTO item (name, aliases, brand, description, technicalSpecs, quantity, expirationDate, lastMaintenance, batchCode, lotNumber, category, fkIdLocation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            const itemValues = [name, aliases, brand, description, technicalSpecs, quantity, expirationDate, lastMaintenance, batchCode, finalLotNumber, category, fkIdLocation];
            const itemResult = await queryAsync(insertItemQuery, itemValues);
            newItemId = itemResult.insertId;

            const insertTransactionQuery = "INSERT INTO transactions (fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity, transactionDate) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
            const transactionValues = [fkIdUser, newItemId, 'IN', quantity, 0, quantity];
            await queryAsync(insertTransactionQuery, transactionValues);

            await queryAsync("COMMIT");

            res.status(201).json({ message: "Item criado com sucesso!", itemId: newItemId, lotNumber: finalLotNumber });
        } catch (error) {
            await queryAsync("ROLLBACK");
            console.error("Erro ao criar item:", error);
            res.status(500).json({ error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateItem(req, res) {
        const { idItem } = req.params;
        const { name, aliases, brand, description, technicalSpecs, quantity, expirationDate, lastMaintenance, batchCode, lotNumber, category, fkIdLocation, fkIdUser, isAjust } = req.body;

        if (!fkIdUser) {
            return res.status(400).json({ message: "ID do usuário (fkIdUser) é obrigatório." });
        }

        try {
            const validation = await validateUpdateItem(req.body, idItem);
            if (!validation.isValid) {
                return res.status(400).json({ message: validation.message });
            }

            await queryAsync("START TRANSACTION");

            const oldItemQuery = "SELECT quantity FROM item WHERE idItem = ?";
            const oldItemResult = await queryAsync(oldItemQuery, [idItem]);

            if (oldItemResult.length === 0) {
                await queryAsync("ROLLBACK");
                return res.status(404).json({ message: "Item não encontrado." });
            }
            const oldQuantity = oldItemResult[0].quantity;

            let newQuantity;
            let quantityChange;
            let actionDescription;

            if (isAjust) {
                newQuantity = parseFloat(quantity);
                quantityChange = newQuantity - oldQuantity;
                actionDescription = 'AJUST';
            } else {
                newQuantity = parseFloat(oldQuantity) + parseFloat(quantity);
                quantityChange = parseFloat(quantity);
                actionDescription = quantityChange > 0 ? 'IN' : 'OUT';
            }
            
            if (newQuantity < 0) {
                await queryAsync("ROLLBACK");
                return res.status(400).json({ message: "A quantidade final não pode ser negativa." });
            }

            const updateItemQuery = "UPDATE item SET name = ?, aliases = ?, brand = ?, description = ?, technicalSpecs = ?, quantity = ?, expirationDate = ?, lastMaintenance = ?, batchCode = ?, lotNumber = ?, category = ?, fkIdLocation = ? WHERE idItem = ?";
            const updateItemValues = [name, aliases, brand, description, technicalSpecs, newQuantity, expirationDate, lastMaintenance, batchCode, lotNumber, category, fkIdLocation, idItem];
            const updateResult = await queryAsync(updateItemQuery, updateItemValues);

            if (updateResult.affectedRows === 0) {
                await queryAsync("ROLLBACK");
                return res.status(404).json({ message: "Item não encontrado." });
            }

            const insertTransactionQuery = "INSERT INTO transactions (fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity, transactionDate) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
            const transactionValues = [fkIdUser, idItem, actionDescription, Math.abs(quantityChange), oldQuantity, newQuantity];
            await queryAsync(insertTransactionQuery, transactionValues);

            await queryAsync("COMMIT");

            res.status(200).json({ message: "Item atualizado com sucesso!" });
        } catch (error) {
            await queryAsync("ROLLBACK");
            console.error("Erro ao atualizar item:", error);
            res.status(500).json({ error: "Erro interno do servidor", details: error.message });
        }
    }

    static async withdrawItem(req, res) {
        const { name, brand, quantityToWithdraw, fkIdUser } = req.body;

        if (!fkIdUser || !quantityToWithdraw || quantityToWithdraw <= 0) {
            return res.status(400).json({ message: "ID do usuário e a quantidade a ser retirada são obrigatórios e devem ser positivos." });
        }

        try {
            await queryAsync("START TRANSACTION");

            const getLotsQuery = "SELECT idItem, quantity FROM item WHERE name = ? AND brand = ? AND quantity > 0 ORDER BY expirationDate ASC, lotNumber ASC";
            const availableLots = await queryAsync(getLotsQuery, [name, brand]);

            if (availableLots.length === 0) {
                await queryAsync("ROLLBACK");
                return res.status(404).json({ message: "Nenhum lote disponível para este item." });
            }

            let remainingToWithdraw = parseFloat(quantityToWithdraw);
            const processedLots = [];

            for (const lot of availableLots) {
                if (remainingToWithdraw <= 0) break;

                const currentLotQuantity = parseFloat(lot.quantity);
                const withdrawnFromLot = Math.min(remainingToWithdraw, currentLotQuantity);
                const newLotQuantity = currentLotQuantity - withdrawnFromLot;

                const updateLotQuery = "UPDATE item SET quantity = ? WHERE idItem = ?";
                await queryAsync(updateLotQuery, [newLotQuantity, lot.idItem]);

                processedLots.push({
                    fkIdItem: lot.idItem,
                    quantityChange: withdrawnFromLot,
                    oldQuantity: currentLotQuantity,
                    newQuantity: newLotQuantity
                });

                remainingToWithdraw -= withdrawnFromLot;
            }

            if (remainingToWithdraw > 0) {
                await queryAsync("ROLLBACK");
                return res.status(400).json({ message: `Quantidade insuficiente em estoque. Faltam ${remainingToWithdraw} unidades.` });
            }

            const insertTransactionQuery = "INSERT INTO transactions (fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity, transactionDate) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
            for (const lot of processedLots) {
                await queryAsync(insertTransactionQuery, [fkIdUser, lot.fkIdItem, 'OUT', lot.quantityChange, lot.oldQuantity, lot.newQuantity]);
            }

            await queryAsync("COMMIT");

            res.status(200).json({ message: "Itens retirados com sucesso!", withdrawnLots: processedLots.length, totalWithdrawn: quantityToWithdraw });
        } catch (error) {
            await queryAsync("ROLLBACK");
            console.error("Erro ao retirar item:", error);
            res.status(500).json({ error: "Erro interno do servidor", details: error.message });
        }
    }

    static async deleteItem(req, res) {
        const { idItem } = req.params;
        try {
            const query = "DELETE FROM item WHERE idItem = ?";
            const result = await queryAsync(query, [idItem]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Item não encontrado." });
            }

            res.status(200).json({ message: "Item excluído com sucesso!" });
        } catch (error) {
            console.error("Erro ao excluir item:", error);
            res.status(500).json({ error: "Erro interno do servidor", details: error.message });
        }
    }
};
