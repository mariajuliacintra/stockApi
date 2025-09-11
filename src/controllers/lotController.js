const { queryAsync, handleResponse } = require('../utils/functions');
const { validateCreateLot, validateUpdateLotQuantity, validateUpdateLotInformation } = require('../services/validateLot'); // Assumindo que o arquivo de validação está em 'validators'

module.exports = class LotController {

    static async createLotBySapCode(req, res) {
        const { sapCode } = req.params;
        const { quantity, expirationDate, fkIdLocation, fkIdUser } = req.body;

        try {
            // A validação completa já verifica o sapCode e o item.
            const validationResult = await validateCreateLot({
                quantity,
                expirationDate,
                fkIdLocation,
                fkIdUser,
                sapCode,
            });

            if (!validationResult.isValid) {
                return handleResponse(res, 400, { message: validationResult.message });
            }

            await queryAsync("START TRANSACTION");

            const itemQuery = "SELECT idItem FROM item WHERE sapCode = ?";
            const [item] = await queryAsync(itemQuery, [sapCode]);

            if (!item) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 404, { message: "Código SAP não encontrado. Não é possível criar um lote para um item inexistente." });
            }

            const fkIdItem = item.idItem;

            const getLotNumberQuery = "SELECT COALESCE(MAX(lotNumber), 0) + 1 AS newLotNumber FROM lots WHERE fkIdItem = ?";
            const [lotResult] = await queryAsync(getLotNumberQuery, [fkIdItem]);
            const nextLotNumber = lotResult.newLotNumber;

            const insertLotQuery = "INSERT INTO lots (lotNumber, quantity, expirationDate, fkIdLocation, fkIdItem) VALUES (?, ?, ?, ?, ?)";
            const lotValues = [nextLotNumber, quantity, expirationDate, fkIdLocation, fkIdItem];
            const newLotResult = await queryAsync(insertLotQuery, lotValues);
            const newLotId = newLotResult.insertId;

            const insertTransactionQuery = "INSERT INTO transactions (fkIdUser, fkIdLot, actionDescription, quantityChange, oldQuantity, newQuantity) VALUES (?, ?, ?, ?, ?, ?)";
            const transactionValues = [fkIdUser, newLotId, 'IN', quantity, 0, quantity];
            await queryAsync(insertTransactionQuery, transactionValues);

            await queryAsync("COMMIT");
            return handleResponse(res, 201, { message: "Novo lote criado com sucesso!", lotId: newLotId, lotNumber: nextLotNumber, sapCode });
        } catch (error) {
            console.error("Erro ao criar novo lote por SAP Code:", error);
            await queryAsync("ROLLBACK");
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async createLotByIdItem(req, res) {
        const { idItem } = req.params;
        const { quantity, expirationDate, fkIdLocation, fkIdUser } = req.body;

        try {
            const validationResult = await validateCreateLot({
                quantity,
                expirationDate,
                fkIdLocation,
                fkIdUser,
                idItem,
            });

            if (!validationResult.isValid) {
                return handleResponse(res, 400, { message: validationResult.message });
            }

            await queryAsync("START TRANSACTION");

            const getLotNumberQuery = "SELECT COALESCE(MAX(lotNumber), 0) + 1 AS newLotNumber FROM lots WHERE fkIdItem = ?";
            const [lotResult] = await queryAsync(getLotNumberQuery, [idItem]);
            const nextLotNumber = lotResult.newLotNumber;

            const insertLotQuery = "INSERT INTO lots (lotNumber, quantity, expirationDate, fkIdLocation, fkIdItem) VALUES (?, ?, ?, ?, ?)";
            const lotValues = [nextLotNumber, quantity, expirationDate, fkIdLocation, idItem];
            const newLotResult = await queryAsync(insertLotQuery, lotValues);
            const newLotId = newLotResult.insertId;

            const insertTransactionQuery = "INSERT INTO transactions (fkIdUser, fkIdLot, actionDescription, quantityChange, oldQuantity, newQuantity) VALUES (?, ?, ?, ?, ?, ?)";
            const transactionValues = [fkIdUser, newLotId, 'IN', quantity, 0, quantity];
            await queryAsync(insertTransactionQuery, transactionValues);

            await queryAsync("COMMIT");
            return handleResponse(res, 201, { message: "Novo lote criado com sucesso!", lotId: newLotId, lotNumber: nextLotNumber, idItem });
        } catch (error) {
            console.error("Erro ao criar novo lote por ID do Item:", error);
            await queryAsync("ROLLBACK");
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateLotQuantity(req, res) {
        const { idLot } = req.params;
        const { quantity, fkIdUser, isAjust } = req.body;

        try {
            const validationResult = await validateUpdateLotQuantity({ quantity, fkIdUser });

            if (!validationResult.isValid) {
                return handleResponse(res, 400, { message: validationResult.message });
            }

            await queryAsync("START TRANSACTION");

            const getLotQuery = "SELECT quantity FROM lots WHERE idLot = ?";
            const [lot] = await queryAsync(getLotQuery, [idLot]);

            if (!lot) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 404, { message: "Lote não encontrado." });
            }

            const oldQuantity = parseFloat(lot.quantity);
            const quantityChange = parseFloat(quantity);
            let newQuantity;
            let actionDescription;

            if (isAjust) {
                newQuantity = quantityChange;
                actionDescription = 'AJUST';
            } else {
                newQuantity = oldQuantity + quantityChange;
                actionDescription = quantityChange > 0 ? 'IN' : 'OUT';
            }

            if (newQuantity < 0) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 400, { message: "A quantidade final do lote não pode ser negativa." });
            }

            const updateLotQuery = "UPDATE lots SET quantity = ? WHERE idLot = ?";
            await queryAsync(updateLotQuery, [newQuantity, idLot]);

            await queryAsync(
                "INSERT INTO transactions (fkIdUser, fkIdLot, actionDescription, quantityChange, oldQuantity, newQuantity) VALUES (?, ?, ?, ?, ?, ?)",
                [fkIdUser, idLot, actionDescription, Math.abs(quantityChange), oldQuantity, newQuantity]
            );

            await queryAsync("COMMIT");
            return handleResponse(res, 200, { message: "Quantidade do lote atualizada com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar a quantidade do lote:", error);
            await queryAsync("ROLLBACK");
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateLotInformation(req, res) {
        const { idLot } = req.params;
        const { expirationDate, fkIdLocation } = req.body;

        console.log("Corpo da requisição recebido:", req.body); 

        try {
            const validationResult = await validateUpdateLotInformation({ expirationDate, fkIdLocation });

            if (!validationResult.isValid) {
                return handleResponse(res, 400, { message: validationResult.message });
            }

            await queryAsync("START TRANSACTION");

            const updateFields = {};
            if (expirationDate !== undefined) updateFields.expirationDate = expirationDate;
            if (fkIdLocation !== undefined) updateFields.fkIdLocation = fkIdLocation;

            const fieldsToUpdate = Object.keys(updateFields);

            if (fieldsToUpdate.length === 0) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 400, { message: "Nenhum campo para atualização de informação do lote foi fornecido." });
            }

            const updateQueryParts = fieldsToUpdate.map(key => `${key} = ?`);
            const updateQuery = `UPDATE lots SET ${updateQueryParts.join(', ')} WHERE idLot = ?`;
            const updateValues = fieldsToUpdate.map(key => updateFields[key]);
            updateValues.push(idLot);

            const result = await queryAsync(updateQuery, updateValues);

            if (result.affectedRows === 0) {
                await queryAsync("ROLLBACK");
                return handleResponse(res, 404, { message: "Lote não encontrado." });
            }

            await queryAsync("COMMIT");
            return handleResponse(res, 200, { message: "Informações do lote atualizadas com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar informações do lote:", error);
            await queryAsync("ROLLBACK");
            return handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }
}