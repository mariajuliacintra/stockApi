const { queryAsync, handleResponse } = require('../utils/functions');
const validateItem = require('../services/validateItem');
const fs = require('fs').promises;

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

    static async getItemByIdDetails(req, res) {
        const { idItem } = req.params;

        if (isNaN(Number(idItem))) {
            return handleResponse(res, 400, { message: "O ID do item deve ser um valor numérico." });
        }

        try {
            const query = `
                SELECT
                    i.idItem, i.name, i.aliases, i.brand, i.description, i.technicalSpecs, i.minimumStock,
                    JSON_OBJECT('idCategory', c.idCategory, 'value', c.categoryValue) AS category,
                    i.sapCode, i.fkIdImage,
                    img.imageData, img.imageType,
                    SUM(l.quantity) AS totalQuantity,
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
                JOIN category c ON i.fkIdCategory = c.idCategory
                LEFT JOIN lots l ON i.idItem = l.fkIdItem
                LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation
                LEFT JOIN image img ON i.fkIdImage = img.idImage
                WHERE i.idItem = ?
                GROUP BY i.idItem
                ORDER BY i.name
            `;
            const items = await queryAsync(query, [idItem]);

            if (items.length === 0) {
                return handleResponse(res, 404, { message: "Item não encontrado." });
            }

            const item = items[0];

            const technicalSpecIds = new Set();
            if (item.technicalSpecs) {
                for (const id in item.technicalSpecs) {
                    technicalSpecIds.add(id);
                }
            }

            const idsArray = Array.from(technicalSpecIds);
            const placeholders = idsArray.length > 0 ? idsArray.map(() => '?').join(',') : 'NULL';
            const technicalSpecQuery = `SELECT idTechnicalSpec, technicalSpecKey FROM technicalSpec WHERE idTechnicalSpec IN (${placeholders})`;
            
            const technicalSpecsMap = {};
            if (idsArray.length > 0) {
                const specs = await queryAsync(technicalSpecQuery, idsArray);
                specs.forEach(spec => {
                    technicalSpecsMap[spec.idTechnicalSpec] = spec.technicalSpecKey;
                });
            }

            const lots = (item.lots && item.lots.length > 0 && item.lots[0].idLot) ? item.lots : [];
            const image = (item.imageData && item.imageType) ? {
                type: item.imageType,
                data: item.imageData.toString('base64')
            } : null;

            const technicalSpecsFormatted = [];
            if (item.technicalSpecs) {
                for (const id in item.technicalSpecs) {
                    technicalSpecsFormatted.push({
                        idTechnicalSpec: parseInt(id, 10),
                        technicalSpecKey: technicalSpecsMap[id] || 'Desconhecido',
                        technicalSpecValue: item.technicalSpecs[id]
                    });
                }
            }

            const finalItem = {
                ...item,
                lots,
                totalQuantity: item.totalQuantity || 0,
                image,
                technicalSpecs: technicalSpecsFormatted
            };
            delete finalItem.imageData;
            delete finalItem.imageType;
            
            return handleResponse(res, 200, finalItem);

        } catch (error) {
            console.error("Erro ao buscar item por ID com detalhes:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async getAllItems(req, res) {
        try {
            const query = `
                SELECT
                    i.idItem, i.name, i.aliases, i.brand, i.description, i.technicalSpecs, i.minimumStock,
                    JSON_OBJECT('idCategory', c.idCategory, 'value', c.categoryValue) AS category,
                    i.sapCode,
                    SUM(l.quantity) as totalQuantity
                FROM item i
                JOIN category c ON i.fkIdCategory = c.idCategory
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
                    i.idItem, i.name, i.aliases, i.brand, i.description, i.technicalSpecs, i.minimumStock,
                    JSON_OBJECT('idCategory', c.idCategory, 'value', c.categoryValue) AS category,
                    i.sapCode, i.fkIdImage,
                    img.imageData, img.imageType,
                    SUM(l.quantity) AS totalQuantity,
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
                JOIN category c ON i.fkIdCategory = c.idCategory
                LEFT JOIN lots l ON i.idItem = l.fkIdItem
                LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation
                LEFT JOIN image img ON i.fkIdImage = img.idImage
                GROUP BY i.idItem
                ORDER BY i.name
            `;
            const items = await queryAsync(query);
            
            const technicalSpecIds = new Set();
            items.forEach(item => {
                if (item.technicalSpecs) {
                    for (const id in item.technicalSpecs) {
                        technicalSpecIds.add(id);
                    }
                }
            });

            const idsArray = Array.from(technicalSpecIds);
            const placeholders = idsArray.length > 0 ? idsArray.map(() => '?').join(',') : 'NULL';
            const technicalSpecQuery = `SELECT idTechnicalSpec, technicalSpecKey FROM technicalSpec WHERE idTechnicalSpec IN (${placeholders})`;
            
            const technicalSpecsMap = {};
            if (idsArray.length > 0) {
                const specs = await queryAsync(technicalSpecQuery, idsArray);
                specs.forEach(spec => {
                    technicalSpecsMap[spec.idTechnicalSpec] = spec.technicalSpecKey;
                });
            }

            const finalItems = items.map(item => {
                const lots = (item.lots && item.lots.length > 0 && item.lots[0].idLot) ? item.lots : [];
                const image = (item.imageData && item.imageType) ? {
                    type: item.imageType,
                    data: item.imageData.toString('base64')
                } : null;

                const technicalSpecsFormatted = [];
                if (item.technicalSpecs) {
                    for (const id in item.technicalSpecs) {
                        technicalSpecsFormatted.push({
                            idTechnicalSpec: parseInt(id, 10),
                            technicalSpecKey: technicalSpecsMap[id] || 'Desconhecido',
                            technicalSpecValue: item.technicalSpecs[id]
                        });
                    }
                }

                const newItem = {
                    ...item,
                    lots,
                    totalQuantity: item.totalQuantity || 0,
                    image,
                    technicalSpecs: technicalSpecsFormatted
                };
                delete newItem.imageData;
                delete newItem.imageType;
                return newItem;
            });

            return handleResponse(res, 200, finalItems);

        } catch (error) {
            console.error("Erro ao buscar itens com detalhes:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async getItemsByCategoryId(req, res) {
        const { idCategory } = req.params;
        try {
            const query = `
                SELECT
                    i.idItem, i.name, i.aliases, i.brand, i.description, i.technicalSpecs, i.minimumStock,
                    JSON_OBJECT('idCategory', c.idCategory, 'value', c.categoryValue) AS category,
                    i.sapCode,
                    SUM(l.quantity) as totalQuantity
                FROM item i
                JOIN category c ON i.fkIdCategory = c.idCategory
                LEFT JOIN lots l ON i.idItem = l.fkIdItem
                WHERE c.idCategory = ?
                GROUP BY i.idItem
            `;
            const items = await queryAsync(query, [idCategory]);
            if (items.length === 0) {
                return handleResponse(res, 404, { message: "Nenhum item encontrado para esta categoria." });
            }
            return handleResponse(res, 200, items);
        } catch (error) {
            console.error("Erro ao buscar e agrupar itens por categoria:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor" });
        }
    }

    static async getItemsByCategoryDetailsId(req, res) {
        const { idCategory } = req.params;
        try {
            const query = `
                SELECT
                    i.idItem, i.name, i.aliases, i.brand, i.description, i.technicalSpecs, i.minimumStock,
                    JSON_OBJECT('idCategory', c.idCategory, 'value', c.categoryValue) AS category,
                    i.sapCode, i.fkIdImage,
                    img.imageData, img.imageType,
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
                JOIN category c ON i.fkIdCategory = c.idCategory
                LEFT JOIN lots l ON i.idItem = l.fkIdItem
                LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation
                LEFT JOIN image img ON i.fkIdImage = img.idImage
                WHERE c.idCategory = ?
                GROUP BY i.idItem
                ORDER BY i.name
            `;
            const items = await queryAsync(query, [idCategory]);
            if (items.length === 0) {
                return handleResponse(res, 404, { message: "Nenhum item encontrado para esta categoria." });
            }
            const technicalSpecIds = new Set();
            items.forEach(item => {
                if (item.technicalSpecs) {
                    for (const id in item.technicalSpecs) {
                        technicalSpecIds.add(id);
                    }
                }
            });

            const idsArray = Array.from(technicalSpecIds);
            const placeholders = idsArray.length > 0 ? idsArray.map(() => '?').join(',') : 'NULL';
            const technicalSpecQuery = `SELECT idTechnicalSpec, technicalSpecKey FROM technicalSpec WHERE idTechnicalSpec IN (${placeholders})`;

            const technicalSpecsMap = {};
            if (idsArray.length > 0) {
                const specs = await queryAsync(technicalSpecQuery, idsArray);
                specs.forEach(spec => {
                    technicalSpecsMap[spec.idTechnicalSpec] = spec.technicalSpecKey;
                });
            }

            const finalItems = items.map(item => {
                const lots = (item.lots && item.lots.length > 0 && item.lots[0].idLot) ? item.lots : [];
                const image = (item.imageData && item.imageType) ? {
                    type: item.imageType,
                    data: item.imageData.toString('base64')
                } : null;

                const technicalSpecsFormatted = [];
                if (item.technicalSpecs) {
                    for (const id in item.technicalSpecs) {
                        technicalSpecsFormatted.push({
                            idTechnicalSpec: parseInt(id, 10),
                            technicalSpecKey: technicalSpecsMap[id] || 'Desconhecido',
                            technicalSpecValue: item.technicalSpecs[id]
                        });
                    }
                }

                const newItem = {
                    ...item,
                    lots,
                    totalQuantity: item.totalQuantity || 0,
                    image,
                    technicalSpecs: technicalSpecsFormatted
                };
                delete newItem.imageData;
                delete newItem.imageType;
                return newItem;
            });
            return handleResponse(res, 200, finalItems);
        } catch (error) {
            console.error("Erro ao buscar itens por categoria com detalhes:", error);
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async createItem(req, res) {
        const {
            sapCode,
            name,
            aliases,
            minimumStock,
            quantity,
            expirationDate,
            fkIdLocation,
            fkIdUser,
            fkIdCategory,
            technicalSpecs,
            ...itemData
        } = req.body;
        const validationResult = await validateItem.validateCreateItem(req.body);
        if (!validationResult || !validationResult.isValid) {
            const errorMessage = validationResult ? validationResult.message : "Erro desconhecido na validação.";
            return handleResponse(res, 400, { message: errorMessage });
        }
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
            const insertItemQuery = `
                INSERT INTO item (sapCode, name, aliases, brand, description, technicalSpecs, minimumStock, fkIdCategory)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const itemValues = [sapCode, name, aliases, itemData.brand, itemData.description, JSON.stringify(technicalSpecs), minimumStock, fkIdCategory];
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

    static async updateSingleLotQuantity(req, res) {
        const { idItem } = req.params;
        const { quantity: rawQuantity, isAjust, fkIdUser } = req.body;
        if (idItem === undefined || isNaN(Number(idItem))) {
            return handleResponse(res, 400, { message: "O ID do item é obrigatório e deve ser um número." });
        }
        if (fkIdUser === undefined || isNaN(Number(fkIdUser))) {
            return handleResponse(res, 400, { message: "O ID do usuário é obrigatório e deve ser um número." });
        }
        if (typeof isAjust !== 'boolean') {
            return handleResponse(res, 400, { message: "O campo 'isAjust' deve ser um booleano (true ou false)." });
        }
        let quantityNum;
        let actionDescription;
        let quantityChange;
        try {
            quantityNum = parseFloat(rawQuantity);
            if (isNaN(quantityNum)) {
                return handleResponse(res, 400, { message: "A quantidade é obrigatória e deve ser um número válido." });
            }
            await queryAsync("START TRANSACTION");
            const countLotsQuery = "SELECT COUNT(*) AS lotCount FROM lots WHERE fkIdItem = ?";
            const [lotCountResult] = await queryAsync(countLotsQuery, [idItem]);
            const lotCount = lotCountResult.lotCount;
            if (lotCount !== 1) {
                await queryAsync("ROLLBACK");
                const message = lotCount === 0 ?
                    "Item não encontrado ou não possui lotes." :
                    "Este item possui mais de um lote. Esta operação é apenas para itens com um único lote.";
                return handleResponse(res, 404, { message });
            }
            const getLotInfoQuery = "SELECT idLot, quantity AS currentQuantity FROM lots WHERE fkIdItem = ?";
            const [lotInfo] = await queryAsync(getLotInfoQuery, [idItem]);
            const idLot = lotInfo.idLot;
            const currentQuantity = parseFloat(lotInfo.currentQuantity);
            let newQuantity;
            if (isAjust) {
                newQuantity = quantityNum;
                quantityChange = newQuantity - currentQuantity;
                actionDescription = 'AJUST';
            } else {
                if (quantityNum > 0) {
                    newQuantity = currentQuantity + quantityNum;
                    quantityChange = quantityNum;
                    actionDescription = 'IN';
                } else {
                    const quantityToRemove = Math.abs(quantityNum);
                    newQuantity = currentQuantity - quantityToRemove;
                    quantityChange = -quantityToRemove;
                    actionDescription = 'OUT';
                }
                if (newQuantity < 0) {
                    await queryAsync("ROLLBACK");
                    return handleResponse(res, 400, { message: "A remoção de quantidade resultaria em um estoque negativo." });
                }
            }
            newQuantity = parseFloat(newQuantity.toFixed(4));
            quantityChange = parseFloat(quantityChange.toFixed(4));
            const updateLotQuery = "UPDATE lots SET quantity = ? WHERE idLot = ?";
            await queryAsync(updateLotQuery, [newQuantity, idLot]);
            const insertTransactionQuery = `
                INSERT INTO transactions (fkIdUser, fkIdLot, actionDescription, quantityChange, oldQuantity, newQuantity)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            await queryAsync(insertTransactionQuery, [fkIdUser, idLot, actionDescription, quantityChange, currentQuantity, newQuantity]);
            await queryAsync("COMMIT");
            return handleResponse(res, 200, { message: "Quantidade do lote atualizada com sucesso!", idLot, newQuantity });
        } catch (error) {
            console.error("Erro ao atualizar quantidade do lote único:", error);
            await queryAsync("ROLLBACK");
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateItemInformation(req, res) {
        const { idItem } = req.params;
        const data = req.body;
        const validationResult = validateItem.validateUpdateInformation(req.body);
        if (!validationResult || !validationResult.isValid) {
            const errorMessage = validationResult ? validationResult.message : "Erro desconhecido na validação.";
            return handleResponse(res, 400, { message: errorMessage });
        }
        const { sapCode: newSapCode, fkIdCategory, technicalSpecs, ...otherData } = data;
        try {
            await queryAsync("START TRANSACTION");
            const findItemQuery = "SELECT sapCode, fkIdImage, fkIdCategory FROM item WHERE idItem = ?";
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
            const fieldsToUpdate = Object.keys(otherData);
            if (newSapCode !== undefined) {
                fieldsToUpdate.push('sapCode');
                otherData.sapCode = newSapCode;
            }
            if (fkIdCategory !== undefined && fkIdCategory !== existingItem.fkIdCategory) {
                fieldsToUpdate.push('fkIdCategory');
                otherData.fkIdCategory = fkIdCategory;
            }
            if (technicalSpecs !== undefined) {
                fieldsToUpdate.push('technicalSpecs');
                otherData.technicalSpecs = JSON.stringify(technicalSpecs);
            }
            if (fieldsToUpdate.length === 0) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 400, { message: "Nenhum campo para atualização de informações do item foi fornecido." });
            }
            const updateQueryParts = fieldsToUpdate.map(key => `${key} = ?`);
            const updateQuery = `UPDATE item SET ${updateQueryParts.join(', ')} WHERE idItem = ?`;
            const updateValues = fieldsToUpdate.map(key => otherData[key]);
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

static async insertImage(req, res) {
    const { idItem } = req.params;
    const imageFile = req.file;

    if (!imageFile) {
        return handleResponse(res, 400, { message: "Nenhuma imagem foi enviada." });
    }

    try {
        const [item] = await queryAsync("SELECT fkIdImage FROM item WHERE idItem = ?", [idItem]);

        if (!item) {
            await fs.unlink(imageFile.path).catch(err => console.error("Erro ao remover arquivo temporário:", err));
            return handleResponse(res, 404, { message: "Item não encontrado." });
        }

        const imageData = await fs.readFile(imageFile.path);
        const imageType = imageFile.mimetype;

        let message;
        let statusCode;
        let fkIdImage;

        if (item.fkIdImage) {
            // Atualizar a imagem existente
            await queryAsync("UPDATE image SET imageData = ?, imageType = ? WHERE idImage = ?", [imageData, imageType, item.fkIdImage]);
            fkIdImage = item.fkIdImage;
            message = "Imagem do item atualizada com sucesso!";
            statusCode = 200;
        } else {
            // Inserir uma nova imagem
            const imageResult = await queryAsync("INSERT INTO image (imageData, imageType) VALUES (?, ?)", [imageData, imageType]);
            fkIdImage = imageResult.insertId;
            await queryAsync("UPDATE item SET fkIdImage = ? WHERE idItem = ?", [fkIdImage, idItem]);
            message = "Imagem adicionada com sucesso ao item!";
            statusCode = 201;
        }

        await fs.unlink(imageFile.path).catch(err => console.error("Erro ao remover arquivo temporário:", err));
        return handleResponse(res, statusCode, { message, fkIdImage });

    } catch (error) {
        console.error("Erro ao inserir/atualizar imagem do item:", error);
        if (imageFile) {
            await fs.unlink(imageFile.path).catch(err => console.error("Erro ao remover arquivo temporário:", err));
        }
        return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
    }
}

    static async deleteImage(req, res) {
        const { idItem } = req.params;
        try {
            const [item] = await queryAsync("SELECT fkIdImage FROM item WHERE idItem = ?", [idItem]);
            if (!item) {
                return handleResponse(res, 404, { message: "Item não encontrado." });
            }
            if (!item.fkIdImage) {
                return handleResponse(res, 404, { message: "Este item não possui uma imagem para ser excluída." });
            }
            await queryAsync("START TRANSACTION");
            await queryAsync("UPDATE item SET fkIdImage = NULL WHERE idItem = ?", [idItem]);
            await queryAsync("DELETE FROM image WHERE idImage = ?", [item.fkIdImage]);
            await queryAsync("COMMIT");
            return handleResponse(res, 200, { message: "Imagem do item excluída com sucesso!" });
        } catch (error) {
            console.error("Erro ao excluir imagem do item:", error);
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