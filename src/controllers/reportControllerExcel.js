const { queryAsync } = require("../utils/functions");
const ExcelJS = require("exceljs");

module.exports = class ReportControllerExcel {
    // Relatório Geral de Estoque
    static async generateGeneralReportExcel(req, res) {
        try {
            const items = await queryAsync(`
                SELECT 
                    i.idItem, i.name, i.brand, i.description, i.sapCode,
                    c.categoryValue AS category,
                    l.idLot, l.lotNumber, l.quantity, l.expirationDate,
                    loc.place, loc.code
                FROM item i
                LEFT JOIN category c ON i.fkIdCategory = c.idCategory
                LEFT JOIN lots l ON i.idItem = l.fkIdItem
                LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation
                ORDER BY i.name, l.lotNumber
            `);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Estoque Geral");

            worksheet.columns = [
                { header: "ID Item", key: "idItem", width: 10 },
                { header: "Nome", key: "name", width: 30 },
                { header: "Categoria", key: "category", width: 20 },
                { header: "Marca", key: "brand", width: 20 },
                { header: "Descrição", key: "description", width: 40 },
                { header: "Código SAP", key: "sapCode", width: 15 },
                { header: "Lote", key: "lotNumber", width: 10 },
                { header: "Quantidade", key: "quantity", width: 15 },
                { header: "Validade", key: "expirationDate", width: 20 },
                { header: "Local", key: "location", width: 25 },
            ];

            items.forEach(item => {
                worksheet.addRow({
                    ...item,
                    location: item.place ? `${item.place} - ${item.code}` : "Sem localização",
                });
            });

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=relatorio_estoque.xlsx");

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
            const items = await queryAsync(`
                SELECT 
                    i.idItem, i.name, i.brand, i.sapCode,
                    c.categoryValue AS category,
                    l.idLot, l.lotNumber, l.quantity, i.minimumStock,
                    loc.place, loc.code
                FROM item i
                LEFT JOIN category c ON i.fkIdCategory = c.idCategory
                LEFT JOIN lots l ON i.idItem = l.fkIdItem
                LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation
                WHERE l.quantity <= IFNULL(i.minimumStock, 10)
                ORDER BY i.name
            `);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Estoque Baixo");

            worksheet.columns = [
                { header: "ID Item", key: "idItem", width: 10 },
                { header: "Nome", key: "name", width: 30 },
                { header: "Categoria", key: "category", width: 20 },
                { header: "Marca", key: "brand", width: 20 },
                { header: "Código SAP", key: "sapCode", width: 15 },
                { header: "Lote", key: "lotNumber", width: 10 },
                { header: "Quantidade", key: "quantity", width: 15 },
                { header: "Estoque Mínimo", key: "minimumStock", width: 15 },
                { header: "Local", key: "location", width: 25 },
            ];

            items.forEach(item => {
                worksheet.addRow({
                    ...item,
                    location: item.place ? `${item.place} - ${item.code}` : "Sem localização",
                });
            });

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=relatorio_estoque_baixo.xlsx");

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
            SELECT 
                t.idTransaction, 
                t.actionDescription, 
                t.quantityChange, 
                t.oldQuantity, 
                t.newQuantity,
                t.transactionDate,
                u.name AS userName,
                i.name AS itemName,
                c.categoryValue AS category,
                l.lotNumber,
                loc.place, 
                loc.code
            FROM transactions t
            LEFT JOIN user u ON t.fkIdUser = u.idUser
            LEFT JOIN lots l ON t.fkIdLot = l.idLot
            LEFT JOIN item i ON l.fkIdItem = i.idItem
            LEFT JOIN category c ON i.fkIdCategory = c.idCategory
            LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation
            ORDER BY t.transactionDate DESC
        `);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Transações");

        worksheet.columns = [
            { header: "ID", key: "idTransaction", width: 10 },
            { header: "Item", key: "itemName", width: 30 },
            { header: "Categoria", key: "category", width: 20 },
            { header: "Usuário", key: "userName", width: 25 },
            { header: "Ação", key: "actionDescription", width: 15 },
            { header: "Lote", key: "lotNumber", width: 15 },
            { header: "Quantidade", key: "quantityChange", width: 15 },
            { header: "Quantidade Antiga", key: "oldQuantity", width: 20 },
            { header: "Quantidade Nova", key: "newQuantity", width: 20 },
            { header: "Local", key: "place", width: 20 },
            { header: "Código Local", key: "code", width: 15 },
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

    // Relatório de Usuários
    static async generateUsersReportExcel(req, res) {
        try {
            const users = await queryAsync(`
                SELECT 
                    u.idUser, u.name, u.email, u.role, u.isActive, 
                    COUNT(t.idTransaction) AS totalTransactions
                FROM user u
                LEFT JOIN transactions t ON u.idUser = t.fkIdUser
                GROUP BY u.idUser, u.name, u.email, u.role, u.isActive
                ORDER BY totalTransactions DESC
            `);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Usuários");

            worksheet.columns = [
                { header: "ID", key: "idUser", width: 10 },
                { header: "Nome", key: "name", width: 30 },
                { header: "Email", key: "email", width: 30 },
                { header: "Papel", key: "role", width: 15 },
                { header: "Ativo", key: "isActive", width: 10 },
                { header: "Total de Transações", key: "totalTransactions", width: 20 },
            ];

            users.forEach(user => {
                worksheet.addRow({
                    ...user,
                    isActive: user.isActive ? "Sim" : "Não"
                });
            });

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=relatorio_usuarios.xlsx");

            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao gerar relatório de usuários em Excel." });
        }
    }

    // Relatório de Itens por Localização
static async generateItemsByLocationReportExcel(req, res) {
    try {
        const items = await queryAsync(`
            SELECT 
                i.idItem,
                i.name AS itemName,
                i.brand,
                i.description,
                i.minimumStock,
                c.categoryValue AS category,
                l.lotNumber,
                l.quantity,
                l.expirationDate,
                loc.place,
                loc.code
            FROM item i
            LEFT JOIN category c ON i.fkIdCategory = c.idCategory
            LEFT JOIN lots l ON i.idItem = l.fkIdItem
            LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation
            ORDER BY loc.place, loc.code, i.name
        `);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Itens por Localização");

        worksheet.columns = [
            { header: "ID Item", key: "idItem", width: 10 },
            { header: "Nome", key: "itemName", width: 30 },
            { header: "Marca", key: "brand", width: 20 },
            { header: "Descrição", key: "description", width: 40 },
            { header: "Categoria", key: "category", width: 20 },
            { header: "Estoque Mínimo", key: "minimumStock", width: 18 },
            { header: "Lote", key: "lotNumber", width: 10 },
            { header: "Quantidade", key: "quantity", width: 15 },
            { header: "Validade", key: "expirationDate", width: 15 },
            { header: "Local", key: "location", width: 25 },
        ];

        items.forEach(item => {
            worksheet.addRow({
                ...item,
                expirationDate: item.expirationDate 
                    ? new Date(item.expirationDate).toLocaleDateString("pt-BR") 
                    : "Sem validade",
                location: item.place 
                    ? `${item.place} - ${item.code}` 
                    : "Sem localização"
            });
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=relatorio_itens_por_localizacao.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao gerar relatório de itens por localização em Excel." });
    }
}
};
