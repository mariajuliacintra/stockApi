const { queryAsync, handleResponse } = require('../utils/functions');
const validateItem = require('../services/validateItem');

module.exports = class ItemController {
    static async checkItemBySapCode(req, res) {
        const { sapCode } = req.params;
        if (isNaN(Number(sapCode))) {
            return handleResponse(res, 400, { message: "O código SAP deve ser um valor numérico." });
        }
        try {
            const query = "SELECT sapCode FROM item WHERE sapCode = ?";
            const item = await queryAsync(query, [sapCode]);
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
                    i.idItem, i.name, i.aliases, i.brand, i.description, i.technicalSpecs, i.category, i.fkIdImage, i.sapCode,
                    SUM(l.quantity) as totalQuantity
                FROM item i
                LEFT JOIN lots l ON i.idItem = l.fkIdItem
                GROUP BY i.idItem
            `;
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
                    i.idItem, i.name, i.aliases, i.brand, i.description, i.technicalSpecs, i.category, i.fkIdImage, i.sapCode,
                    img.imageData,
                    SUM(l.quantity) as totalQuantity,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'idLot', l.idLot,
                            'quantity', l.quantity,
                            'expirationDate', l.expirationDate,
                            'lotNumber', l.lotNumber,
                            'location', JSON_OBJECT('place', loc.place, 'code', loc.code)
                        )
                    ) AS lots
                FROM item i
                LEFT JOIN lots l ON i.idItem = l.fkIdItem
                LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation
                LEFT JOIN image img ON i.fkIdImage = img.idImage
                GROUP BY i.idItem
                ORDER BY i.name
            `;
            const items = await queryAsync(query);
            const cleanItems = items.map(item => {
                const lots = (item.lots && item.lots.length > 0 && item.lots[0].idLot) ? item.lots : [];
                return {
                    ...item,
                    lots: lots,
                    totalQuantity: item.totalQuantity || 0
                };
            });
            return handleResponse(res, 200, cleanItems);
        } catch (error) {
            console.error("Erro ao buscar itens com detalhes:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async getItemsByCategory(req, res) {
        const { category } = req.params;
        try {
            const query = `
                SELECT 
                    i.idItem, i.name, i.aliases, i.brand, i.description, i.technicalSpecs, i.category, i.fkIdImage, i.sapCode,
                    SUM(l.quantity) as totalQuantity
                FROM item i
                LEFT JOIN lots l ON i.idItem = l.fkIdItem
                WHERE i.category = ?
                GROUP BY i.idItem
            `;
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
                    i.idItem, i.name, i.aliases, i.brand, i.description, i.technicalSpecs, i.category, i.fkIdImage, i.sapCode,
                    img.imageData,
                    SUM(l.quantity) as totalQuantity,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'idLot', l.idLot,
                            'quantity', l.quantity,
                            'expirationDate', l.expirationDate,
                            'lotNumber', l.lotNumber,
                            'location', JSON_OBJECT('place', loc.place, 'code', loc.code)
                        )
                    ) AS lots
                FROM item i
                LEFT JOIN lots l ON i.idItem = l.fkIdItem
                LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation
                LEFT JOIN image img ON i.fkIdImage = img.idImage
                WHERE i.category = ?
                GROUP BY i.idItem
                ORDER BY i.name
            `;
            const items = await queryAsync(query, [category]);
            if (items.length === 0) {
                return handleResponse(res, 404, { message: "Nenhum item encontrado para esta categoria." });
            }
            const cleanItems = items.map(item => {
                const lots = (item.lots && item.lots.length > 0 && item.lots[0].idLot) ? item.lots : [];
                return {
                    ...item,
                    lots: lots,
                    totalQuantity: item.totalQuantity || 0
                };
            });
            return handleResponse(res, 200, cleanItems);
        } catch (error) {
            console.error("Erro ao buscar itens por categoria com detalhes:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async createItem(req, res) {
        const validationResult = await validateItem.validateCreateItem(req.body);
        if (!validationResult || !validationResult.isValid) {
            const errorMessage = validationResult ? validationResult.message : "Erro desconhecido na validação.";
            return handleResponse(res, 400, { message: errorMessage });
        }
        const {
            sapCode,
            name,
            aliases,
            imageData,
            quantity,
            expirationDate,
            fkIdLocation,
            fkIdUser,
            ...itemData
        } = req.body;
        try {
            await queryAsync("START TRANSACTION");
            const existingItemQuery = "SELECT idItem, name FROM item WHERE sapCode = ?";
            const [existingItemResult] = await queryAsync(existingItemQuery, [sapCode]);
            if (existingItemResult) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 409, { 
                    message: `Item com sapCode '${sapCode}' já existe. Para adicionar um novo lote, use o endpoint apropriado.`,
                    existingItemId: existingItemResult.idItem,
                    existingItemName: existingItemResult.name
                });
            }
            let fkIdImage = null;
            if (imageData) {
                const imageResult = await queryAsync("INSERT INTO image (imageData) VALUES (?)", [imageData]);
                fkIdImage = imageResult.insertId;
            }
            const insertItemQuery = `
                INSERT INTO item (sapCode, name, aliases, brand, description, technicalSpecs, category, fkIdImage)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const itemValues = [sapCode, name, aliases, itemData.brand, itemData.description, itemData.technicalSpecs, itemData.category, fkIdImage];
            const itemResult = await queryAsync(insertItemQuery, itemValues);
            const fkIdItem = itemResult.insertId;
            const getLotNumberQuery = `
                SELECT COALESCE(MAX(lotNumber), 0) + 1 AS newLotNumber
                FROM lots
                WHERE fkIdItem = ?
            `;
            const [lotResult] = await queryAsync(getLotNumberQuery, [fkIdItem]);
            const lotNumber = lotResult.newLotNumber;
            const insertLotQuery = `
                INSERT INTO lots (lotNumber, quantity, expirationDate, fkIdLocation, fkIdItem)
                VALUES (?, ?, ?, ?, ?)
            `;
            const lotValues = [lotNumber, quantity, expirationDate, fkIdLocation, fkIdItem];
            const newLotResult = await queryAsync(insertLotQuery, lotValues);
            const newLotId = newLotResult.insertId;
            const insertTransactionQuery = `
                INSERT INTO transactions (fkIdUser, fkIdLot, actionDescription, quantityChange, oldQuantity, newQuantity)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const transactionValues = [fkIdUser, newLotId, 'IN', quantity, 0, quantity];
            await queryAsync(insertTransactionQuery, transactionValues);
            await queryAsync("COMMIT");
            return handleResponse(res, 201, { message: "Item e lote criados com sucesso!", itemId: fkIdItem, sapCode: sapCode, lotNumber: lotNumber, lotId: newLotId });
        } catch (error) {
            console.error("Erro ao criar item:", error);
            await queryAsync("ROLLBACK");
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateItemInformation(req, res) {
        const { idItem } = req.params;
        const validationResult = validateItem.validateUpdateInformation(req.body);
        if (!validationResult || !validationResult.isValid) {
            const errorMessage = validationResult ? validationResult.message : "Erro desconhecido na validação.";
            return handleResponse(res, 400, { message: errorMessage });
        }
        const { imageData, ...data } = req.body;
        const { sapCode: newSapCode, ...itemData } = data;
        try {
            await queryAsync("START TRANSACTION");
            const findItemQuery = "SELECT sapCode, fkIdImage FROM item WHERE idItem = ?";
            const [existingItem] = await queryAsync(findItemQuery, [idItem]);
            if (!existingItem) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 404, { message: "Item não encontrado." });
            }
            if (newSapCode && newSapCode !== existingItem.sapCode) {
                const checkSapCodeQuery = "SELECT idItem FROM item WHERE sapCode = ?";
                const [itemWithNewSapCode] = await queryAsync(checkSapCodeQuery, [newSapCode]);
                if (itemWithNewSapCode) {
                    await queryAsync("ROLLBACK");
                    return handleResponse(res, 409, { message: "Novo sapCode já está em uso por outro item." });
                }
            }
            let updatedFkIdImage = existingItem.fkIdImage;
            if (imageData !== undefined) {
                if (existingItem.fkIdImage) {
                    if (imageData === null) {
                        await queryAsync("DELETE FROM image WHERE idImage = ?", [existingItem.fkIdImage]);
                        updatedFkIdImage = null;
                    } else {
                        await queryAsync("UPDATE image SET imageData = ? WHERE idImage = ?", [imageData, existingItem.fkIdImage]);
                    }
                } else if (imageData !== null) {
                    const imageResult = await queryAsync("INSERT INTO image (imageData) VALUES (?)", [imageData]);
                    updatedFkIdImage = imageResult.insertId;
                }
            }
            const fieldsToUpdate = Object.keys(itemData);
            if (newSapCode !== undefined) {
                fieldsToUpdate.push('sapCode');
                itemData.sapCode = newSapCode;
            }
            if (imageData !== undefined) {
                fieldsToUpdate.push('fkIdImage');
                itemData.fkIdImage = updatedFkIdImage;
            }
            if (fieldsToUpdate.length === 0) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 400, { message: "Nenhum campo para atualização de informações do item foi fornecido." });
            }
            const updateQueryParts = fieldsToUpdate.map(key => `${key} = ?`);
            const updateQuery = `UPDATE item SET ${updateQueryParts.join(', ')} WHERE idItem = ?`;
            const updateValues = fieldsToUpdate.map(key => itemData[key]);
            updateValues.push(idItem);
            const updateResult = await queryAsync(updateQuery, updateValues);
            if (updateResult.affectedRows === 0) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 404, { message: "Item não encontrado." });
            }
            await queryAsync("COMMIT");
            return handleResponse(res, 200, { message: "Informações do item atualizadas com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar informações do item:", error);
            await queryAsync("ROLLBACK");
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
            await queryAsync("DELETE FROM transactions WHERE fkIdLot IN (SELECT idLot FROM lots WHERE fkIdItem = ?)", [idItem]);
            await queryAsync("DELETE FROM lots WHERE fkIdItem = ?", [idItem]);
            await queryAsync("DELETE FROM item WHERE idItem = ?", [idItem]);
            if (item.fkIdImage) {
                await queryAsync("DELETE FROM image WHERE idImage = ?", [item.fkIdImage]);
            }
            await queryAsync("COMMIT");
            return handleResponse(res, 200, { message: "Item e dados associados (lotes, transações e imagem) excluídos com sucesso!" });
        } catch (error) {
            console.error("Erro ao excluir item:", error);
            await queryAsync("ROLLBACK");
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }
};