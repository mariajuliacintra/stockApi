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

            // Mapeamento de nomes amigáveis para os nomes do banco de dados (removido "Apelidos")
            const headerMap = {
                "Nome do Item": "name",
                "Marca": "brand",
                "Descrição": "description",
                "Código SAP": "sapCode",
                "Estoque Mínimo": "minimumStock"
            };

            // Pega cabeçalhos (linha 1)
            const headers = worksheet.getRow(1).values.slice(1);

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // pula cabeçalho
                const rowData = {};

                // Mapeia os cabeçalhos amigáveis para os nomes do banco
                row.eachCell((cell, colNumber) => {
                    const columnHeader = headers[colNumber - 1];
                    const dbColumnName = headerMap[columnHeader]; // Mapeamento para o nome do banco
                    if (dbColumnName) {
                        rowData[dbColumnName] = cell.value;
                    }
                });

                // Validação dos campos obrigatórios
                const missingFields = [];
                ["name", "brand", "sapCode"].forEach(field => {
                    if (!rowData[field]) missingFields.push(field);
                });

                // Extrai specs opcionais (colunas extras)
                const specs = {};
                headers.forEach(header => {
                    if (!Object.values(headerMap).includes(header) && rowData[header]) {
                        specs[header] = rowData[header];
                    }
                });

                rowData.itemSpecs = specs; // Adiciona specs ao objeto do item

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
