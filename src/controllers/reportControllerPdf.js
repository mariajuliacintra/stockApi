const PDFDocument = require("pdfkit");
const { queryAsync } = require("../utils/functions");

function formatAction(action) {
    switch (action) {
        case "IN": return "Entrada";
        case "OUT": return "Saída";
        case "AJUST": return "Ajuste";
        default: return action;
    }
}

module.exports = class ReportControllerPdf {

    // ================== RELATÓRIO GERAL ==================
static async generateGeneralReport(req, res) {
    try {
        // Query de itens (ajustada para funcionar com ONLY_FULL_GROUP_BY)
        const items = await queryAsync(`
            SELECT 
                i.idItem, 
                i.name, 
                i.brand, 
                i.description, 
                i.sapCode, 
                i.minimumStock,
                c.categoryValue AS category,
                GROUP_CONCAT(DISTINCT CONCAT(l.place, ' - ', l.code) SEPARATOR ', ') AS locations,
                GROUP_CONCAT(DISTINCT CONCAT(ts.technicalSpecKey, ': ', ispec.specValue) SEPARATOR ', ') AS specs
            FROM item i
            LEFT JOIN category c ON i.fkIdCategory = c.idCategory
            LEFT JOIN itemSpec ispec ON i.idItem = ispec.fkIdItem
            LEFT JOIN technicalSpec ts ON ispec.fkIdTechnicalSpec = ts.idTechnicalSpec
            LEFT JOIN lots lot ON i.idItem = lot.fkIdItem
            LEFT JOIN location l ON lot.fkIdLocation = l.idLocation
            GROUP BY i.idItem, c.categoryValue
            ORDER BY c.categoryValue, i.name
        `);

        // Criação do PDF
        const doc = new PDFDocument({ margin: 30, size: "A4" });
        res.setHeader("Content-Disposition", "attachment; filename=relatorioGeral.pdf");
        res.setHeader("Content-Type", "application/pdf");
        doc.pipe(res);

        // --- Título do relatório ---
        doc.fillColor("#1F4E79").fontSize(22).text("Relatório Geral do Estoque", { align: "center" });
        doc.moveDown(1.5);

        // --- Itens agrupados por categoria ---
        const groupedItems = items.reduce((acc, item) => {
            acc[item.category] = acc[item.category] || [];
            acc[item.category].push(item);
            return acc;
        }, {});

        let firstCategory = true;
        for (const [category, group] of Object.entries(groupedItems)) {
            if (!firstCategory) doc.addPage();
            firstCategory = false;

            doc.fontSize(16).fillColor("#1F4E79").text(category.toUpperCase(), { underline: true });
            doc.moveDown(0.5);

            // Cabeçalho da tabela
            const tableTop = doc.y + 5;
            const itemColX = 50;
            const brandColX = 150;
            const sapColX = 230;
            const minStockColX = 300;
            const locationColX = 370;
            const specsColX = 470;

            doc.fontSize(12).fillColor("#1F4E79").font("Helvetica-Bold");
            doc.text("Nome", itemColX, tableTop);
            doc.text("Marca", brandColX, tableTop);
            doc.text("SAP", sapColX, tableTop);
            doc.text("Estq. min", minStockColX, tableTop);
            doc.text("Localizações", locationColX, tableTop);
            doc.text("Especificações", specsColX, tableTop);
            doc.moveTo(itemColX, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // Linhas de dados
            let rowY = tableTop + 20;
            group.forEach(i => {
                doc.fillColor("#000").font("Helvetica").fontSize(10);
                doc.text(i.name, itemColX, rowY, { width: brandColX - itemColX - 5 });
                doc.text(i.brand || "-", brandColX, rowY, { width: sapColX - brandColX - 5 });
                doc.text(i.sapCode || "-", sapColX, rowY, { width: minStockColX - sapColX - 5 });
                doc.text(
                    i.minimumStock !== null ? i.minimumStock.toString() : "-",
                    minStockColX,
                    rowY,
                    { width: locationColX - minStockColX - 5 }
                );
                doc.text(i.locations || "-", locationColX, rowY, { width: specsColX - locationColX - 5 });
                doc.text(i.specs || "-", specsColX, rowY, { width: 550 - specsColX });
                rowY += 20;

                // Quebra automática de página
                if (rowY > 750) {
                    doc.addPage();
                    rowY = 50;
                }
            });
        }

        // Finaliza e envia o PDF
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
                i.idItem, i.name, i.brand, i.minimumStock,
                c.categoryValue AS category,
                SUM(lot.quantity) AS totalQuantity,
                GROUP_CONCAT(DISTINCT CONCAT(l.place, ' - ', l.code) SEPARATOR ', ') AS locations
            FROM item i
            LEFT JOIN category c ON i.fkIdCategory = c.idCategory
            LEFT JOIN lots lot ON i.idItem = lot.fkIdItem
            LEFT JOIN location l ON lot.fkIdLocation = l.idLocation
            GROUP BY i.idItem, c.categoryValue
            HAVING totalQuantity <= i.minimumStock
            ORDER BY totalQuantity ASC, i.name
        `);

        const doc = new PDFDocument({ margin: 30, size: "A4" });
        res.setHeader("Content-Disposition", "attachment; filename=relatorioEstoqueBaixo.pdf");
        res.setHeader("Content-Type", "application/pdf");
        doc.pipe(res);

        doc.fillColor("#B22222").fontSize(22).text("Relatório de Estoque Baixo", { align: "center" });
        doc.moveDown(1.5);

        if (!lowStock.length) {
            doc.fillColor("#000").text("Nenhum item abaixo do estoque mínimo.");
        } else {
            // Cabeçalho da tabela
            const tableTop = doc.y + 5;
            const nameColX = 50;
            const brandColX = 180;
            const categoryColX = 270;
            const qtyColX = 360;
            const minStockColX = 430;
            const locationsColX = 500;

            doc.fontSize(12).fillColor("#B22222").font("Helvetica-Bold");
            doc.text("Nome", nameColX, tableTop);
            doc.text("Marca", brandColX, tableTop);
            doc.text("Categoria", categoryColX, tableTop);
            doc.text("Qtd Total", qtyColX, tableTop);
            doc.text("Etq Min", minStockColX, tableTop);
            doc.text("Loc", locationsColX, tableTop);
            doc.moveTo(nameColX, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            let rowY = tableTop + 20;
            lowStock.forEach(i => {
                doc.font("Helvetica").fillColor("#000").fontSize(10);
                doc.text(i.name, nameColX, rowY, { width: brandColX - nameColX - 5 });
                doc.text(i.brand || "-", brandColX, rowY, { width: categoryColX - brandColX - 5 });
                doc.text(i.category, categoryColX, rowY, { width: qtyColX - categoryColX - 5 });
                doc.text(i.totalQuantity.toString(), qtyColX, rowY, { width: minStockColX - qtyColX - 5 });
                doc.text(i.minimumStock !== null ? i.minimumStock.toString() : "-", minStockColX, rowY, { width: locationsColX - minStockColX - 5 });
                doc.text(i.locations || "-", locationsColX, rowY, { width: 550 - locationsColX });
                rowY += 20;

                if (rowY > 750) {
                    doc.addPage();
                    rowY = 50;
                }
            });
        }

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao gerar relatório de estoque baixo" });
    }
}

// ================== RELATÓRIO DE TRANSAÇÕES ==================
static async generateTransactionsReport(req, res) {
    try {
        const transactions = await queryAsync(`
            SELECT 
                t.transactionDate, t.actionDescription, t.quantityChange,
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
        res.setHeader("Content-Disposition", "attachment; filename=relatorioTransacoes.pdf");
        res.setHeader("Content-Type", "application/pdf");
        doc.pipe(res);

        doc.fillColor("#1F4E79").fontSize(22).text("Relatório de Transações", { align: "center" });
        doc.moveDown(1.5);

        if (!transactions.length) {
            doc.fillColor("#000").text("Nenhuma transação registrada.");
        } else {
            const tableTop = doc.y + 5;
            const dateColX = 50;
            const userColX = 150;
            const itemColX = 270;
            const actionColX = 420;
            const qtyColX = 500;

            // Cabeçalho
            doc.fontSize(12).fillColor("#1F4E79").font("Helvetica-Bold");
            doc.text("Data", dateColX, tableTop);
            doc.text("Usuário", userColX, tableTop);
            doc.text("Item", itemColX, tableTop);
            doc.text("Ação", actionColX, tableTop);
            doc.text("Qtd", qtyColX, tableTop);
            doc.moveTo(dateColX, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            let rowY = tableTop + 20;
            transactions.forEach(tx => {
                doc.font("Helvetica").fillColor("#000").fontSize(10);
                doc.text(new Date(tx.transactionDate).toLocaleString(), dateColX, rowY, { width: userColX - dateColX - 5 });
                doc.text(tx.userName, userColX, rowY, { width: itemColX - userColX - 5 });
                doc.text(`${tx.category} - ${tx.itemName}`, itemColX, rowY, { width: actionColX - itemColX - 5 });
                doc.text(formatAction(tx.actionDescription), actionColX, rowY, { width: qtyColX - actionColX - 5 });
                doc.text(tx.quantityChange.toString(), qtyColX, rowY);
                rowY += 20;

                if (rowY > 750) {
                    doc.addPage();
                    rowY = 50;

                    // Cabeçalho repetido
                    doc.fontSize(12).fillColor("#1F4E79").font("Helvetica-Bold");
                    doc.text("Data", dateColX, rowY);
                    doc.text("Usuário", userColX, rowY);
                    doc.text("Item", itemColX, rowY);
                    doc.text("Ação", actionColX, rowY);
                    doc.text("Qtd", qtyColX, rowY);
                    doc.moveTo(dateColX, rowY + 15).lineTo(550, rowY + 15).stroke();
                    rowY += 20;
                }
            });
        }

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao gerar relatório de transações" });
    }
}

};
