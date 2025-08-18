const { queryAsync } = require("../../utils/functions");
const TransactionController = require("../transactionController");
const validateItem = require("../../services/validateItem");

module.exports = class RawMaterialController {
  static async createRawMaterial(req, res) {
    const validationResult = validateItem.validateRawMaterial(req.body);
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
      batchNumber,
      fkIdLocation,
    } = req.body;
    const query =
      "INSERT INTO rawMaterial (name, aliases, brand, description, technicalSpecs, quantity, batchNumber, fkIdLocation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      name,
      aliases,
      brand,
      description,
      technicalSpecs,
      quantity,
      batchNumber,
      fkIdLocation,
    ];
    try {
      const result = await queryAsync(query, values);
      const itemId = result.insertId;

      if (quantity > 0) {
        await TransactionController.createTransaction(
          fkIdUser,
          "rawMaterial",
          itemId,
          "IN",
          quantity,
          0,
          quantity
        );
      }

      res.status(201).json({ message: "Matéria-prima criada com sucesso." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getAllRawMaterials(req, res) {
    const query = "SELECT * FROM rawMaterial";
    try {
      const results = await queryAsync(query);
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getRawMaterialById(req, res) {
    const { idRawMaterial } = req.params;
    const query = "SELECT * FROM rawMaterial WHERE idRawMaterial = ?";
    try {
      const results = await queryAsync(query, [idRawMaterial]);
      if (results.length > 0) {
        res.status(200).json(results[0]);
      } else {
        res.status(404).json({ message: "Matéria-prima não encontrada." });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async searchRawMaterialsByName(req, res) {
    const { name } = req.query;
    const query = "SELECT * FROM rawMaterial WHERE LOWER(name) LIKE LOWER(?)";
    const values = [`${name}%`]; // nomes que começam com o texto digitado

    try {
      const results = await queryAsync(query, values);
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async updateRawMaterial(req, res) {
    const validationResult = validateItem.validateRawMaterial(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: validationResult.message });
    }

    const { idRawMaterial } = req.params;
    const {
      fkIdUser,
      name,
      aliases,
      brand,
      description,
      technicalSpecs,
      quantity,
      batchNumber,
      fkIdLocation,
    } = req.body;
    try {
      const oldRawMaterialResult = await queryAsync(
        "SELECT quantity FROM rawMaterial WHERE idRawMaterial = ?",
        [idRawMaterial]
      );
      if (oldRawMaterialResult.length === 0) {
        return res
          .status(404)
          .json({ message: "Matéria-prima não encontrada para atualização." });
      }
      const oldQuantity = oldRawMaterialResult[0].quantity;
      const quantityChange = quantity - oldQuantity;
      const actionDescription =
        quantityChange > 0 ? "IN" : quantityChange < 0 ? "OUT" : "AJUST";
      const query =
        "UPDATE rawMaterial SET name = ?, aliases = ?, brand = ?, description = ?, technicalSpecs = ?, quantity = ?, batchNumber = ?, fkIdLocation = ? WHERE idRawMaterial = ?";
      const values = [
        name,
        aliases,
        brand,
        description,
        technicalSpecs,
        quantity,
        batchNumber,
        fkIdLocation,
        idRawMaterial,
      ];
      await queryAsync(query, values);
      await TransactionController.createTransaction(
        fkIdUser,
        "rawMaterial",
        idRawMaterial,
        actionDescription,
        quantityChange,
        oldQuantity,
        quantity
      );
      res
        .status(200)
        .json({ message: "Matéria-prima atualizada com sucesso." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async deleteRawMaterial(req, res) {
    const { idRawMaterial } = req.params;
    const query = "DELETE FROM rawMaterial WHERE idRawMaterial = ?";
    try {
      await queryAsync(query, [idRawMaterial]);
      res.status(200).json({ message: "Matéria-prima deletada com sucesso." });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
