const { queryAsync, handleResponse } = require('../utils/functions');

module.exports = class LocationController {
    static async getLocations(req, res) {
        try {
            const query = "SELECT * FROM location";
            const locations = await queryAsync(query);
            return handleResponse(res, 200, { success: true, message: "Localizações obtidas com sucesso.", data: locations, arrayName: "locations" });
        } catch (error) {
            console.error("[LocationController] Erro ao buscar localizações:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }

    static async getLocationById(req, res) {
        const { idLocation } = req.params;
        try {
            const query = "SELECT * FROM location WHERE idLocation = ?";
            const location = await queryAsync(query, [idLocation]);
            if (location.length === 0) {
                return handleResponse(res, 404, { success: false, error: "Localização não encontrada.", details: "O ID da localização fornecido não existe." });
            }
            return handleResponse(res, 200, { success: true, message: "Localização obtida com sucesso.", data: location[0], arrayName: "location" });
        } catch (error) {
            console.error("[LocationController] Erro ao buscar localização por ID:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }

    static async createLocation(req, res) {
        const { place, code } = req.body;
        try {
            if (!place || !code) {
                return handleResponse(res, 400, { success: false, error: "Campos obrigatórios ausentes", details: "O 'place' e 'code' da localização são obrigatórios." });
            }
            const query = "INSERT INTO location (place, code) VALUES (?, ?)";
            const values = [place, code];
            const result = await queryAsync(query, values);
            return handleResponse(res, 201, { success: true, message: "Localização criada com sucesso!", data: { locationId: result.insertId }, arrayName: "location" });
        } catch (error) {
            console.error("[LocationController] Erro ao criar localização:", error);
            if (error.code === 'ER_DUP_ENTRY') {
                return handleResponse(res, 409, { success: false, error: "Conflito de dados", details: "A combinação de 'place' e 'code' já existe." });
            }
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateLocation(req, res) {
        const { idLocation } = req.params;
        const { place, code } = req.body;
        try {
            if (!place || !code) {
                return handleResponse(res, 400, { success: false, error: "Campos obrigatórios ausentes", details: "O 'place' e 'code' da localização são obrigatórios." });
            }
            const query = "UPDATE location SET place = ?, code = ? WHERE idLocation = ?";
            const values = [place, code, idLocation];
            const result = await queryAsync(query, values);
            if (result.affectedRows === 0) {
                return handleResponse(res, 404, { success: false, error: "Localização não encontrada.", details: "O ID da localização fornecido não existe." });
            }
            return handleResponse(res, 200, { success: true, message: "Localização atualizada com sucesso!" });
        } catch (error) {
            console.error("[LocationController] Erro ao atualizar localização:", error);
            if (error.code === 'ER_DUP_ENTRY') {
                return handleResponse(res, 409, { success: false, error: "Conflito de dados", details: "A combinação de 'place' e 'code' já existe." });
            }
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }

    static async deleteLocation(req, res) {
        const { idLocation } = req.params;
        try {
            const query = "DELETE FROM location WHERE idLocation = ?";
            const result = await queryAsync(query, [idLocation]);
            if (result.affectedRows === 0) {
                return handleResponse(res, 404, { success: false, error: "Localização não encontrada.", details: "O ID da localização fornecido não existe." });
            }
            return handleResponse(res, 200, { success: true, message: "Localização excluída com sucesso!" });
        } catch (error) {
            console.error("[LocationController] Erro ao excluir localização:", error);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return handleResponse(res, 409, { success: false, error: "Conflito de chave estrangeira", details: "Não é possível excluir esta localização pois ela está associada a um ou mais lotes." });
            }
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }
};
