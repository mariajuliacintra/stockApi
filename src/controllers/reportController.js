const PDFDocument = require("pdfkit");
const { queryAsync } = require("../utils/functions");

module.exports = class ReportController {
    // Relatório Geral
    static async generateGeneralReport(req, res) {
        try {
            const tools = await queryAsync("SELECT * FROM tool");
            const materials = await queryAsync("SELECT * FROM material");
            const rawMaterials = await queryAsync("SELECT * FROM rawMaterial");
            const equipments = await queryAsync("SELECT * FROM equipment");
            const products = await queryAsync("SELECT * FROM product");
            const diverses = await queryAsync("SELECT * FROM diverses");
            const transactions = await queryAsync("SELECT * FROM transactions");
            const users = await queryAsync("SELECT idUser, name, email, role, createdAt FROM user");
            const locations = await queryAsync("SELECT * FROM location");

            const doc = new PDFDocument({ margin: 30, size: "A4" });
            res.setHeader("Content-Disposition", "attachment; filename=relatorio_geral.pdf");
            res.setHeader("Content-Type", "application/pdf");
            doc.pipe(res);

            doc.fontSize(20).fillColor("black").text("Relatório Geral do Estoque", { align: "center" });
            doc.moveDown(2);

            // Localizações
            if (locations.length) {
                doc.fontSize(16).text("Localizações", { underline: true });
                doc.moveDown(0.5);
                locations.forEach(row => {
                    doc.font("Helvetica-Bold").text("• idLocation: ", { continued: true });
                    doc.font("Helvetica").text(`${row.idLocation}, place: ${row.place}, code: ${row.code}`);
                });
                doc.moveDown(1);
            }

            // Usuários
            if (users.length) {
                doc.fontSize(16).text("Usuários", { underline: true });
                doc.moveDown(0.5);
                users.forEach(row => {
                    doc.font("Helvetica-Bold").text("• idUser: ", { continued: true });
                    doc.font("Helvetica").text(`${row.idUser}, name: ${row.name}, email: ${row.email}, role: ${row.role}, criado em: ${row.createdAt}`);
                });
                doc.moveDown(1);
            }

            // Ferramentas
            if (tools.length) {
                doc.fontSize(16).text("Ferramentas", { underline: true });
                doc.moveDown(0.5);
                tools.forEach(row => {
                    doc.font("Helvetica-Bold").text("• ", { continued: true });
                    doc.font("Helvetica").text(`name: ${row.name}, brand: ${row.brand}, quantity: ${row.quantity}, fkIdLocation: ${row.fkIdLocation}`);
                });
                doc.moveDown(1);
            }

            // Materiais
            if (materials.length) {
                doc.fontSize(16).text("Materiais", { underline: true });
                doc.moveDown(0.5);
                materials.forEach(row => {
                    doc.font("Helvetica-Bold").text("• ", { continued: true });
                    doc.font("Helvetica").text(`name: ${row.name}, brand: ${row.brand}, quantity: ${row.quantity}, fkIdLocation: ${row.fkIdLocation}`);
                });
                doc.moveDown(1);
            }

            // Matéria-prima
            if (rawMaterials.length) {
                doc.fontSize(16).text("Matéria-Prima", { underline: true });
                doc.moveDown(0.5);
                rawMaterials.forEach(row => {
                    doc.font("Helvetica-Bold").text("• ", { continued: true });
                    doc.font("Helvetica").text(`name: ${row.name}, brand: ${row.brand}, quantity: ${row.quantity}, fkIdLocation: ${row.fkIdLocation}`);
                });
                doc.moveDown(1);
            }

            // Equipamentos
            if (equipments.length) {
                doc.fontSize(16).text("Equipamentos", { underline: true });
                doc.moveDown(0.5);
                equipments.forEach(row => {
                    doc.font("Helvetica-Bold").text("• ", { continued: true });
                    doc.font("Helvetica").text(`name: ${row.name}, brand: ${row.brand}, quantity: ${row.quantity}, fkIdLocation: ${row.fkIdLocation}`);
                });
                doc.moveDown(1);
            }

            // Produtos
            if (products.length) {
                doc.fontSize(16).text("Produtos", { underline: true });
                doc.moveDown(0.5);
                products.forEach(row => {
                    doc.font("Helvetica-Bold").text("• ", { continued: true });
                    doc.font("Helvetica").text(`name: ${row.name}, brand: ${row.brand}, quantity: ${row.quantity}, fkIdLocation: ${row.fkIdLocation}`);
                });
                doc.moveDown(1);
            }

            // Diversos
            if (diverses.length) {
                doc.fontSize(16).text("Diversos", { underline: true });
                doc.moveDown(0.5);
                diverses.forEach(row => {
                    doc.font("Helvetica-Bold").text("• ", { continued: true });
                    doc.font("Helvetica").text(`name: ${row.name}, brand: ${row.brand}, quantity: ${row.quantity}, fkIdLocation: ${row.fkIdLocation}`);
                });
                doc.moveDown(1);
            }

            // Transações
            if (transactions.length) {
                doc.fontSize(16).text("Transações", { underline: true });
                doc.moveDown(0.5);
                transactions.forEach(row => {
                    doc.font("Helvetica-Bold").text("• idTransaction: ", { continued: true });
                    doc.font("Helvetica").text(`${row.idTransaction}, fkIdUser: ${row.fkIdUser}, itemType: ${row.itemType}, itemId: ${row.itemId}, ação: ${row.actionDescription}, quantidade: ${row.quantityChange}, data: ${row.transactionDate}`);
                });
                doc.moveDown(1);
            }

            doc.end();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao gerar relatório geral" });
        }
    }

    // === Outros relatórios (já prontos) ===
    static async generateLowStockReport(req, res) {
        try {
            const lowStock = await queryAsync("SELECT * FROM tool WHERE quantity < 5");
            const doc = new PDFDocument({ margin: 30, size: "A4" });
            res.setHeader("Content-Disposition", "attachment; filename=relatorio_baixo_estoque.pdf");
            res.setHeader("Content-Type", "application/pdf");
            doc.pipe(res);

            doc.fontSize(20).fillColor("black").text("Relatório de Itens com Baixo Estoque", { align: "center" });
            doc.moveDown(2);

            if (!lowStock.length) {
                doc.text("Nenhum item com baixo estoque.");
            } else {
                lowStock.forEach(row => {
                    doc.font("Helvetica-Bold").text("• ", { continued: true });
                    doc.font("Helvetica").text(`name: ${row.name}, brand: ${row.brand}, quantity: ${row.quantity}`);
                });
            }

            doc.end();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao gerar relatório de baixo estoque" });
        }
    }

    // (idem para os outros relatórios que já fiz na versão anterior)
};
