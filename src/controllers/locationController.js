const { queryAsync } = require("../utils/functions");

module.exports = class LocationController {
    static async createLocation(req, res) {
        const { place, locationCode } = req.body;
        const query = 'INSERT INTO location (place, locationCode) VALUES (?, ?)';
        const values = [place, locationCode];
        try {
            await queryAsync(query, values);
            res.status(201).json({ message: 'Localização criada com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getAllLocations(req, res) {
        const query = 'SELECT * FROM location';
        try {
            const results = await queryAsync(query);
            res.status(200).json(results);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getLocationById(req, res) {
        const { idLocation } = req.params;
        const query = 'SELECT * FROM location WHERE idLocation = ?';
        try {
            const results = await queryAsync(query, [idLocation]);
            if (results.length > 0) {
                res.status(200).json(results[0]);
            } else {
                res.status(404).json({ message: 'Localização não encontrada.' });
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async updateLocation(req, res) {
        const { idLocation } = req.params;
        const { place, locationCode } = req.body;
        const query = 'UPDATE location SET place = ?, locationCode = ? WHERE idLocation = ?';
        const values = [place, locationCode, idLocation];
        try {
            await queryAsync(query, values);
            res.status(200).json({ message: 'Localização atualizada com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async deleteLocation(req, res) {
        const { idLocation } = req.params;
        const query = 'DELETE FROM location WHERE idLocation = ?';
        try {
            await queryAsync(query, [idLocation]);
            res.status(200).json({ message: 'Localização deletada com sucesso.' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

/*
CURLs para LocationController:

// POST create a new location
// Os campos 'place' e 'locationCode' são obrigatórios.
curl --location 'http://localhost:5000/stock/location' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "place": "Nova Prateleira",
    "locationCode": "Z1"
}'

// GET all locations
curl --location 'http://localhost:5000/stock/locations' \
--header 'Authorization: {userToken}'

// GET location by ID
curl --location 'http://localhost:5000/stock/location/1' \
--header 'Authorization: {userToken}'

// PUT update location by ID
curl --location --request PUT 'http://localhost:5000/stock/location/1' \
--header 'Content-Type: application/json' \
--header 'Authorization: {userToken}' \
--data-raw '{
    "place": "Prateleira Grande",
    "locationCode": "A1-1"
}'

// DELETE location by ID
curl --location --request DELETE 'http://localhost:5000/stock/location/1' \
--header 'Authorization: {userToken}'
*/
