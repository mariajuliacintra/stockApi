const { queryAsync, handleResponse } = require('../utils/functions');
const { validateCreateItem, validateUpdateInformation, validateUpdateQuantity } = require('../services/validateItem');

module.exports = class ItemController {
    static async checkItemByBatchCode(req, res) {
        const { batchCode } = req.params;
        try {
            const query = "SELECT batchCode FROM item WHERE batchCode = ?";
            const item = await queryAsync(query, [batchCode]);
            
            if (item.length > 0) {
                return handleResponse(res, 200, { exists: true, message: "Item encontrado." });
            } else {
                return handleResponse(res, 404, { exists: false, message: "Item não encontrado." });
            }
        } catch (error) {
            console.error("Erro ao verificar item:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor" });
        }
    }

    static async getAllItems(req, res) {
        try {
            const query = `
                SELECT 
                    name, aliases, brand, description, technicalSpecs, category, batchCode,
                    SUM(quantity) as totalQuantity
                FROM item
                GROUP BY name, aliases, brand, description, technicalSpecs, category, batchCode`;
            
            const items = await queryAsync(query);
            
            return handleResponse(res, 200, items);
        } catch (error) {
            console.error("Erro ao buscar e agrupar itens:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor" });
        }
    }

    static async getAllItemsDetails(req, res) {
        try {
            const query = `
                SELECT 
                    i.idItem, i.name, i.aliases, i.brand, i.description, i.technicalSpecs, i.batchCode, i.lotNumber, 
                    i.quantity, i.expirationDate, i.category, i.fkIdLocation, i.fkIdImage, img.imageData
                FROM item i
                LEFT JOIN image img ON i.fkIdImage = img.idImage
                ORDER BY i.batchCode, i.lotNumber`;

            const items = await queryAsync(query);
            const groupedItemsMap = new Map();

            items.forEach(item => {
                const { batchCode, quantity, fkIdImage, imageData, ...details } = item;
                if (!groupedItemsMap.has(batchCode)) {
                    groupedItemsMap.set(batchCode, {
                        batchCode: batchCode,
                        name: item.name,
                        aliases: item.aliases,
                        brand: item.brand,
                        description: item.description,
                        technicalSpecs: item.technicalSpecs,
                        category: item.category,
                        fkIdImage: fkIdImage,
                        imageData: imageData,
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
                });
            });

            const groupedItemsArray = Array.from(groupedItemsMap.values());
            return handleResponse(res, 200, groupedItemsArray);
        } catch (error) {
            console.error("Erro ao buscar e agrupar itens:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor" });
        }
    }

    static async getItemsByCategory(req, res) {
        const { category } = req.params;
        try {
            const query = `
                SELECT 
                    name, aliases, brand, description, technicalSpecs, category, batchCode,
                    SUM(quantity) as totalQuantity
                FROM item
                WHERE category = ?
                GROUP BY name, aliases, brand, description, technicalSpecs, category, batchCode`;

            const items = await queryAsync(query, [category]);
            
            if (items.length === 0) {
                return handleResponse(res, 404, { message: "Nenhum item encontrado para esta categoria." });
            }
            
            return handleResponse(res, 200, items);
        } catch (error) {
            console.error("Erro ao buscar e agrupar itens por categoria:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor" });
        }
    }

    static async getItemsByCategoryDetails(req, res) {
        const { category } = req.params;
        try {
            const query = `
                SELECT 
                    i.idItem, i.name, i.aliases, i.brand, i.description, i.technicalSpecs, i.batchCode, i.lotNumber, 
                    i.quantity, i.expirationDate, i.category, i.fkIdLocation, i.fkIdImage, img.imageData
                FROM item i
                LEFT JOIN image img ON i.fkIdImage = img.idImage
                WHERE i.category = ?
                ORDER BY i.batchCode, i.lotNumber`;
            
            const items = await queryAsync(query, [category]);
            
            if (items.length === 0) {
                return handleResponse(res, 404, { message: "Nenhum item encontrado para esta categoria." });
            }

            const groupedItemsMap = new Map();
            items.forEach(item => {
                const { batchCode, quantity, fkIdImage, imageData, ...details } = item;
                if (!groupedItemsMap.has(batchCode)) {
                    groupedItemsMap.set(batchCode, {
                        batchCode: batchCode,
                        name: item.name,
                        aliases: item.aliases,
                        brand: item.brand,
                        description: item.description,
                        technicalSpecs: item.technicalSpecs,
                        category: item.category,
                        fkIdImage: fkIdImage,
                        imageData: imageData,
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
                });
            });

            const groupedItemsArray = Array.from(groupedItemsMap.values());
            return handleResponse(res, 200, groupedItemsArray);
        } catch (error) {
            console.error("Erro ao buscar e agrupar itens por categoria com detalhes:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor" });
        }
    }

    static async createItem(req, res) {
        const { name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchCode, category, fkIdLocation, fkIdUser, imageData } = req.body;
        
        if (!fkIdUser) {
            return handleResponse(res, 400, { message: "ID do usuário (fkIdUser) é obrigatório." });
        }

        try {
            const validation = await validateCreateItem(req.body);
            if (!validation.isValid) {
                return handleResponse(res, 400, { message: validation.message });
            }

            await queryAsync("START TRANSACTION");

            let fkIdImage = null;
            if (imageData) {
                const imageResult = await queryAsync("INSERT INTO image (imageData) VALUES (?)", [imageData]);
                fkIdImage = imageResult.insertId;
            }

            let newItemId;
            let finalLotNumber;

            // Verificação de lote existente com a mesma data de validade
            if (expirationDate) {
                const existingLotQuery = "SELECT idItem, quantity, lotNumber FROM item WHERE name = ? AND brand = ? AND expirationDate = ? AND fkIdLocation = ?";
                const existingLot = await queryAsync(existingLotQuery, [name, brand, expirationDate, fkIdLocation]);

                if (existingLot.length > 0) {
                    const existingItem = existingLot[0];
                    const newQuantity = parseFloat(existingItem.quantity) + parseFloat(quantity);
                    newItemId = existingItem.idItem;
                    finalLotNumber = existingItem.lotNumber;
                    
                    const updateItemQuery = "UPDATE item SET quantity = ?, fkIdImage = ? WHERE idItem = ?";
                    await queryAsync(updateItemQuery, [newQuantity, fkIdImage, newItemId]);
                    
                    const insertTransactionQuery = "INSERT INTO transactions (fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity) VALUES (?, ?, ?, ?, ?, ?)";
                    await queryAsync(insertTransactionQuery, [fkIdUser, newItemId, 'IN', quantity, existingItem.quantity, newQuantity]);

                    await queryAsync("COMMIT");
                    return handleResponse(res, 200, { message: "Quantidade do lote existente atualizada com sucesso!", itemId: newItemId, lotNumber: finalLotNumber });
                }
            }

            // Lógica para determinar o próximo lotNumber
            let lotNumber = 1;
            if (batchCode) {
                const getLotQuery = "SELECT MAX(lotNumber) AS lastLot FROM item WHERE batchCode = ?";
                const lotResult = await queryAsync(getLotQuery, [batchCode]);
                if (lotResult.length > 0 && lotResult[0].lastLot !== null) {
                    lotNumber = lotResult[0].lastLot + 1;
                }
            }
            finalLotNumber = lotNumber;

            // Inserção de um novo item
            const insertItemQuery = "INSERT INTO item (name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchCode, lotNumber, category, fkIdLocation, fkIdImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            const itemValues = [name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchCode, finalLotNumber, category, fkIdLocation, fkIdImage];
            const itemResult = await queryAsync(insertItemQuery, itemValues);
            newItemId = itemResult.insertId;

            // Inserção da transação
            const insertTransactionQuery = "INSERT INTO transactions (fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity) VALUES (?, ?, ?, ?, ?, ?)";
            const transactionValues = [fkIdUser, newItemId, 'IN', quantity, 0, quantity];
            await queryAsync(insertTransactionQuery, transactionValues);

            await queryAsync("COMMIT");

            return handleResponse(res, 201, { message: "Item criado com sucesso!", itemId: newItemId, lotNumber: finalLotNumber });
        } catch (error) {
            await queryAsync("ROLLBACK");
            console.error("Erro ao criar item:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async createLot(req, res) {
        const { batchCode } = req.params;
        const { quantity, expirationDate, fkIdLocation, fkIdUser } = req.body;

        if (!fkIdUser) {
            return handleResponse(res, 400, { message: "ID do usuário (fkIdUser) é obrigatório." });
        }

        try {
            await queryAsync("START TRANSACTION");

            // 1. Encontrar o item base pelo batchCode
            const baseItemQuery = "SELECT name, aliases, brand, description, technicalSpecs, category, fkIdImage FROM item WHERE batchCode = ? LIMIT 1";
            const [baseItem] = await queryAsync(baseItemQuery, [batchCode]);

            if (!baseItem) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 404, { message: "BatchCode não encontrado. Não é possível criar um novo lote." });
            }

            // 2. Determinar o próximo lotNumber
            const getLotQuery = "SELECT MAX(lotNumber) AS lastLot FROM item WHERE batchCode = ?";
            const lotResult = await queryAsync(getLotQuery, [batchCode]);
            const nextLotNumber = (lotResult.length > 0 && lotResult[0].lastLot !== null) ? lotResult[0].lastLot + 1 : 1;

            // 3. Inserir o novo lote usando os dados do item base e os novos dados
            const insertLotQuery = "INSERT INTO item (name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchCode, lotNumber, category, fkIdLocation, fkIdImage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            const lotValues = [
                baseItem.name,
                baseItem.aliases,
                baseItem.brand,
                baseItem.description,
                baseItem.technicalSpecs,
                quantity,
                expirationDate,
                batchCode,
                nextLotNumber,
                baseItem.category,
                fkIdLocation,
                baseItem.fkIdImage,
            ];
            const lotResultInsert = await queryAsync(insertLotQuery, lotValues);
            const newLotId = lotResultInsert.insertId;

            // 4. Inserir a transação
            const insertTransactionQuery = "INSERT INTO transactions (fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity) VALUES (?, ?, ?, ?, ?, ?)";
            const transactionValues = [fkIdUser, newLotId, 'IN', quantity, 0, quantity];
            await queryAsync(insertTransactionQuery, transactionValues);

            await queryAsync("COMMIT");

            return handleResponse(res, 201, { message: "Novo lote criado com sucesso!", lotId: newLotId, lotNumber: nextLotNumber });
        } catch (error) {
            await queryAsync("ROLLBACK");
            console.error("Erro ao criar novo lote:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }
    
    static async updateItemInformation(req, res) {
        const { idItem, batchCode } = req.params;
        const { imageData, ...data } = req.body;
    
        if (!idItem && !batchCode) {
            return handleResponse(res, 400, { message: "É necessário fornecer idItem ou batchCode para atualizar o item." });
        }
    
        try {
            const validation = await validateUpdateInformation(data);
            if (!validation.isValid) {
                return handleResponse(res, 400, { message: validation.message });
            }
    
            await queryAsync("START TRANSACTION");
    
            let updateData = { ...data };
            if (imageData) {
                const itemQuery = idItem ? "SELECT fkIdImage FROM item WHERE idItem = ?" : "SELECT fkIdImage FROM item WHERE batchCode = ?";
                const [item] = await queryAsync(itemQuery, [idItem || batchCode]);
                
                if (item && item.fkIdImage) {
                    await queryAsync("UPDATE image SET imageData = ? WHERE idImage = ?", [imageData, item.fkIdImage]);
                } else {
                    const imageResult = await queryAsync("INSERT INTO image (imageData) VALUES (?)", [imageData]);
                    updateData.fkIdImage = imageResult.insertId;
                }
            }
    
            const fieldsToUpdate = Object.keys(updateData);
            if (fieldsToUpdate.length === 0) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 400, { message: "Nenhum campo para atualização foi fornecido." });
            }
    
            let updateQuery = "UPDATE item SET ";
            const updateValues = [];
    
            fieldsToUpdate.forEach(key => {
                updateQuery += `${key} = ?, `;
                updateValues.push(updateData[key]);
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
                return handleResponse(res, 404, { message: "Item não encontrado." });
            }
    
            await queryAsync("COMMIT");
            return handleResponse(res, 200, { message: "Informações do item atualizadas com sucesso!" });
        } catch (error) {
            await queryAsync("ROLLBACK");
            console.error("Erro ao atualizar informações do item:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateItemQuantity(req, res) {
        const { idItem, batchCode } = req.params;
        const { quantity, isAjust, fkIdUser } = req.body;

        if (!idItem && !batchCode) {
            return handleResponse(res, 400, { message: "É necessário fornecer idItem ou batchCode para atualizar o item." });
        }

        try {
            const validation = await validateUpdateQuantity(req.body);
            if (!validation.isValid) {
                return handleResponse(res, 400, { message: validation.message });
            }

            await queryAsync("START TRANSACTION");

            const getItemQuery = `
                SELECT idItem, SUM(quantity) as totalQuantity FROM item 
                WHERE ${idItem ? 'idItem' : 'batchCode'} = ?
                GROUP BY idItem`;
            const itemResult = await queryAsync(getItemQuery, [idItem || batchCode]);

            if (itemResult.length === 0) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 404, { message: "Item não encontrado." });
            }

            const itemToUpdate = itemResult[0];
            const oldQuantity = parseFloat(itemToUpdate.totalQuantity);
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
                return handleResponse(res, 400, { message: "A quantidade final não pode ser negativa." });
            }

            const updateItemQuery = "UPDATE item SET quantity = ? WHERE idItem = ?";
            const updateResult = await queryAsync(updateItemQuery, [newQuantity, itemIdToUpdate]);

            if (updateResult.affectedRows === 0) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 404, { message: "Falha ao atualizar a quantidade do item." });
            }

            const insertTransactionQuery = "INSERT INTO transactions (fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity) VALUES (?, ?, ?, ?, ?, ?)";
            const transactionValues = [fkIdUser, itemIdToUpdate, actionDescription, Math.abs(quantityChange), oldQuantity, newQuantity];
            await queryAsync(insertTransactionQuery, transactionValues);

            await queryAsync("COMMIT");

            return handleResponse(res, 200, { message: "Quantidade do item atualizada com sucesso!" });
        } catch (error) {
            await queryAsync("ROLLBACK");
            console.error("Erro ao atualizar a quantidade do item:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async deleteItem(req, res) {
        const { idItem } = req.params;
        try {
            await queryAsync("START TRANSACTION");

            const getItemQuery = "SELECT fkIdImage FROM item WHERE idItem = ?";
            const [item] = await queryAsync(getItemQuery, [idItem]);

            if (!item) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 404, { message: "Item não encontrado." });
            }

            const deleteItemQuery = "DELETE FROM item WHERE idItem = ?";
            await queryAsync(deleteItemQuery, [idItem]);

            if (item.fkIdImage) {
                await queryAsync("DELETE FROM image WHERE idImage = ?", [item.fkIdImage]);
            }
            
            await queryAsync("COMMIT");

            return handleResponse(res, 200, { message: "Item e imagem associada excluídos com sucesso!" });
        } catch (error) {
            await queryAsync("ROLLBACK");
            console.error("Erro ao excluir item:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }
}