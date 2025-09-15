const { queryAsync, handleResponse } = require('../utils/functions');

module.exports = class LocationController {
    static async getLocations(req, res) {
        try {
            const query = "SELECT * FROM location";
            const locations = await queryAsync(query);
            return handleResponse(res, 200, { success: true, message: "Localizações obtidas com sucesso.", data: locations, arrayName: "locations" });
        } catch (error) {
            console.error("Erro ao buscar localizações:", error);
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
            console.error("Erro ao buscar localização por ID:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }

    static async createLocation(req, res) {
        const { place, code } = req.body;
        try {
            if (!place) {
                return handleResponse(res, 400, { success: false, error: "Campo obrigatório ausente", details: "O nome da localização é obrigatório." });
            }
            const query = "INSERT INTO location (place, code) VALUES (?, ?)";
            const values = [place, code];
            const result = await queryAsync(query, values);
            return handleResponse(res, 201, { success: true, message: "Localização criada com sucesso!", data: { locationId: result.insertId }, arrayName: "location" });
        } catch (error) {
            console.error("Erro ao criar localização:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateLocation(req, res) {
        const { idLocation } = req.params;
        const { place, code } = req.body;
        try {
            if (!place) {
                return handleResponse(res, 400, { success: false, error: "Campo obrigatório ausente", details: "O nome da localização é obrigatório." });
            }
            const query = "UPDATE location SET place = ?, code = ? WHERE idLocation = ?";
            const values = [place, code, idLocation];
            const result = await queryAsync(query, values);
            if (result.affectedRows === 0) {
                return handleResponse(res, 404, { success: false, error: "Localização não encontrada.", details: "O ID da localização fornecido não existe." });
            }
            return handleResponse(res, 200, { success: true, message: "Localização atualizada com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar localização:", error);
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
            console.error("Erro ao excluir localização:", error);
            return handleResponse(res, 500, { success: false, error: "Erro interno do servidor", details: error.message });
        }
    }
};