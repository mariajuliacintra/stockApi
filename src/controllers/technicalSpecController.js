const { queryAsync, handleResponse } = require('../utils/functions');

module.exports = class TechnicalSpecController {
    static async getTechnicalSpecs(req, res) {
        try {
            const query = "SELECT * FROM technicalSpec";
            const technicalSpecs = await queryAsync(query);
            return handleResponse(res, 200, { success: true, message: "Especificações técnicas obtidas com sucesso.", data: technicalSpecs, arrayName: "technicalSpecs" });
        } catch (error) {
            console.error("Erro ao buscar especificações técnicas:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }

    static async getTechnicalSpecById(req, res) {
        const { idTechnicalSpec } = req.params;
        try {
            const query = "SELECT * FROM technicalSpec WHERE idTechnicalSpec = ?";
            const technicalSpec = await queryAsync(query, [idTechnicalSpec]);
            if (technicalSpec.length === 0) {
                return handleResponse(res, 404, { success: false, error: "Especificação técnica não encontrada.", details: "O ID da especificação técnica fornecido não existe." });
            }
            return handleResponse(res, 200, { success: true, message: "Especificação técnica obtida com sucesso.", data: technicalSpec[0], arrayName: "technicalSpec" });
        } catch (error) {
            console.error("Erro ao buscar especificação técnica por ID:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }

    static async createTechnicalSpec(req, res) {
        const { technicalSpecKey } = req.body;
        try {
            if (!technicalSpecKey) {
                return handleResponse(res, 400, { success: false, error: "Campo obrigatório ausente", details: "O nome da especificação técnica é obrigatório." });
            }
            const query = "INSERT INTO technicalSpec (technicalSpecKey) VALUES (?)";
            const values = [technicalSpecKey];
            const result = await queryAsync(query, values);
            return handleResponse(res, 201, { success: true, message: "Especificação técnica criada com sucesso!", data: { technicalSpecId: result.insertId }, arrayName: "technicalSpec" });
        } catch (error) {
            console.error("Erro ao criar especificação técnica:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateTechnicalSpec(req, res) {
        const { idTechnicalSpec } = req.params;
        const { technicalSpecKey } = req.body;
        try {
            if (!technicalSpecKey) {
                return handleResponse(res, 400, { success: false, error: "Campo obrigatório ausente", details: "O nome da especificação técnica é obrigatório." });
            }
            const query = "UPDATE technicalSpec SET technicalSpecKey = ? WHERE idTechnicalSpec = ?";
            const values = [technicalSpecKey, idTechnicalSpec];
            const result = await queryAsync(query, values);
            if (result.affectedRows === 0) {
                return handleResponse(res, 404, { success: false, error: "Especificação técnica não encontrada.", details: "O ID da especificação técnica fornecido não existe." });
            }
            return handleResponse(res, 200, { success: true, message: "Especificação técnica atualizada com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar especificação técnica:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }

    static async deleteTechnicalSpec(req, res) {
        const { idTechnicalSpec } = req.params;
        try {
            const query = "DELETE FROM technicalSpec WHERE idTechnicalSpec = ?";
            const result = await queryAsync(query, [idTechnicalSpec]);
            if (result.affectedRows === 0) {
                return handleResponse(res, 404, { success: false, error: "Especificação técnica não encontrada.", details: "O ID da especificação técnica fornecido não existe." });
            }
            return handleResponse(res, 200, { success: true, message: "Especificação técnica excluída com sucesso!" });
        } catch (error) {
            console.error("Erro ao excluir especificação técnica:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }
};