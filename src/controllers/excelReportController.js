const { queryAsync } = require("../utils/functions");
const ExcelJS = require("exceljs");

module.exports = class ReportController {
    static async generateDashboardReport(req, res) {
        try {
            const workbook = new ExcelJS.Workbook();

            // ================================
            // 0) RESUMO
            // ================================
            const resumoSheet = workbook.addWorksheet("Resumo");
            resumoSheet.columns = [
                { header: "Categoria", key: "category", width: 30 },
                { header: "Total Itens", key: "total", width: 20 }
            ];

            const categories = [
                { name: "Ferramentas", table: "tool", id: "idTool" },
                { name: "Materiais", table: "material", id: "idMaterial" },
                { name: "Matérias-primas", table: "rawMaterial", id: "idRawMaterial" },
                { name: "Equipamentos", table: "equipment", id: "idEquipment" },
                { name: "Produtos", table: "product", id: "idProduct" },
                { name: "Diversos", table: "diverses", id: "idDiverses" }
            ];

            // Totais por categoria
            for (const cat of categories) {
                const query = `SELECT SUM(quantity) AS total FROM ${cat.table}`;
                const [row] = await queryAsync(query);
                resumoSheet.addRow({ category: cat.name, total: row.total || 0 });
            }

            // Linha em branco
            resumoSheet.addRow({});
            resumoSheet.addRow({ category: "=== Totais por Localização ===" });

            // Totais por localização
            const locationsQuery = `
                SELECT l.place AS location, SUM(
                    COALESCE(t.quantity,0) +
                    COALESCE(m.quantity,0) +
                    COALESCE(rm.quantity,0) +
                    COALESCE(e.quantity,0) +
                    COALESCE(p.quantity,0) +
                    COALESCE(dv.quantity,0)
                ) AS total
                FROM location l
                LEFT JOIN tool t ON l.idLocation = t.fkIdLocation
                LEFT JOIN material m ON l.idLocation = m.fkIdLocation
                LEFT JOIN rawMaterial rm ON l.idLocation = rm.fkIdLocation
                LEFT JOIN equipment e ON l.idLocation = e.fkIdLocation
                LEFT JOIN product p ON l.idLocation = p.fkIdLocation
                LEFT JOIN diverses dv ON l.idLocation = dv.fkIdLocation
                GROUP BY l.idLocation, l.place
                ORDER BY l.place
            `;
            const locations = await queryAsync(locationsQuery);
            locations.forEach(loc => {
                resumoSheet.addRow({ category: loc.location, total: loc.total || 0 });
            });

            resumoSheet.getRow(1).font = { bold: true };

            // ================================
            // 1) RELATÓRIO GERAL
            // ================================
            const generalSheet = workbook.addWorksheet("Geral");
            generalSheet.columns = [
                { header: "Categoria", key: "category", width: 20 },
                { header: "ID", key: "id", width: 10 },
                { header: "Nome", key: "name", width: 30 },
                { header: "Descrição", key: "description", width: 40 },
                { header: "Quantidade", key: "quantity", width: 15 },
                { header: "Localização", key: "location", width: 20 }
            ];

            for (const cat of categories) {
                const query = `
                    SELECT 
                        t.${cat.id} AS id,
                        t.name,
                        t.description,
                        t.quantity,
                        l.place AS location
                    FROM ${cat.table} t
                    LEFT JOIN location l ON t.fkIdLocation = l.idLocation
                `;
                const rows = await queryAsync(query);
                rows.forEach(item => {
                    generalSheet.addRow({
                        category: cat.name,
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        quantity: item.quantity,
                        location: item.location
                    });
                });
            }

            // ================================
            // 2) RELATÓRIO POR LOCALIZAÇÃO
            // ================================
            const locationSheet = workbook.addWorksheet("Por Localização");
            locationSheet.columns = [
                { header: "Localização", key: "location", width: 20 },
                { header: "Categoria", key: "category", width: 20 },
                { header: "Nome", key: "name", width: 30 },
                { header: "Quantidade", key: "quantity", width: 15 }
            ];

            for (const cat of categories) {
                const query = `
                    SELECT 
                        l.place AS location,
                        t.name,
                        t.quantity
                    FROM ${cat.table} t
                    LEFT JOIN location l ON t.fkIdLocation = l.idLocation
                `;
                const rows = await queryAsync(query);
                rows.forEach(item => {
                    locationSheet.addRow({
                        location: item.location,
                        category: cat.name,
                        name: item.name,
                        quantity: item.quantity
                    });
                });
            }

            // ================================
            // 3) RELATÓRIO ESTOQUE BAIXO
            // ================================
            const lowStockSheet = workbook.addWorksheet("Estoque Baixo");
            lowStockSheet.columns = [
                { header: "Categoria", key: "category", width: 20 },
                { header: "Nome", key: "name", width: 30 },
                { header: "Quantidade", key: "quantity", width: 15 },
                { header: "Localização", key: "location", width: 20 }
            ];

            for (const cat of categories) {
                const query = `
                    SELECT 
                        t.name,
                        t.quantity,
                        l.place AS location
                    FROM ${cat.table} t
                    LEFT JOIN location l ON t.fkIdLocation = l.idLocation
                    WHERE t.quantity < 10
                `;
                const rows = await queryAsync(query);
                rows.forEach(item => {
                    lowStockSheet.addRow({
                        category: cat.name,
                        name: item.name,
                        quantity: item.quantity,
                        location: item.location
                    });
                });
            }

            // ================================
            // 4) RELATÓRIO MOVIMENTAÇÕES
            // ================================
            const movementSheet = workbook.addWorksheet("Movimentações");
            movementSheet.columns = [
                { header: "Data", key: "date", width: 20 },
                { header: "Categoria", key: "category", width: 20 },
                { header: "Item", key: "item", width: 30 },
                { header: "Tipo", key: "type", width: 15 },
                { header: "Qtd Alterada", key: "quantityChange", width: 15 },
                { header: "Qtd Antiga", key: "oldQuantity", width: 15 },
                { header: "Qtd Nova", key: "newQuantity", width: 15 },
                { header: "Usuário", key: "user", width: 25 }
            ];

            const movementsQuery = `
                SELECT 
                    tr.transactionDate AS date,
                    tr.itemType AS category,
                    COALESCE(t.name, m.name, rm.name, e.name, p.name, dv.name) AS item,
                    CASE 
                        WHEN tr.actionDescription = 'IN' THEN 'Entrada'
                        WHEN tr.actionDescription = 'OUT' THEN 'Saída'
                        WHEN tr.actionDescription = 'AJUST' THEN 'Ajuste'
                        ELSE tr.actionDescription
                    END AS type,
                    tr.quantityChange,
                    tr.oldQuantity,
                    tr.newQuantity,
                    u.name AS user
                FROM transactions tr
                LEFT JOIN user u ON tr.fkIdUser = u.idUser
                LEFT JOIN tool t ON (tr.itemType = 'tool' AND tr.itemId = t.idTool)
                LEFT JOIN material m ON (tr.itemType = 'material' AND tr.itemId = m.idMaterial)
                LEFT JOIN rawMaterial rm ON (tr.itemType = 'rawMaterial' AND tr.itemId = rm.idRawMaterial)
                LEFT JOIN equipment e ON (tr.itemType = 'equipment' AND tr.itemId = e.idEquipment)
                LEFT JOIN product p ON (tr.itemType = 'product' AND tr.itemId = p.idProduct)
                LEFT JOIN diverses dv ON (tr.itemType = 'diverses' AND tr.itemId = dv.idDiverses)
                ORDER BY tr.transactionDate DESC
            `;
            const movements = await queryAsync(movementsQuery);
            movements.forEach(m => movementSheet.addRow(m));

            // ================================
            // FINALIZAR EXCEL
            // ================================
            const buffer = await workbook.xlsx.writeBuffer();
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=relatorio_dashboard.xlsx");
            res.send(buffer);

        } catch (err) {
            console.error("Erro ao gerar relatório de dashboard em Excel:", err);
            res.status(500).json({ error: err.message });
        }
    }
};
