const { queryAsync, handleResponse } = require('../utils/functions');

module.exports = class LocationController {
    static async getLocations (req, res) {
        try {
            const query = "SELECT * FROM location";
            const locations = await queryAsync(query);
            handleResponse(res, 200, locations);
        } catch (error) {
            console.error("Erro ao buscar localizações:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async getLocationById (req, res) {
        const { idLocation } = req.params;
        try {
            const query = "SELECT * FROM location WHERE idLocation = ?";
            const location = await queryAsync(query, [idLocation]);

            if (location.length === 0) {
                return handleResponse(res, 404, { message: "Localização não encontrada." });
            }

            handleResponse(res, 200, location[0]);
        } catch (error) {
            console.error("Erro ao buscar localização por ID:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async createLocation (req, res) {
        const { place, code } = req.body;
        try {
            if (!place) {
                return handleResponse(res, 400, { message: "O nome da localização é obrigatório." });
            }

            const query = "INSERT INTO location (place, code) VALUES (?, ?)";
            const values = [place, code];
            const result = await queryAsync(query, values);

            handleResponse(res, 201, { message: "Localização criada com sucesso!", locationId: result.insertId });
        } catch (error) {
            console.error("Erro ao criar localização:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateLocation (req, res) {
        const { idLocation } = req.params;
        const { place, code } = req.body;
        try {
            if (!place) {
                return handleResponse(res, 400, { message: "O nome da localização é obrigatório." });
            }
            
            const query = "UPDATE location SET place = ?, code = ? WHERE idLocation = ?";
            const values = [place, code, idLocation];
            const result = await queryAsync(query, values);

            if (result.affectedRows === 0) {
                return handleResponse(res, 404, { message: "Localização não encontrada." });
            }

            handleResponse(res, 200, { message: "Localização atualizada com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar localização:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }

    static async deleteLocation (req, res) {
        const { idLocation } = req.params;
        try {
            const query = "DELETE FROM location WHERE idLocation = ?";
            const result = await queryAsync(query, [idLocation]);

            if (result.affectedRows === 0) {
                return handleResponse(res, 404, { message: "Localização não encontrada." });
            }

            handleResponse(res, 200, { message: "Localização excluída com sucesso!" });
        } catch (error) {
            console.error("Erro ao excluir localização:", error);
            handleResponse(res, 500, { error: "Erro interno do servidor", details: error.message });
        }
    }
};