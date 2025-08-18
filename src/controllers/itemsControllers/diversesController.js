const { queryAsync } = require("../../utils/functions");
const TransactionController = require("../transactionController");
const validateItem = require("../../services/validateItem");

module.exports = class DiversesController {
  static async createDiverses(req, res) {
    const validationResult = validateItem.validateDiverses(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.message });
    }

    const {
      fkIdUser,
      name,
      aliases,
      brand,
      description,
      technicalSpecs,
      quantity,
      expirationDate,
      batchNumber,
      fkIdLocation,
    } = req.body;
    const query =
      "INSERT INTO diverses (name, aliases, brand, description, technicalSpecs, quantity, expirationDate, batchNumber, fkIdLocation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      name,
      aliases,
      brand,
      description,
      technicalSpecs,
      quantity,
      expirationDate,
      batchNumber,
      fkIdLocation,
    ];
    try {
      const result = await queryAsync(query, values);
      const itemId = result.insertId;

      if (quantity > 0) {
        await TransactionController.createTransaction(
          fkIdUser,
          "diverses",
          itemId,
          "IN",
          quantity,
          0,
          quantity
        );
      }

      res.status(201).json({ message: "Item diverso criado com sucesso." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getAllDiverses(req, res) {
    const query = "SELECT * FROM diverses";
    try {
      const results = await queryAsync(query);
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getDiversesById(req, res) {
    const { idDiverses } = req.params;
    const query = "SELECT * FROM diverses WHERE idDiverses = ?";
    try {
      const results = await queryAsync(query, [idDiverses]);
      if (results.length > 0) {
        res.status(200).json(results[0]);
      } else {
        res.status(404).json({ message: "Item diverso não encontrado." });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async searchDiversesByName(req, res) {
    const { name } = req.query;
    const query = "SELECT * FROM diverses WHERE LOWER(name) LIKE LOWER(?)";
    const values = [`${name}%`]; 

    try {
      const results = await queryAsync(query, values);
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateDiverses(req, res) {
    const validationResult = validateItem.validateDiverses(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.message });
    }

    const { idDiverses } = req.params;
    const {
      fkIdUser,
      name,
      aliases,
      brand,
      description,
      technicalSpecs,
      quantity,
      expirationDate,
      batchNumber,
      fkIdLocation,
    } = req.body;
    try {
      const oldDiversesResult = await queryAsync(
        "SELECT quantity FROM diverses WHERE idDiverses = ?",
        [idDiverses]
      );
      if (oldDiversesResult.length === 0) {
        return res
          .status(404)
          .json({ message: "Item diverso não encontrado para atualização." });
      }
      const oldQuantity = oldDiversesResult[0].quantity;
      const quantityChange = quantity - oldQuantity;
      const actionDescription =
        quantityChange > 0 ? "IN" : quantityChange < 0 ? "OUT" : "AJUST";
      const query =
        "UPDATE diverses SET name = ?, aliases = ?, brand = ?, description = ?, technicalSpecs = ?, quantity = ?, expirationDate = ?, batchNumber = ?, fkIdLocation = ? WHERE idDiverses = ?";
      const values = [
        name,
        aliases,
        brand,
        description,
        technicalSpecs,
        quantity,
        expirationDate,
        batchNumber,
        fkIdLocation,
        idDiverses,
      ];
      await queryAsync(query, values);
      await TransactionController.createTransaction(
        fkIdUser,
        "diverses",
        idDiverses,
        actionDescription,
        quantityChange,
        oldQuantity,
        quantity
      );
      res.status(200).json({ message: "Item diverso atualizado com sucesso." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteDiverses(req, res) {
    const { idDiverses } = req.params;
    const query = "DELETE FROM diverses WHERE idDiverses = ?";
    try {
      await queryAsync(query, [idDiverses]);
      res.status(200).json({ message: "Item diverso deletado com sucesso." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
