const { queryAsync } = require("../utils/functions");
const ExcelJS = require("exceljs");

module.exports = class ReportControllerExcel {
    // 📦 Relatório Geral de Estoque
    static async generateGeneralReportExcel(req, res) {
        try {
            const items = await queryAsync(`
                SELECT 
                    idItem, name, category, brand, description, quantity, fkIdLocation
                FROM item
            `);

            const locations = await queryAsync(`SELECT idLocation, place, code FROM location`);
            const locationMap = Object.fromEntries(locations.map(loc => [loc.idLocation, `${loc.place} - ${loc.code}`]));

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Estoque Geral");

            worksheet.columns = [
                { header: "ID", key: "idItem", width: 10 },
                { header: "Nome", key: "name", width: 30 },
                { header: "Categoria", key: "category", width: 20 },
                { header: "Marca", key: "brand", width: 20 },
                { header: "Descrição", key: "description", width: 40 },
                { header: "Quantidade", key: "quantity", width: 15 },
                { header: "Local", key: "location", width: 25 },
            ];

            items.forEach(item => {
                worksheet.addRow({
                    ...item,
                    location: locationMap[item.fkIdLocation] || "Sem localização",
                });
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

    // ⚠️ Relatório de Estoque Baixo
    static async generateLowStockReportExcel(req, res) {
        try {
            const lowStockLimit = 10;

            const items = await queryAsync(`
                SELECT idItem, name, category, brand, quantity, fkIdLocation
                FROM item
                WHERE quantity <= ?
            `, [lowStockLimit]);

            const locations = await queryAsync(`SELECT idLocation, place, code FROM location`);
            const locationMap = Object.fromEntries(locations.map(loc => [loc.idLocation, `${loc.place} - ${loc.code}`]));

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Estoque Baixo");

            worksheet.columns = [
                { header: "ID", key: "idItem", width: 10 },
                { header: "Nome", key: "name", width: 30 },
                { header: "Categoria", key: "category", width: 20 },
                { header: "Marca", key: "brand", width: 20 },
                { header: "Quantidade", key: "quantity", width: 15 },
                { header: "Local", key: "location", width: 25 },
            ];

            items.forEach(item => {
                worksheet.addRow({
                    ...item,
                    location: locationMap[item.fkIdLocation] || "Sem localização",
                });
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

    // 🔄 Relatório de Transações
    static async generateTransactionsReportExcel(req, res) {
        try {
            const transactions = await queryAsync(`
                SELECT tr.idTransaction, tr.actionDescription, tr.quantityChange, tr.transactionDate,
                       tr.fkIdItem, tr.fkIdUser, u.name AS userName, i.name AS itemName, i.category
                FROM transactions tr
                LEFT JOIN user u ON tr.fkIdUser = u.idUser
                LEFT JOIN item i ON tr.fkIdItem = i.idItem
                ORDER BY tr.transactionDate DESC
            `);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Transações");

            worksheet.columns = [
                { header: "ID", key: "idTransaction", width: 10 },
                { header: "Item", key: "itemName", width: 30 },
                { header: "Categoria", key: "category", width: 20 },
                { header: "Usuário", key: "userName", width: 25 },
                { header: "Ação", key: "actionDescription", width: 15 },
                { header: "Quantidade", key: "quantityChange", width: 15 },
                { header: "Data", key: "transactionDate", width: 25 },
            ];

            transactions.forEach(tx => {
                worksheet.addRow(tx);
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
