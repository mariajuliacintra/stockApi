const PDFDocument = require("pdfkit");
const { queryAsync } = require("../utils/functions");

module.exports = class ReportController {
    static async generateGeneralReport(req, res) {
        try {
            // Dados do estoque
            const tools = await queryAsync("SELECT name, brand, quantity, fkIdLocation FROM tool");
            const materials = await queryAsync("SELECT name, brand, quantity, fkIdLocation FROM material");
            const rawMaterials = await queryAsync("SELECT name, brand, quantity, fkIdLocation FROM rawMaterial");
            const equipments = await queryAsync("SELECT name, brand, quantity, fkIdLocation FROM equipment");
            const products = await queryAsync("SELECT name, brand, quantity, fkIdLocation FROM product");
            const diverses = await queryAsync("SELECT name, brand, quantity, fkIdLocation FROM diverses");
            const users = await queryAsync("SELECT idUser, name, role FROM user");
            const locations = await queryAsync("SELECT idLocation, place, code FROM location");

            // Últimas 20 transações com nome do usuário e nome do item
            const transactions = await queryAsync(`
                SELECT 
                    t.transactionDate,
                    t.actionDescription,
                    t.itemType,
                    t.quantityChange,
                    u.name AS userName,
                    CASE 
                        WHEN t.itemType = 'tool' THEN tool.name
                        WHEN t.itemType = 'material' THEN material.name
                        WHEN t.itemType = 'rawMaterial' THEN rawMaterial.name
                        WHEN t.itemType = 'equipment' THEN equipment.name
                        WHEN t.itemType = 'product' THEN product.name
                        WHEN t.itemType = 'diverses' THEN diverses.name
                    END AS itemName
                FROM transactions t
                LEFT JOIN user u ON t.fkIdUser = u.idUser
                LEFT JOIN tool ON t.itemType = 'tool' AND t.itemId = tool.idTool
                LEFT JOIN material ON t.itemType = 'material' AND t.itemId = material.idMaterial
                LEFT JOIN rawMaterial ON t.itemType = 'rawMaterial' AND t.itemId = rawMaterial.idRawMaterial
                LEFT JOIN equipment ON t.itemType = 'equipment' AND t.itemId = equipment.idEquipment
                LEFT JOIN product ON t.itemType = 'product' AND t.itemId = product.idProduct
                LEFT JOIN diverses ON t.itemType = 'diverses' AND t.itemId = diverses.idDiverses
                ORDER BY t.transactionDate DESC
                LIMIT 20;
            `);

            // Criar PDF
            const doc = new PDFDocument({ margin: 30, size: "A4" });
            res.setHeader("Content-Disposition", "attachment; filename=relatorio_geral.pdf");
            res.setHeader("Content-Type", "application/pdf");
            doc.pipe(res);

            // Título principal
            doc.fontSize(20).fillColor("#000").text("Relatório Geral do Estoque", { align: "center" });
            doc.moveDown(2);

            // Função para adicionar seções ao PDF
            const addSection = (title, data, attributes) => {
                if (!data.length) return;

                doc.fontSize(16).fillColor("#000").text(title, { underline: true });
                doc.moveDown(0.5);

                data.forEach(row => {
                    doc.font("Helvetica-Bold").fillColor("#000").text("• ", { continued: true });

                    attributes.forEach((attr, index) => {
                        doc.font("Helvetica-Bold").fillColor("#000").text(`${attr}: `, { continued: true });
                        doc.font("Helvetica").fillColor("#000").text(`${row[attr]}`, { continued: index < attributes.length - 1 });
                        if (index < attributes.length - 1) {
                            doc.font("Helvetica").fillColor("#000").text("; ", { continued: true });
                        }
                    });

                    doc.text(""); // quebra de linha
                });

                doc.moveDown(1);
            };

            // Adicionar seções
            addSection("Localizações", locations, ["idLocation", "place", "code"]);
            addSection("Usuários", users, ["idUser", "name", "role"]);
            addSection("Ferramentas", tools, ["name", "brand", "quantity", "fkIdLocation"]);
            addSection("Materiais", materials, ["name", "brand", "quantity", "fkIdLocation"]);
            addSection("Matéria-Prima", rawMaterials, ["name", "brand", "quantity", "fkIdLocation"]);
            addSection("Equipamentos", equipments, ["name", "brand", "quantity", "fkIdLocation"]);
            addSection("Produtos", products, ["name", "brand", "quantity", "fkIdLocation"]);
            addSection("Diversos", diverses, ["name", "brand", "quantity", "fkIdLocation"]);
            addSection("Últimas Transações", transactions, [
                "transactionDate",
                "actionDescription",
                "itemType",
                "itemName",
                "quantityChange",
                "userName"
            ]);

            doc.end();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao gerar relatório" });
        }
    }

    static async generateLowStockReport(req, res) {
        try {
            // Definindo limite de estoque baixo (pode ser parametrizado)
            const lowStockLimitInt = 10; // para itens inteiros
            const lowStockLimitDecimal = 20.0; // para itens decimais

            // Consultas SQL com join para trazer a localização
            const tools = await queryAsync(
                `SELECT t.name, t.brand, t.quantity, l.place, l.code
                 FROM tool t
                 LEFT JOIN location l ON t.fkIdLocation = l.idLocation
                 WHERE t.quantity <= ?`, [lowStockLimitInt]
            );

            const materials = await queryAsync(
                `SELECT m.name, m.brand, m.quantity, l.place, l.code
                 FROM material m
                 LEFT JOIN location l ON m.fkIdLocation = l.idLocation
                 WHERE m.quantity <= ?`, [lowStockLimitDecimal]
            );

            const rawMaterials = await queryAsync(
                `SELECT r.name, r.brand, r.quantity, l.place, l.code
                 FROM rawMaterial r
                 LEFT JOIN location l ON r.fkIdLocation = l.idLocation
                 WHERE r.quantity <= ?`, [lowStockLimitDecimal]
            );

            const equipments = await queryAsync(
                `SELECT e.name, e.brand, e.quantity, l.place, l.code
                 FROM equipment e
                 LEFT JOIN location l ON e.fkIdLocation = l.idLocation
                 WHERE e.quantity <= ?`, [lowStockLimitInt]
            );

            const products = await queryAsync(
                `SELECT p.name, p.brand, p.quantity, l.place, l.code
                 FROM product p
                 LEFT JOIN location l ON p.fkIdLocation = l.idLocation
                 WHERE p.quantity <= ?`, [lowStockLimitInt]
            );

            const diverses = await queryAsync(
                `SELECT d.name, d.brand, d.quantity, l.place, l.code
                 FROM diverses d
                 LEFT JOIN location l ON d.fkIdLocation = l.idLocation
                 WHERE d.quantity <= ?`, [lowStockLimitDecimal]
            );

            // Criando PDF
            const doc = new PDFDocument({ margin: 30, size: "A4" });
            res.setHeader("Content-Disposition", "attachment; filename=relatorio_estoque_baixo.pdf");
            res.setHeader("Content-Type", "application/pdf");
            doc.pipe(res);

            doc.fontSize(20).fillColor("#000").text("Relatório de Estoque Baixo", { align: "center" });
            doc.moveDown(2);

            const addSection = (title, data) => {
                if (!data.length) return;

                doc.fontSize(16).fillColor("#000").text(title, { underline: true });
                doc.moveDown(0.5);

                data.forEach(item => {
                    doc.font("Helvetica-Bold").text("• Nome: ", { continued: true });
                    doc.font("Helvetica").text(item.name, { continued: true });
                    doc.font("Helvetica-Bold").text("; Marca: ", { continued: true });
                    doc.font("Helvetica").text(item.brand, { continued: true });
                    doc.font("Helvetica-Bold").text("; Quantidade: ", { continued: true });
                    doc.font("Helvetica").text(item.quantity, { continued: true });
                    doc.font("Helvetica-Bold").text("; Localização: ", { continued: true });
                    doc.font("Helvetica").text(`${item.place} - ${item.code}`);
                });

                doc.moveDown(1);
            };

            addSection("Ferramentas", tools);
            addSection("Materiais", materials);
            addSection("Matéria-Prima", rawMaterials);
            addSection("Equipamentos", equipments);
            addSection("Produtos", products);
            addSection("Diversos", diverses);

            doc.end();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao gerar relatório de estoque baixo" });
        }
    }

    static async generateTransactionsReport(req, res) {
    try {
        // Buscar as últimas 50 transações, já com JOIN para nome do usuário
        const transactions = await queryAsync(
            `SELECT t.transactionDate, t.actionDescription, t.itemType, t.itemId, t.quantityChange, 
                    u.name AS userName
             FROM transactions t
             LEFT JOIN user u ON t.fkIdUser = u.idUser
             ORDER BY t.transactionDate DESC
             LIMIT 50`
        );

        // Buscar todos os itens de cada tipo para poder substituir itemId por nome
        const [tools, materials, rawMaterials, equipments, products, diverses] = await Promise.all([
            queryAsync("SELECT idTool, name FROM tool"),
            queryAsync("SELECT idMaterial, name FROM material"),
            queryAsync("SELECT idRawMaterial, name FROM rawMaterial"),
            queryAsync("SELECT idEquipment, name FROM equipment"),
            queryAsync("SELECT idProduct, name FROM product"),
            queryAsync("SELECT idDiverses, name FROM diverses")
        ]);

        // Map para facilitar lookup
        const itemMaps = {
            tool: Object.fromEntries(tools.map(i => [i.idTool, i.name])),
            material: Object.fromEntries(materials.map(i => [i.idMaterial, i.name])),
            rawMaterial: Object.fromEntries(rawMaterials.map(i => [i.idRawMaterial, i.name])),
            equipment: Object.fromEntries(equipments.map(i => [i.idEquipment, i.name])),
            product: Object.fromEntries(products.map(i => [i.idProduct, i.name])),
            diverses: Object.fromEntries(diverses.map(i => [i.idDiverses, i.name]))
        };

        // Mapeamento das ações para texto legível
        const actionMap = {
            IN: "Entrada",
            OUT: "Saída",
            AJUST: "Ajuste"
        };

        // Criando PDF
        const doc = new PDFDocument({ margin: 30, size: "A4" });
        res.setHeader("Content-Disposition", "attachment; filename=relatorio_transacoes.pdf");
        res.setHeader("Content-Type", "application/pdf");
        doc.pipe(res);

        doc.fontSize(20).fillColor("#000").text("Relatório de Histórico de Transações", { align: "center" });
        doc.moveDown(2);

        if (!transactions.length) {
            doc.fontSize(14).text("Nenhuma transação encontrada.");
        } else {
            transactions.forEach(tx => {
                const itemName = itemMaps[tx.itemType]?.[tx.itemId] || `ID: ${tx.itemId}`;
                const actionText = actionMap[tx.actionDescription] || tx.actionDescription;

                doc.font("Helvetica-Bold").text("• Data: ", { continued: true });
                doc.font("Helvetica").text(new Date(tx.transactionDate).toLocaleString(), { continued: true });

                doc.font("Helvetica-Bold").text("; Usuário: ", { continued: true });
                doc.font("Helvetica").text(tx.userName, { continued: true });

                doc.font("Helvetica-Bold").text("; Item: ", { continued: true });
                doc.font("Helvetica").text(`${tx.itemType} - ${itemName}`, { continued: true });

                doc.font("Helvetica-Bold").text("; Ação: ", { continued: true });
                doc.font("Helvetica").text(actionText, { continued: true });

                doc.font("Helvetica-Bold").text("; Quantidade: ", { continued: true });
                doc.font("Helvetica").text(tx.quantityChange);

                doc.moveDown(0.5);
            });
        }

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao gerar relatório de transações" });
    }
}

static async generateByLocationReport(req, res) {
    try {
        // Buscar todas as localizações
        const locations = await queryAsync("SELECT idLocation, place, code FROM location");

        // Buscar todos os itens
        const [tools, materials, rawMaterials, equipments, products, diverses] = await Promise.all([
            queryAsync("SELECT name, quantity, fkIdLocation FROM tool"),
            queryAsync("SELECT name, quantity, fkIdLocation FROM material"),
            queryAsync("SELECT name, quantity, fkIdLocation FROM rawMaterial"),
            queryAsync("SELECT name, quantity, fkIdLocation FROM equipment"),
            queryAsync("SELECT name, quantity, fkIdLocation FROM product"),
            queryAsync("SELECT name, quantity, fkIdLocation FROM diverses")
        ]);

        // Criar um objeto que agrupa itens por localização
        const locationMap = {};
        locations.forEach(loc => {
            locationMap[loc.idLocation] = {
                place: loc.place,
                code: loc.code,
                items: []
            };
        });

        const addItems = (arr, type) => {
            arr.forEach(item => {
                if (locationMap[item.fkIdLocation]) {
                    locationMap[item.fkIdLocation].items.push({
                        type,
                        name: item.name,
                        quantity: item.quantity
                    });
                }
            });
        };

        addItems(tools, "Ferramenta");
        addItems(materials, "Material");
        addItems(rawMaterials, "Matéria-Prima");
        addItems(equipments, "Equipamento");
        addItems(products, "Produto");
        addItems(diverses, "Diversos");

        // Criando PDF
        const doc = new PDFDocument({ margin: 30, size: "A4" });
        res.setHeader("Content-Disposition", "attachment; filename=relatorio_por_localizacao.pdf");
        res.setHeader("Content-Type", "application/pdf");
        doc.pipe(res);

        doc.fontSize(20).fillColor("#000").text("Relatório de Estoque por Localização", { align: "center" });
        doc.moveDown(2);

        locations.forEach(loc => {
            const locData = locationMap[loc.idLocation];
            doc.fontSize(16).fillColor("#000").text(`${locData.place} - ${locData.code}`, { underline: true });
            doc.moveDown(0.5);

            if (locData.items.length === 0) {
                doc.fontSize(12).text("Nenhum item neste local.");
            } else {
                locData.items.forEach(item => {
                    doc.font("Helvetica-Bold").text("• Tipo: ", { continued: true });
                    doc.font("Helvetica").text(item.type, { continued: true });

                    doc.font("Helvetica-Bold").text("; Nome: ", { continued: true });
                    doc.font("Helvetica").text(item.name, { continued: true });

                    doc.font("Helvetica-Bold").text("; Quantidade: ", { continued: true });
                    doc.font("Helvetica").text(item.quantity);

                    doc.moveDown(0.3);
                });
            }

            doc.moveDown(1);
        });

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao gerar relatório por localização" });
    }
}

static async generateUsersReport(req, res) {
    try {
        // Buscar usuários e quantidade de transações de cada
        const users = await queryAsync(`
            SELECT u.idUser, u.name, u.email, u.role, 
                   COUNT(t.idTransaction) AS totalTransactions
            FROM user u
            LEFT JOIN transactions t ON u.idUser = t.fkIdUser
            GROUP BY u.idUser, u.name, u.email, u.role
            ORDER BY u.name
        `);

        // Criando PDF
        const doc = new PDFDocument({ margin: 30, size: "A4" });
        res.setHeader("Content-Disposition", "attachment; filename=relatorio_usuarios.pdf");
        res.setHeader("Content-Type", "application/pdf");
        doc.pipe(res);

        // Título
        doc.fontSize(20).fillColor("#000").text("Relatório de Usuários", { align: "center" });
        doc.moveDown(2);

        if (!users.length) {
            doc.fontSize(12).text("Nenhum usuário cadastrado.");
        } else {
            users.forEach(user => {
                doc.font("Helvetica-Bold").text("• Nome: ", { continued: true });
                doc.font("Helvetica").text(user.name, { continued: true });

                doc.font("Helvetica-Bold").text("; Email: ", { continued: true });
                doc.font("Helvetica").text(user.email, { continued: true });

                doc.font("Helvetica-Bold").text("; Função: ", { continued: true });
                doc.font("Helvetica").text(user.role, { continued: true });

                doc.font("Helvetica-Bold").text("; Total de Transações: ", { continued: true });
                doc.font("Helvetica").text(user.totalTransactions);

                doc.moveDown(0.5);
            });
        }

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao gerar relatório de usuários" });
    }
}


};
