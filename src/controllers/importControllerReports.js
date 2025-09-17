const { queryAsync } = require("../utils/functions");
const ExcelJS = require("exceljs");

module.exports = class ImportControllerReports {
    static async importItemsFromExcel(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "Nenhum arquivo enviado." });
            }

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(req.file.buffer);
            const worksheet = workbook.worksheets[0]; // pegar a primeira aba

            const itemsToInsert = [];
            const lotsToInsert = [];

            // Assumindo que a planilha tem colunas: Nome, Marca, Descrição, Categoria, Lote, Quantidade, Local
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // pular header

                const [
                    name,
                    brand,
                    description,
                    categoryValue,
                    lotNumber,
                    quantity,
                    locationCode
                ] = row.values.slice(1); // row.values[0] é undefined

                if (!name || !categoryValue) return; // ignorar linhas inválidas

                itemsToInsert.push({ name, brand, description, categoryValue });
                lotsToInsert.push({ lotNumber, quantity, locationCode, itemName: name });
            });

            // Inserir categorias se não existirem
            const categories = [...new Set(itemsToInsert.map(i => i.categoryValue))];
            for (const cat of categories) {
                await queryAsync(`
                    INSERT IGNORE INTO category (categoryValue)
                    VALUES (?)
                `, [cat]);
            }

            // Inserir locais se não existirem
            const locations = [...new Set(lotsToInsert.map(l => l.locationCode))];
            for (const loc of locations) {
                const [place, code] = loc.split(" - "); // assumindo que vem nesse formato
                await queryAsync(`
                    INSERT IGNORE INTO location (place, code)
                    VALUES (?, ?)
                `, [place, code]);
            }

            // Inserir itens
            for (const item of itemsToInsert) {
                // pegar id da categoria
                const category = await queryAsync(`SELECT idCategory FROM category WHERE categoryValue = ?`, [item.categoryValue]);
                const result = await queryAsync(`
                    INSERT INTO item (name, brand, description, fkIdCategory)
                    VALUES (?, ?, ?, ?)
                `, [item.name, item.brand, item.description, category[0].idCategory]);
            }

            // Inserir lots
            for (const lot of lotsToInsert) {
                // pegar id do item
                const item = await queryAsync(`SELECT idItem FROM item WHERE name = ?`, [lot.itemName]);
                // pegar id do location
                const locValues = lot.locationCode.split(" - ");
                const location = await queryAsync(`SELECT idLocation FROM location WHERE place = ? AND code = ?`, locValues);

                await queryAsync(`
                    INSERT INTO lots (lotNumber, quantity, fkIdItem, fkIdLocation)
                    VALUES (?, ?, ?, ?)
                `, [lot.lotNumber, lot.quantity, item[0].idItem, location[0].idLocation]);
            }

            res.status(200).json({ message: "Itens importados com sucesso." });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao importar itens do Excel." });
        }
    }
};
