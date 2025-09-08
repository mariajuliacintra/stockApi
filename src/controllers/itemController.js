const { queryAsync } = require('../utils/functions');
const { validateCreateItem, validateUpdateInformation, validateUpdateQuantity } = require('../services/validateItem');

module.exports = class ItemController {
    static async getAllItems(req, res) {
        try {
            const query = "SELECT * FROM item";
            const items = await queryAsync(query);
            
            const groupedItemsMap = new Map();

            items.forEach(item => {
                const { batchCode, quantity } = item;

                if (!groupedItemsMap.has(batchCode)) {
                    groupedItemsMap.set(batchCode, {
                        batchCode: item.batchCode,
                        name: item.name,
                        aliases: item.aliases,
                        brand: item.brand,
                        description: item.description,
                        technicalSpecs: item.technicalSpecs,
                        category: item.category,
                        totalQuantity: parseFloat(quantity),
                    });
                } else {
                    const group = groupedItemsMap.get(batchCode);
                    group.totalQuantity += parseFloat(quantity);
                }
            });

            const groupedItemsArray = Array.from(groupedItemsMap.values());
            
            res.status(200).json(groupedItemsArray);
        } catch (error) {
            console.error("Erro ao buscar e agrupar itens:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    static async getAllItemsDetails(req, res) {
        try {
            const query = "SELECT * FROM item";
            const items = await queryAsync(query);
            
            const groupedItemsMap = new Map();

            items.forEach(item => {
                const { batchCode, quantity, ...details } = item;

                if (!groupedItemsMap.has(batchCode)) {
                    groupedItemsMap.set(batchCode, {
                        batchCode: batchCode,
                        name: item.name,
                        aliases: item.aliases,
                        brand: item.brand,
                        description: item.description,
                        technicalSpecs: item.technicalSpecs,
                        category: item.category,
                        totalQuantity: 0,
                        lots: []
                    });
                }

                const group = groupedItemsMap.get(batchCode);
                
                group.totalQuantity += parseFloat(quantity);

                group.lots.push({
                    idItem: details.idItem,
                    lotNumber: details.lotNumber,
                    quantity: parseFloat(quantity),
                    expirationDate: details.expirationDate,
                    fkIdLocation: details.fkIdLocation,
                    image: details.image
                });
            });

            const groupedItemsArray = Array.from(groupedItemsMap.values());
            
            res.status(200).json(groupedItemsArray);
        } catch (error) {
            console.error("Erro ao buscar e agrupar itens:", error);
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

            const groupedItemsMap = new Map();
            items.forEach(item => {
                const { batchCode, quantity } = item;
                if (!groupedItemsMap.has(batchCode)) {
                    groupedItemsMap.set(batchCode, {
                        batchCode: item.batchCode,
                        name: item.name,
                        aliases: item.aliases,
                        brand: item.brand,
                        description: item.description,
                        technicalSpecs: item.technicalSpecs,
                        category: item.category,
                        totalQuantity: parseFloat(quantity),
                    });
                } else {
                    const group = groupedItemsMap.get(batchCode);
                    group.totalQuantity += parseFloat(quantity);
                }
            });
            const groupedItemsArray = Array.from(groupedItemsMap.values());
            res.status(200).json(groupedItemsArray);
        } catch (error) {
            console.error("Erro ao buscar e agrupar itens por categoria:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    static async getItemsByCategoryDetails(req, res) {
        const { category } = req.params;
        try {
            const query = "SELECT * FROM item WHERE category = ?";
            const items = await queryAsync(query, [category]);

            if (items.length === 0) {
                return res.status(404).json({ message: "Nenhum item encontrado para esta categoria." });
            }

            const groupedItemsMap = new Map();
            items.forEach(item => {
                const { batchCode, quantity, ...details } = item;
                if (!groupedItemsMap.has(batchCode)) {
                    groupedItemsMap.set(batchCode, {
                        batchCode: batchCode,
                        name: item.name,
                        aliases: item.aliases,
                        brand: item.brand,
                        description: item.description,
                        technicalSpecs: item.technicalSpecs,
                        category: item.category,
                        totalQuantity: 0,
                        lots: []
                    });
                }

                const group = groupedItemsMap.get(batchCode);
                group.totalQuantity += parseFloat(quantity);
                group.lots.push({
                    idItem: details.idItem,
                    lotNumber: details.lotNumber,
                    quantity: parseFloat(quantity),
                    expirationDate: details.expirationDate,
                    fkIdLocation: details.fkIdLocation,
                    image: details.image 
                });
            });

            const groupedItemsArray = Array.from(groupedItemsMap.values());
            res.status(200).json(groupedItemsArray);
        } catch (error) {
            console.error("Erro ao buscar e agrupar itens por categoria com detalhes:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    static async createItem(req, res) {
        const { name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchCode, category, fkIdLocation, fkIdUser, image } = req.body;

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
            if (batchCode) {
                const getLotQuery = "SELECT MAX(lotNumber) AS lastLot FROM item WHERE batchCode = ?";
                const lotResult = await queryAsync(getLotQuery, [batchCode]);
                if (lotResult.length > 0 && lotResult[0].lastLot !== null) {
                    lotNumber = lotResult[0].lastLot + 1;
                }
            }
            finalLotNumber = lotNumber;

            const insertItemQuery = "INSERT INTO item (name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchCode, lotNumber, category, fkIdLocation, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            const itemValues = [name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchCode, finalLotNumber, category, fkIdLocation, image];
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
    
    static async updateItemInformation(req, res) {
        const { idItem, batchCode } = req.params;
        const data = req.body;

        if (!idItem && !batchCode) {
            return res.status(400).json({ message: "É necessário fornecer idItem ou batchCode para atualizar o item." });
        }

        try {
            const validation = await validateUpdateInformation(data);
            if (!validation.isValid) {
                return res.status(400).json({ message: validation.message });
            }

            await queryAsync("START TRANSACTION");

            const fieldsToUpdate = Object.keys(data);
            if (fieldsToUpdate.length === 0) {
                await queryAsync("ROLLBACK");
                return res.status(400).json({ message: "Nenhum campo para atualização foi fornecido." });
            }

            let updateQuery = "UPDATE item SET ";
            let updateValues = [];

            fieldsToUpdate.forEach(key => {
                updateQuery += `${key} = ?, `;
                updateValues.push(data[key]);
            });

            updateQuery = updateQuery.slice(0, -2);

            let whereClause = "";
            let whereValue;
            if (idItem) {
                whereClause = " WHERE idItem = ?";
                whereValue = idItem;
            } else {
                whereClause = " WHERE batchCode = ?";
                whereValue = batchCode;
            }

            updateQuery += whereClause;
            updateValues.push(whereValue);

            const updateResult = await queryAsync(updateQuery, updateValues);

            if (updateResult.affectedRows === 0) {
                await queryAsync("ROLLBACK");
                return res.status(404).json({ message: "Item não encontrado." });
            }

            await queryAsync("COMMIT");
            res.status(200).json({ message: "Informações do item atualizadas com sucesso!" });
        } catch (error) {
            await queryAsync("ROLLBACK");
            console.error("Erro ao atualizar informações do item:", error);
            res.status(500).json({ error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateItemQuantity(req, res) {
        const { idItem, batchCode } = req.params;
        const { quantity, isAjust, fkIdUser } = req.body;

        if (!idItem && !batchCode) {
            return res.status(400).json({ message: "É necessário fornecer idItem ou batchCode para atualizar o item." });
        }

        try {
            const validation = await validateUpdateQuantity(req.body);
            if (!validation.isValid) {
                return res.status(400).json({ message: validation.message });
            }

            await queryAsync("START TRANSACTION");

            let getItemQuery = "SELECT idItem, quantity FROM item";
            let whereClause = "";
            let whereValue;
            if (idItem) {
                whereClause = " WHERE idItem = ?";
                whereValue = idItem;
            } else {
                whereClause = " WHERE batchCode = ?";
                whereValue = batchCode;
            }

            getItemQuery += whereClause;
            const itemResult = await queryAsync(getItemQuery, [whereValue]);

            if (itemResult.length === 0) {
                await queryAsync("ROLLBACK");
                return res.status(404).json({ message: "Item não encontrado." });
            }

            const itemToUpdate = itemResult[0];
            const oldQuantity = parseFloat(itemToUpdate.quantity);
            const itemIdToUpdate = itemToUpdate.idItem;

            let newQuantity;
            let quantityChange;
            let actionDescription;

            if (isAjust) {
                newQuantity = parseFloat(quantity);
                quantityChange = newQuantity - oldQuantity;
                actionDescription = 'AJUST';
            } else {
                newQuantity = oldQuantity + parseFloat(quantity);
                quantityChange = parseFloat(quantity);
                actionDescription = quantityChange > 0 ? 'IN' : 'OUT';
            }

            if (newQuantity < 0) {
                await queryAsync("ROLLBACK");
                return res.status(400).json({ message: "A quantidade final não pode ser negativa." });
            }

            const updateItemQuery = "UPDATE item SET quantity = ? WHERE idItem = ?";
            const updateResult = await queryAsync(updateItemQuery, [newQuantity, itemIdToUpdate]);

            if (updateResult.affectedRows === 0) {
                await queryAsync("ROLLBACK");
                return res.status(404).json({ message: "Falha ao atualizar a quantidade do item." });
            }

            const insertTransactionQuery = "INSERT INTO transactions (fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity, transactionDate) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
            const transactionValues = [fkIdUser, itemIdToUpdate, actionDescription, Math.abs(quantityChange), oldQuantity, newQuantity];
            await queryAsync(insertTransactionQuery, transactionValues);

            await queryAsync("COMMIT");

            res.status(200).json({ message: "Quantidade do item atualizada com sucesso!" });
        } catch (error) {
            await queryAsync("ROLLBACK");
            console.error("Erro ao atualizar a quantidade do item:", error);
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
