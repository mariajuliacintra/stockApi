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

            // Mapeamento de nomes amigáveis para os nomes do banco de dados (sem "Apelidos")
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
                    const dbColumnName = headerMap[columnHeader];
                    if (dbColumnName) {
                        rowData[dbColumnName] = cell.value;
                    }
                });

                // Validação dos campos obrigatórios
                const missingFields = [];
                ["name", "brand", "sapCode"].forEach(field => {
                    if (!rowData[field]) missingFields.push(field);
                });

                // Validação do sapCode com 9 dígitos
                if (rowData.sapCode) {
                    const sapStr = String(rowData.sapCode).trim();
                    if (!/^\d{9}$/.test(sapStr)) {
                        missingFields.push("sapCode (deve ter exatamente 9 dígitos)");
                    }
                }

                // Extrai specs opcionais (colunas extras)
                const specs = {};
                headers.forEach(header => {
                    if (!Object.values(headerMap).includes(header) && rowData[header]) {
                        specs[header] = rowData[header];
                    }
                });

                rowData.itemSpecs = specs;

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

            // Caso exista algum sapCode inválido, retorna erro geral
            if (invalidRows.length > 0) {
                return res.status(400).json({
                    error: "Alguns itens possuem campos inválidos",
                    invalidRows
                });
            }

            return res.status(200).json({
                message: "Arquivo processado com sucesso",
                validRows
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao processar o arquivo", details: error.message });
        }
    }
};
