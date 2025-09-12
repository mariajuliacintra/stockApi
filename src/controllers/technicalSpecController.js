const { queryAsync, handleResponse } = require('../utils/functions');

module.exports = class TechnicalSpecController {
    static async getTechnicalSpecs (req, res) {
        try {
            const query = "SELECT * FROM technicalSpec";
            const technicalSpecs = await queryAsync(query);
            handleResponse(res, 200, technicalSpecs);
        } catch (error) {
            console.error("Erro ao buscar especificações técnicas:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async getTechnicalSpecById (req, res) {
        const { idTechnicalSpec } = req.params;
        try {
            const query = "SELECT * FROM technicalSpec WHERE idTechnicalSpec = ?";
            const technicalSpec = await queryAsync(query, [idTechnicalSpec]);

            if (technicalSpec.length === 0) {
                return handleResponse(res, 404, { message: "Especificação técnica não encontrada." });
            }

            handleResponse(res, 200, technicalSpec[0]);
        } catch (error) {
            console.error("Erro ao buscar especificação técnica por ID:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async createTechnicalSpec (req, res) {
        const { technicalSpecKey } = req.body;
        try {
            if (!technicalSpecKey) {
                return handleResponse(res, 400, { message: "O nome da especificação técnica é obrigatório." });
            }

            const query = "INSERT INTO technicalSpec (technicalSpecKey) VALUES (?)";
            const values = [technicalSpecKey];
            const result = await queryAsync(query, values);

            handleResponse(res, 201, { message: "Especificação técnica criada com sucesso!", technicalSpecId: result.insertId });
        } catch (error) {
            console.error("Erro ao criar especificação técnica:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateTechnicalSpec (req, res) {
        const { idTechnicalSpec } = req.params;
        const { technicalSpecKey } = req.body;
        try {
            if (!technicalSpecKey) {
                return handleResponse(res, 400, { message: "O nome da especificação técnica é obrigatório." });
            }
            
            const query = "UPDATE technicalSpec SET technicalSpecKey = ? WHERE idTechnicalSpec = ?";
            const values = [technicalSpecKey, idTechnicalSpec];
            const result = await queryAsync(query, values);

            if (result.affectedRows === 0) {
                return handleResponse(res, 404, { message: "Especificação técnica não encontrada." });
            }

            handleResponse(res, 200, { message: "Especificação técnica atualizada com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar especificação técnica:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async deleteTechnicalSpec (req, res) {
        const { idTechnicalSpec } = req.params;
        try {
            const query = "DELETE FROM technicalSpec WHERE idTechnicalSpec = ?";
            const result = await queryAsync(query, [idTechnicalSpec]);

            if (result.affectedRows === 0) {
                return handleResponse(res, 404, { message: "Especificação técnica não encontrada." });
            }

            handleResponse(res, 200, { message: "Especificação técnica excluída com sucesso!" });
        } catch (error) {
            console.error("Erro ao excluir especificação técnica:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }
};