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

            const worksheet = workbook.worksheets[0]; // primeira aba
            const validRows = [];
            const invalidRows = [];

            // Mapeamento
            const headerMap = {
                "Nome do Item": "name",
                "Marca": "brand",
                "Descrição": "description",
                "Código SAP": "sapCode",
                "Estoque Mínimo": "minimumStock"
            };

            // Cabeçalhos amigáveis (linha 1)
            const headers = worksheet.getRow(1).values.slice(1); // array com "Nome do Item", "Marca", ...

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // pula cabeçalho

                // 1) ler valores usando cabeçalhos amigáveis
                const friendlyData = {};
                row.eachCell((cell, colNumber) => {
                    const headerFriendly = headers[colNumber - 1];
                    friendlyData[headerFriendly] = cell.value;
                });

                // 2) mapear para nomes do banco
                const rowData = {};
                Object.entries(headerMap).forEach(([friendly, dbName]) => {
                    if (friendlyData[friendly] !== undefined && friendlyData[friendly] !== null && friendlyData[friendly] !== '') {
                        rowData[dbName] = friendlyData[friendly];
                    }
                });

                // 3) validações básicas
                const missingFields = [];
                ["name", "brand", "sapCode"].forEach(field => {
                    if (!rowData[field]) missingFields.push(field);
                });

                // 4) validação sapCode: no máximo 9 dígitos (apenas números)
                if (rowData.sapCode !== undefined && rowData.sapCode !== null && rowData.sapCode !== "") {
                    const sapStr = String(rowData.sapCode).trim();
                    // remover possíveis espaços e verificar somente dígitos
                    if (!/^\d+$/.test(sapStr)) {
                        missingFields.push("sapCode (apenas dígitos permitidos)");
                    } else if (sapStr.length > 9) {
                        missingFields.push("sapCode (máximo 9 dígitos)");
                    } else {
                        // opcional: manter sapCode como string sem zeros perdidos
                        rowData.sapCode = sapStr;
                    }
                }

                // 5) extrair specs - qualquer coluna amigável que NÃO esteja no headerMap
                const specs = {};
                headers.forEach(headerFriendly => {
                    if (!Object.prototype.hasOwnProperty.call(headerMap, headerFriendly)) {
                        const value = friendlyData[headerFriendly];
                        if (value !== undefined && value !== null && value !== "") {
                            specs[headerFriendly] = value;
                        }
                    }
                });

                rowData.itemSpecs = specs;

                // 6) empacotar inválidos ou válidos
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

            // Se houver linhas inválidas, bloquear e retornar 400 com os detalhes
            if (invalidRows.length > 0) {
                return res.status(400).json({
                    error: "Alguns itens possuem campos inválidos ou faltantes",
                    invalidRows
                });
            }

            // Se tudo OK, retorna as linhas válidas
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
