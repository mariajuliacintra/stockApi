const { queryAsync } = require("../utils/functions");
const ExcelJS = require("exceljs");

module.exports = class ReportControllerExcel {
    // Relatório Geral de Estoque
    static async generateGeneralReportExcel(req, res) {
        try {
            // A query foi corrigida para usar JOINs e GROUP BY para obter:
            // 1. O nome da categoria (c.categoryValue AS category)
            // 2. A soma total da quantidade em todos os lotes (SUM(l.quantity) AS quantity)
            // 3. Uma lista de todas as localizações para o item (GROUP_CONCAT)
            const items = await queryAsync(`
                SELECT 
                    i.idItem, 
                    i.name, 
                    c.categoryValue AS category,       
                    i.brand, 
                    i.description, 
                    COALESCE(SUM(l.quantity), 0) AS quantity,  /* COALESCE garante 0 se não houver lotes */
                    GROUP_CONCAT(DISTINCT CONCAT(loc.place, ' - ', loc.code) SEPARATOR ', ') AS location
                FROM item i
                INNER JOIN category c ON i.fkIdCategory = c.idCategory /* JOIN obrigatório para nome da categoria */
                LEFT JOIN lots l ON i.idItem = l.fkIdItem             /* LEFT JOIN para incluir itens sem lote */
                LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation /* JOIN para localização */
                GROUP BY i.idItem, i.name, c.categoryValue, i.brand, i.description
                ORDER BY i.idItem
            `);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Estoque Geral");

            worksheet.columns = [
                { header: "ID", key: "idItem", width: 10 },
                { header: "Nome", key: "name", width: 30 },
                { header: "Categoria", key: "category", width: 20 },
                { header: "Marca", key: "brand", width: 20 },
                { header: "Descrição", key: "description", width: 40 },
                { header: "Quantidade", key: "quantity", width: 15 },
                { header: "Local(is)", key: "location", width: 35 },
            ];

            items.forEach(item => {
                worksheet.addRow(item);
            });
            
            // Adiciona um estilo básico ao cabeçalho (opcional, mas melhora a visualização)
            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } };
            });

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=relatorio_estoque.xlsx"
            );

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao gerar relatório em Excel." });
        }
    }

    // Relatório de Estoque Baixo
    static async generateLowStockReportExcel(req, res) {
        try {
            // A query foi corrigida para usar o minimumStock da tabela item
            const items = await queryAsync(`
                SELECT 
                    i.idItem, 
                    i.name, 
                    c.categoryValue AS category, 
                    i.brand, 
                    i.minimumStock,
                    COALESCE(SUM(l.quantity), 0) AS currentQuantity,
                    GROUP_CONCAT(DISTINCT CONCAT(loc.place, ' - ', loc.code) SEPARATOR ', ') AS location
                FROM item i
                INNER JOIN category c ON i.fkIdCategory = c.idCategory
                LEFT JOIN lots l ON i.idItem = l.fkIdItem
                LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation
                GROUP BY i.idItem, i.name, c.categoryValue, i.brand, i.minimumStock
                /* Filtra itens onde a quantidade atual é <= estoque mínimo E o mínimo não é NULL */
                HAVING currentQuantity <= i.minimumStock AND i.minimumStock IS NOT NULL
                ORDER BY i.idItem
            `);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Estoque Baixo");

            worksheet.columns = [
                { header: "ID", key: "idItem", width: 10 },
                { header: "Nome", key: "name", width: 30 },
                { header: "Categoria", key: "category", width: 20 },
                { header: "Marca", key: "brand", width: 20 },
                { header: "Estoque Mínimo", key: "minimumStock", width: 15 },
                { header: "Quantidade Atual", key: "currentQuantity", width: 15 },
                { header: "Local(is)", key: "location", width: 35 },
            ];

            items.forEach(item => {
                worksheet.addRow(item);
            });

            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } };
            });

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                "attachment; filename=relatorio_estoque_baixo.xlsx"
            );

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao gerar relatório em Excel." });
        }
    }

    // Relatório de Transações
static async generateTransactionsReportExcel(req, res) {
    try {
        const transactions = await queryAsync(`
            SELECT tr.idTransaction, tr.actionDescription, tr.quantityChange, tr.transactionDate,
                   u.name AS userName, 
                   i.name AS itemName, 
                   c.categoryValue AS category,
                   l.lotNumber AS lotNumber,
                   CONCAT(loc.place, ' - ', loc.code) AS location
            FROM transactions tr
            LEFT JOIN user u ON tr.fkIdUser = u.idUser
            LEFT JOIN lots l ON tr.fkIdLot = l.idLot
            LEFT JOIN item i ON l.fkIdItem = i.idItem
            LEFT JOIN category c ON i.fkIdCategory = c.idCategory
            LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation
            ORDER BY tr.transactionDate DESC
        `);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Transações");

        worksheet.columns = [
            { header: "ID", key: "idTransaction", width: 10 },
            { header: "Item", key: "itemName", width: 30 },
            { header: "Lote", key: "lotNumber", width: 10 },
            { header: "Local", key: "location", width: 25 },
            { header: "Categoria", key: "category", width: 20 },
            { header: "Usuário", key: "userName", width: 25 },
            { header: "Ação", key: "actionDescription", width: 15 },
            { header: "Quantidade", key: "quantityChange", width: 15 },
            { header: "Data", key: "transactionDate", width: 25 },
        ];

        transactions.forEach(tx => {
            // Mapeamento da ação
            let actionLabel = "";
            switch (tx.actionDescription) {
                case "IN":
                    actionLabel = "Entrada";
                    break;
                case "OUT":
                    actionLabel = "Saída";
                    break;
                case "AJUST":
                    actionLabel = "Ajuste";
                    break;
                default:
                    actionLabel = tx.actionDescription || "N/A";
            }

            // Formatação da data
            const transactionData = {
                ...tx,
                actionDescription: actionLabel,
                transactionDate: tx.transactionDate
                    ? new Date(tx.transactionDate).toLocaleString("pt-BR")
                    : "N/A"
            };

            worksheet.addRow(transactionData);
        });

        // Cabeçalho formatado
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFE6E6E6" }
            };
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=relatorio_transacoes.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao gerar relatório em Excel." });
    }
}

};