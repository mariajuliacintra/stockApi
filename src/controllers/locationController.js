const { queryAsync } = require('../utils/functions');

module.exports = class LocationController {
    static async getLocations (req, res) {
        try {
            const query = "SELECT * FROM location";
            const locations = await queryAsync(query);
            res.status(200).json(locations);
        } catch (error) {
            console.error("Erro ao buscar localizações:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    static async getLocationById (req, res) {
        const { idLocation } = req.params;
        try {
            const query = "SELECT * FROM location WHERE idLocation = ?";
            const location = await queryAsync(query, [idLocation]);
            if (location.length === 0) {
                return res.status(404).json({ message: "Localização não encontrada." });
            }
            res.status(200).json(location[0]);
        } catch (error) {
            console.error("Erro ao buscar localização por ID:", error);
            res.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    static async createLocation (req, res) {
        const { place, code } = req.body;
        try {
            if (!place) {
                return res.status(400).json({ message: "O nome da localização é obrigatório." });
            }

            const query = "INSERT INTO location (place, code) VALUES (?, ?)";
            const values = [place, code];
            const result = await queryAsync(query, values);
            res.status(201).json({ message: "Localização criada com sucesso!", locationId: result.insertId });
        } catch (error) {
            console.error("Erro ao criar localização:", error);
            res.status(500).json({ error: "Erro interno do servidor", details: error.message });
        }
    }

    static async updateLocation (req, res) {
        const { idLocation } = req.params;
        const { place, code } = req.body;
        try {
            if (!place) {
                return res.status(400).json({ message: "O nome da localização é obrigatório." });
            }
            
            const query = "UPDATE location SET place = ?, code = ? WHERE idLocation = ?";
            const values = [place, code, idLocation];
            const result = await queryAsync(query, values);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Localização não encontrada." });
            }

            res.status(200).json({ message: "Localização atualizada com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar localização:", error);
            res.status(500).json({ error: "Erro interno do servidor", details: error.message });
        }
    }

    static async deleteLocation (req, res) {
        const { idLocation } = req.params;
        try {
            const query = "DELETE FROM location WHERE idLocation = ?";
            const result = await queryAsync(query, [idLocation]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Localização não encontrada." });
            }

            res.status(200).json({ message: "Localização excluída com sucesso!" });
        } catch (error) {
            console.error("Erro ao excluir localização:", error);
            res.status(500).json({ error: "Erro interno do servidor", details: error.message });
        }
    }
};
