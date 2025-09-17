const PDFDocument = require("pdfkit");
const { queryAsync } = require("../utils/functions");

function formatAction(action) {
  switch (action) {
    case "IN":
      return "Entrada";
    case "OUT":
      return "Saída";
    case "AJUST":
      return "Ajuste";
    default:
      return action;
  }
}

module.exports = class ReportControllerPdf {
  // ================== RELATÓRIO GERAL ==================
  static async generateGeneralReport(req, res) {
    try {
      const items = await queryAsync(`
                SELECT 
                    i.idItem,
                    i.name,
                    i.brand,
                    c.categoryValue AS category,
                    COALESCE(SUM(l.quantity), 0) AS totalQuantity,
                    loc.place,
                    loc.code
                FROM item i
                LEFT JOIN category c ON i.fkIdCategory = c.idCategory
                LEFT JOIN lots l ON i.idItem = l.fkIdItem
                LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation
                GROUP BY i.idItem, i.name, i.brand, c.categoryValue, loc.place, loc.code
                ORDER BY c.categoryValue, i.name
            `);

      const users = await queryAsync(`
                SELECT idUser, name, role, email 
                FROM user
            `);

      const transactions = await queryAsync(`
                SELECT 
                    t.transactionDate,
                    t.actionDescription,
                    t.quantityChange,
                    u.name AS userName,
                    i.name AS itemName,
                    c.categoryValue AS category
                FROM transactions t
                LEFT JOIN user u ON t.fkIdUser = u.idUser
                LEFT JOIN lots l ON t.fkIdLot = l.idLot
                LEFT JOIN item i ON l.fkIdItem = i.idItem
                LEFT JOIN category c ON i.fkIdCategory = c.idCategory
                ORDER BY t.transactionDate DESC
                LIMIT 20
            `);

      const doc = new PDFDocument({ margin: 30, size: "A4" });
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=relatorio_geral.pdf"
      );
      res.setHeader("Content-Type", "application/pdf");
      doc.pipe(res);

      doc.fontSize(20).text("Relatório Geral do Estoque", { align: "center" });
      doc.moveDown(2);

      // Usuários
      doc.fontSize(16).text("Usuários", { underline: true });
      users.forEach((u) => {
        doc.font("Helvetica-Bold").text("• Nome: ", { continued: true });
        doc.font("Helvetica").text(u.name, { continued: true });
        doc.font("Helvetica-Bold").text("; Email: ", { continued: true });
        doc.font("Helvetica").text(u.email, { continued: true });
        doc.font("Helvetica-Bold").text("; Função: ", { continued: true });
        doc.font("Helvetica").text(u.role);
      });
      doc.moveDown(2);

      // Itens agrupados por categoria
      const groupedItems = items.reduce((acc, item) => {
        acc[item.category] = acc[item.category] || [];
        acc[item.category].push(item);
        return acc;
      }, {});

      for (const [category, group] of Object.entries(groupedItems)) {
        doc.fontSize(16).text(category.toUpperCase(), { underline: true });
        group.forEach((i) => {
          doc.font("Helvetica-Bold").text("• Nome: ", { continued: true });
          doc.font("Helvetica").text(i.name, { continued: true });
          if (i.brand) {
            doc.font("Helvetica-Bold").text("; Marca: ", { continued: true });
            doc.font("Helvetica").text(i.brand, { continued: true });
          }
          doc
            .font("Helvetica-Bold")
            .text("; Quantidade Total: ", { continued: true });
          doc
            .font("Helvetica")
            .text(i.totalQuantity.toString(), { continued: true });
          if (i.place) {
            doc
              .font("Helvetica-Bold")
              .text("; Localização: ", { continued: true });
            doc.font("Helvetica").text(`${i.place} - ${i.code}`);
          }
        });
        doc.moveDown(1);
      }

      // Últimas transações
      doc.fontSize(16).text("Últimas Transações", { underline: true });
      if (!transactions.length) {
        doc.text("Nenhuma transação registrada.");
      } else {
        transactions.forEach((tx) => {
          doc.font("Helvetica-Bold").text("• Data: ", { continued: true });
          doc
            .font("Helvetica")
            .text(new Date(tx.transactionDate).toLocaleString(), {
              continued: true,
            });
          doc.font("Helvetica-Bold").text("; Usuário: ", { continued: true });
          doc.font("Helvetica").text(tx.userName, { continued: true });
          doc.font("Helvetica-Bold").text("; Item: ", { continued: true });
          doc
            .font("Helvetica")
            .text(`${tx.category} - ${tx.itemName}`, { continued: true });
          doc.font("Helvetica-Bold").text("; Ação: ", { continued: true });
          doc
            .font("Helvetica")
            .text(formatAction(tx.actionDescription), { continued: true });
          doc
            .font("Helvetica-Bold")
            .text("; Quantidade: ", { continued: true });
          doc.font("Helvetica").text(tx.quantityChange.toString());
        });
      }

      doc.end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao gerar relatório" });
    }
  }

  // ================== RELATÓRIO ESTOQUE BAIXO ==================
  static async generateLowStockReport(req, res) {
    try {
      const lowStock = await queryAsync(`
                SELECT 
                    i.name,
                    i.brand,
                    c.categoryValue AS category,
                    COALESCE(SUM(l.quantity), 0) AS totalQuantity,
                    loc.place,
                    loc.code,
                    i.minimumStock
                FROM item i
                LEFT JOIN category c ON i.fkIdCategory = c.idCategory
                LEFT JOIN lots l ON i.idItem = l.fkIdItem
                LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation
                GROUP BY i.idItem, i.name, i.brand, c.categoryValue, loc.place, loc.code, i.minimumStock
                HAVING totalQuantity <= IFNULL(i.minimumStock, 10)
                ORDER BY c.categoryValue, i.name
            `);

      const doc = new PDFDocument({ margin: 30, size: "A4" });
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=relatorio_estoque_baixo.pdf"
      );
      res.setHeader("Content-Type", "application/pdf");
      doc.pipe(res);

      doc.fontSize(20).text("Relatório de Estoque Baixo", { align: "center" });
      doc.moveDown(2);

      if (!lowStock.length) {
        doc.text("Nenhum item em estoque baixo.");
      } else {
        lowStock.forEach((i) => {
          doc.font("Helvetica-Bold").text("• Nome: ", { continued: true });
          doc.font("Helvetica").text(i.name, { continued: true });
          if (i.brand) {
            doc.font("Helvetica-Bold").text("; Marca: ", { continued: true });
            doc.font("Helvetica").text(i.brand, { continued: true });
          }
          doc.font("Helvetica-Bold").text("; Categoria: ", { continued: true });
          doc.font("Helvetica").text(i.category, { continued: true });
          doc
            .font("Helvetica-Bold")
            .text("; Quantidade Total: ", { continued: true });
          doc
            .font("Helvetica")
            .text(i.totalQuantity.toString(), { continued: true });
          if (i.place) {
            doc
              .font("Helvetica-Bold")
              .text("; Localização: ", { continued: true });
            doc.font("Helvetica").text(`${i.place} - ${i.code}`);
          }
        });
      }

      doc.end();
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Erro ao gerar relatório de estoque baixo" });
    }
  }

  // ================== RELATÓRIO DE TRANSAÇÕES ==================
  static async generateTransactionsReport(req, res) {
    try {
      const transactions = await queryAsync(`
                SELECT 
                    t.transactionDate,
                    t.actionDescription,
                    t.quantityChange,
                    u.name AS userName,
                    i.name AS itemName,
                    c.categoryValue AS category
                FROM transactions t
                LEFT JOIN user u ON t.fkIdUser = u.idUser
                LEFT JOIN lots l ON t.fkIdLot = l.idLot
                LEFT JOIN item i ON l.fkIdItem = i.idItem
                LEFT JOIN category c ON i.fkIdCategory = c.idCategory
                ORDER BY t.transactionDate DESC
                LIMIT 50
            `);

      const doc = new PDFDocument({ margin: 30, size: "A4" });
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=relatorio_transacoes.pdf"
      );
      res.setHeader("Content-Type", "application/pdf");
      doc.pipe(res);

      doc.fontSize(20).text("Relatório de Transações", { align: "center" });
      doc.moveDown(2);

      if (!transactions.length) {
        doc.text("Nenhuma transação registrada.");
      } else {
        transactions.forEach((tx) => {
          doc.font("Helvetica-Bold").text("• Data: ", { continued: true });
          doc
            .font("Helvetica")
            .text(new Date(tx.transactionDate).toLocaleString(), {
              continued: true,
            });
          doc.font("Helvetica-Bold").text("; Usuário: ", { continued: true });
          doc.font("Helvetica").text(tx.userName, { continued: true });
          doc.font("Helvetica-Bold").text("; Item: ", { continued: true });
          doc
            .font("Helvetica")
            .text(`${tx.category} - ${tx.itemName}`, { continued: true });
          doc.font("Helvetica-Bold").text("; Ação: ", { continued: true });
          doc
            .font("Helvetica")
            .text(formatAction(tx.actionDescription), { continued: true });
          doc
            .font("Helvetica-Bold")
            .text("; Quantidade: ", { continued: true });
          doc.font("Helvetica").text(tx.quantityChange.toString());
        });
      }

      doc.end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao gerar relatório de transações" });
    }
  }
};
