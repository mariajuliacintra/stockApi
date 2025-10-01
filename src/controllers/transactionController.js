const { queryAsync, handleResponse } = require("../utils/functions");

module.exports = class TransactionController {
    static async getAllTransactions(req, res) {
        try {
            const query = `
                SELECT 
                    t.*, 
                    u.name AS userName, 
                    l.lotNumber,
                    i.name AS itemName
                FROM 
                    transactions t
                JOIN 
                    user u ON t.fkIdUser = u.idUser
                JOIN 
                    lots l ON t.fkIdLot = l.idLot
                JOIN 
                    item i ON l.fkIdItem = i.idItem
                ORDER BY t.transactionDate DESC
            `;
            const transactions = await queryAsync(query);
            return handleResponse(res, 200, {
                success: true,
                message: "Transações obtidas com sucesso.",
                data: transactions,
                arrayName: "transactions",
            });
        } catch (error) {
            console.error("Erro ao buscar transações:", error);
            return handleResponse(res, 500, {
                success: false,
                error: "Erro interno do servidor",
                details: error.message,
            });
        }
    }

    static async getTransactionById(req, res) {
        const { idTransaction } = req.params;
        try {
            const query = `
                SELECT 
                    t.*, 
                    u.name AS userName, 
                    l.lotNumber,
                    i.name AS itemName
                FROM 
                    transactions t
                JOIN 
                    user u ON t.fkIdUser = u.idUser
                JOIN 
                    lots l ON t.fkIdLot = l.idLot
                JOIN 
                    item i ON l.fkIdItem = i.idItem
                WHERE t.idTransaction = ?
            `;
            const transaction = await queryAsync(query, [idTransaction]);
            if (transaction.length === 0) {
                return handleResponse(res, 404, {
                    success: false,
                    error: "Transação não encontrada.",
                    details: "O ID da transação fornecido não existe.",
                });
            }
            return handleResponse(res, 200, {
                success: true,
                message: "Transação obtida com sucesso.",
                data: transaction[0],
                arrayName: "transaction",
            });
        } catch (error) {
            console.error("Erro ao buscar transação por ID:", error);
            return handleResponse(res, 500, {
                success: false,
                error: "Erro interno do servidor",
                details: error.message,
            });
        }
    }

    static async addTransaction(req, res) {
        const { fkIdUser, fkIdLot, actionDescription, quantityChange } = req.body;
        
        const allowedActions = ["IN", "OUT", "AJUST"];

        try {
            if (
                fkIdUser === undefined ||
                fkIdLot === undefined ||
                !allowedActions.includes(actionDescription) ||
                quantityChange === undefined ||
                isNaN(parseFloat(quantityChange))
            ) {
                return handleResponse(res, 400, {
                    success: false,
                    error: "Campos obrigatórios ausentes ou inválidos",
                    details: "Os campos 'fkIdUser', 'fkIdLot', 'actionDescription' (IN, OUT ou AJUST) e 'quantityChange' são obrigatórios e devem ser válidos.",
                });
            }

            const numericQuantityChange = parseFloat(quantityChange);
            
            if (actionDescription !== "AJUST" && numericQuantityChange <= 0) {
                return handleResponse(res, 400, {
                    success: false,
                    error: "Quantidade inválida",
                    details: "O 'quantityChange' deve ser um número positivo para ações 'IN' e 'OUT'.",
                });
            }

            const userQuery = "SELECT 1 FROM user WHERE idUser = ?";
            const userExists = await queryAsync(userQuery, [fkIdUser]);
            if (userExists.length === 0) {
                return handleResponse(res, 404, {
                    success: false,
                    error: "Usuário não encontrado.",
                    details: "O ID do usuário fornecido não existe.",
                });
            }

            const lotQuery = "SELECT quantity, fkIdItem FROM lots WHERE idLot = ?";
            const lot = await queryAsync(lotQuery, [fkIdLot]);
            if (lot.length === 0) {
                return handleResponse(res, 404, {
                    success: false,
                    error: "Lote não encontrado.",
                    details: "O ID do lote fornecido não existe.",
                });
            }
            const oldLotQuantity = parseFloat(lot[0].quantity);
            const fkIdItem = lot[0].fkIdItem;

            const itemQuery = "SELECT quantity FROM item WHERE idItem = ?";
            const item = await queryAsync(itemQuery, [fkIdItem]);
            const oldItemQuantity = parseFloat(item[0].quantity); 

            let newLotQuantity;
            let newItemQuantity;

            if (actionDescription === "OUT") {
                if (oldLotQuantity < numericQuantityChange) {
                    return handleResponse(res, 400, {
                        success: false,
                        error: "Quantidade insuficiente no lote.",
                        details: "A quantidade a ser retirada excede a quantidade atual no lote especificado.",
                    });
                }
                newLotQuantity = oldLotQuantity - numericQuantityChange;
                newItemQuantity = oldItemQuantity - numericQuantityChange;
            } else if (actionDescription === "IN" || actionDescription === "AJUST") {
                newLotQuantity = oldLotQuantity + numericQuantityChange;
                newItemQuantity = oldItemQuantity + numericQuantityChange;
            }

            if (newLotQuantity < 0 && actionDescription !== "AJUST") {
                return handleResponse(res, 400, {
                    success: false,
                    error: "Quantidade final inválida no lote.",
                    details: "A quantidade resultante do lote não pode ser negativa, exceto em ajustes.",
                });
            }
            if (newItemQuantity < 0 && actionDescription !== "AJUST") {
                return handleResponse(res, 400, {
                    success: false,
                    error: "Quantidade final inválida no item.",
                    details: "A quantidade resultante do item não pode ser negativa, exceto em ajustes.",
                });
            }

            const insertTransactionQuery =
                "INSERT INTO transactions (fkIdUser, fkIdLot, actionDescription, quantityChange, oldQuantity, newQuantity, transactionDate) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
            const updateLotQuery = "UPDATE lots SET quantity = ? WHERE idLot = ?";
            const updateItemQuery = "UPDATE item SET quantity = ? WHERE idItem = ?"; 

            await queryAsync("START TRANSACTION");

            const transactionValues = [
                fkIdUser,
                fkIdLot,
                actionDescription,
                numericQuantityChange,
                oldLotQuantity, 
                newLotQuantity, 
            ];
            await queryAsync(insertTransactionQuery, transactionValues);

            await queryAsync(updateLotQuery, [newLotQuantity, fkIdLot]);
            await queryAsync(updateItemQuery, [newItemQuantity, fkIdItem]); 

            await queryAsync("COMMIT");

            return handleResponse(res, 201, {
                success: true,
                message: "Transação registrada, lote e item atualizados com sucesso!",
                data: { newLotQuantity, newItemQuantity, fkIdItem },
                arrayName: "item",
            });
        } catch (error) {
            await queryAsync("ROLLBACK");
            console.error("Erro ao registrar transação:", error);
            return handleResponse(res, 500, {
                success: false,
                error: "Erro interno do servidor",
                details: error.message,
            });
        }
    }

    static async getTransactionByItem(req, res) {
        const { fkIdItem } = req.params;
        try {
            const query = `
                SELECT 
                    t.*, 
                    u.name AS userName, 
                    l.lotNumber, 
                    i.name AS itemName
                FROM 
                    transactions t 
                JOIN 
                    user u ON t.fkIdUser = u.idUser 
                JOIN 
                    lots l ON t.fkIdLot = l.idLot 
                JOIN 
                    item i ON l.fkIdItem = i.idItem 
                WHERE 
                    l.fkIdItem = ? 
                ORDER BY t.transactionDate DESC
            `;
            const transactions = await queryAsync(query, [fkIdItem]);
            if (transactions.length === 0) {
                return handleResponse(res, 404, {
                    success: false,
                    error: "Nenhuma transação encontrada.",
                    details: "Não há transações registradas para este item.",
                });
            }
            return handleResponse(res, 200, {
                success: true,
                message: "Transações do item obtidas com sucesso.",
                data: transactions,
                arrayName: "transactions",
            });
        } catch (error) {
            console.error("Erro ao buscar transações por item:", error);
            return handleResponse(res, 500, {
                success: false,
                error: "Erro interno do servidor",
                details: error.message,
            });
        }
    }

    static async getTransactionByUser(req, res) {
        const { fkIdUser } = req.params;
        try {
            const query = `
                SELECT 
                    t.*, 
                    u.name AS userName, 
                    l.lotNumber,
                    i.name AS itemName
                FROM 
                    transactions t
                JOIN 
                    user u ON t.fkIdUser = u.idUser
                JOIN 
                    lots l ON t.fkIdLot = l.idLot
                JOIN 
                    item i ON l.fkIdItem = i.idItem
                WHERE 
                    t.fkIdUser = ? 
                ORDER BY 
                    t.transactionDate DESC
            `;
            const transactions = await queryAsync(query, [fkIdUser]);

            if (transactions.length === 0) {
                return handleResponse(res, 404, {
                    success: false,
                    error: "Nenhuma transação encontrada.",
                    details: "Não há transações registradas para este usuário.",
                });
            }

            return handleResponse(res, 200, {
                success: true,
                message: "Transações do usuário obtidas com sucesso.",
                data: transactions,
                arrayName: "transactions",
            });
        } catch (error) {
            console.error("Erro ao buscar transações por usuário:", error);
            return handleResponse(res, 500, {
                success: false,
                error: "Erro interno do servidor",
                details: error.message,
            });
        }
    }
};