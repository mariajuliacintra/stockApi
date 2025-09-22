const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

module.exports = class ImportControllerReports {
    static async importItemsExcel(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "Nenhum arquivo enviado" });
            }

            const filePath = path.resolve(req.file.path);
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);

            const worksheet = workbook.worksheets[0]; // pega a primeira aba
            const validRows = [];
            const invalidRows = [];

            // Pega cabeçalhos (linha 1)
            const headers = worksheet.getRow(1).values.slice(1);

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // pula cabeçalho
                const rowData = {};
                row.eachCell((cell, colNumber) => {
                    rowData[headers[colNumber - 1]] = cell.value;
                });

                // Validação dos campos obrigatórios
                const missingFields = [];
                ["name", "brand", "sapCode"].forEach(field => {
                    if (!rowData[field]) missingFields.push(field);
                });

                // Extrai specs opcionais (colunas que não são obrigatórias e não são padrão do item)
                const specs = {};
                headers.forEach(header => {
                    if (!["name", "brand", "sapCode", "description", "minimumStock", "aliases", "fkIdCategory"].includes(header) && rowData[header]) {
                        specs[header] = rowData[header];
                    }
                });

                rowData.itemSpecs = specs; // adiciona specs ao objeto do item

                if (missingFields.length > 0) {
                    invalidRows.push({
                        rowNumber,
                        data: rowData,
                        missingFields
                    });
                } else {
                    validRows.push(rowData);
                }
            });

            // Remove o arquivo após processar
            fs.unlinkSync(filePath);

            return res.status(200).json({
                message: "Arquivo processado com sucesso",
                validRows,
                invalidRows
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao processar o arquivo", details: error.message });
        }
    }
};
