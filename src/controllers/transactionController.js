const { queryAsync, handleResponse } = require("../utils/functions");

module.exports = class TransactionController {
  static async getAllTransactions(req, res) {
    try {
      const query = "SELECT * FROM transactions";
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
      const query = "SELECT * FROM transactions WHERE idTransaction = ?";
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
    const { fkIdUser, fkIdItem, actionDescription, quantityChange } = req.body;
    try {
      if (
        fkIdUser === undefined ||
        fkIdItem === undefined ||
        !actionDescription ||
        quantityChange === undefined ||
        isNaN(parseFloat(quantityChange))
      ) {
        return handleResponse(res, 400, {
          success: false,
          error: "Campos obrigatórios ausentes ou inválidos",
          details:
            "Os campos 'fkIdUser', 'fkIdItem', 'actionDescription' e 'quantityChange' são obrigatórios e devem ser válidos.",
        });
      }
      const numericQuantityChange = parseFloat(quantityChange);
      if (numericQuantityChange <= 0 && actionDescription !== "AJUST") {
        // Permitir quantityChange zero ou negativo apenas para AJUST
        return handleResponse(res, 400, {
          success: false,
          error: "Quantidade inválida",
          details:
            "O 'quantityChange' deve ser um número positivo para ações 'IN' e 'OUT'.",
        });
      }

      const userQuery = "SELECT 1 FROM user WHERE idUser = ?";
      const itemQuery = "SELECT quantity FROM item WHERE idItem = ?";

      const userExists = await queryAsync(userQuery, [fkIdUser]);
      if (userExists.length === 0) {
        return handleResponse(res, 404, {
          success: false,
          error: "Usuário não encontrado.",
          details: "O ID do usuário fornecido não existe.",
        });
      }

      const item = await queryAsync(itemQuery, [fkIdItem]);
      if (item.length === 0) {
        return handleResponse(res, 404, {
          success: false,
          error: "Item não encontrado.",
          details: "O ID do item fornecido não existe.",
        });
      }

      const oldQuantity = parseFloat(item[0].quantity);
      let newQuantity;
      let adjustedQuantityChange = numericQuantityChange;

      switch (actionDescription) {
        case "IN":
          newQuantity = oldQuantity + numericQuantityChange;
          break;
        case "OUT":
          if (oldQuantity < numericQuantityChange) {
            return handleResponse(res, 400, {
              success: false,
              error: "Quantidade insuficiente em estoque.",
              details:
                "A quantidade a ser retirada excede a quantidade atual em estoque.",
            });
          }
          newQuantity = oldQuantity - numericQuantityChange;
          break;
        case "AJUST":
          newQuantity = oldQuantity + numericQuantityChange; // AJUST pode ser positivo ou negativo
          break;
        default:
          return handleResponse(res, 400, {
            success: false,
            error: "Ação inválida.",
            details: "A 'actionDescription' deve ser 'IN', 'OUT' ou 'AJUST'.",
          });
      }

      if (newQuantity < 0 && actionDescription !== "AJUST") {
        return handleResponse(res, 400, {
          success: false,
          error: "Quantidade final inválida.",
          details:
            "A quantidade resultante do item não pode ser negativa, exceto em ajustes.",
        });
      }

      const insertTransactionQuery =
        "INSERT INTO transactions (fkIdUser, fkIdItem, actionDescription, quantityChange, oldQuantity, newQuantity, transactionDate) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
      const updateItemQuery = "UPDATE item SET quantity = ? WHERE idItem = ?";

      await queryAsync("START TRANSACTION");

      const transactionValues = [
        fkIdUser,
        fkIdItem,
        actionDescription,
        adjustedQuantityChange,
        oldQuantity,
        newQuantity,
      ];
      await queryAsync(insertTransactionQuery, transactionValues);

      const itemValues = [newQuantity, fkIdItem];
      await queryAsync(updateItemQuery, itemValues);

      await queryAsync("COMMIT");

      return handleResponse(res, 201, {
        success: true,
        message: "Transação registrada e item atualizado com sucesso!",
        data: { newQuantity },
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
      const query =
        "SELECT t.*, u.username as userUsername, i.name as itemName FROM transactions t JOIN user u ON t.fkIdUser = u.idUser JOIN item i ON t.fkIdItem = i.idItem WHERE t.fkIdItem = ? ORDER BY t.transactionDate DESC";
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
      // A query corrigida agora usa 'u.name' e faz JOIN com a tabela 'lots'
      const query = `
            SELECT 
                t.*, 
                u.name AS userName, 
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