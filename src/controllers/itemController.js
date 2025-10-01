const { queryAsync, handleResponse } = require("../utils/functions");
const validateItem = require("../services/validateItem");
const fs = require("fs").promises;

module.exports = class ItemController {
  static async checkItemBySapCode(req, res) {
    const { sapCode } = req.params;
    if (isNaN(Number(sapCode))) {
      return handleResponse(res, 400, {
        success: false,
        error: "O código SAP deve ser um valor numérico.",
      });
    }
    try {
      const query = "SELECT sapCode FROM item WHERE sapCode = ?";
      const item = await queryAsync(query, [sapCode]);
      if (item.length > 0) {
        return handleResponse(res, 200, {
          success: true,
          message: "Item encontrado.",
          data: { exists: true },
        });
      } else {
        return handleResponse(res, 404, {
          success: false,
          error: "Item não encontrado.",
          details: "Não existe um item com o código SAP fornecido.",
        });
      }
    } catch (error) {
      console.error("Erro ao verificar item:", error);
      return handleResponse(res, 500, {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      });
    }
  }

  static async getItemByIdDetails(req, res) {
    const { idItem } = req.params;

    if (isNaN(Number(idItem))) {
      return handleResponse(res, 400, {
        success: false,
        error: "O ID do item deve ser um valor numérico.",
      });
    }

    try {
      const query = `
            SELECT
                i.idItem, i.name, i.aliases, i.brand, i.description, i.minimumStock, i.sapCode,
                c.idCategory AS categoryId, c.categoryValue,
                img.imageData, img.imageType,
                l_total.totalQuantity,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'idLot', l.idLot,
                        'quantity', l.quantity,
                        'expirationDate', l.expirationDate,
                        'lotNumber', l.lotNumber,
                        'location', JSON_OBJECT('place', loc.place, 'code', loc.code)
                    )
                ) AS lots,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'idTechnicalSpec', its.fkIdTechnicalSpec,
                        'technicalSpecKey', ts.technicalSpecKey,
                        'technicalSpecValue', its.specValue
                    )
                ) AS technicalSpecs
            FROM item i
            LEFT JOIN category c ON i.fkIdCategory = c.idCategory
            LEFT JOIN (
                SELECT fkIdItem, SUM(quantity) AS totalQuantity FROM lots GROUP BY fkIdItem
            ) l_total ON i.idItem = l_total.fkIdItem
            LEFT JOIN lots l ON i.idItem = l.fkIdItem
            LEFT JOIN location loc ON l.fkIdLocation = loc.idLocation
            LEFT JOIN itemSpec its ON i.idItem = its.fkIdItem
            LEFT JOIN technicalSpec ts ON its.fkIdTechnicalSpec = ts.idTechnicalSpec
            LEFT JOIN image img ON i.fkIdImage = img.idImage
            WHERE i.idItem = ?
            GROUP BY i.idItem, l_total.totalQuantity
        `;

      const [item] = await queryAsync(query, [idItem]);

      if (!item || !item.idItem) {
        return handleResponse(res, 404, {
          success: false,
          error: "Item não encontrado.",
          details: "O item com o ID fornecido não existe.",
        });
      }

      const formattedItem = {
        idItem: item.idItem,
        name: item.name,
        aliases: item.aliases,
        brand: item.brand,
        description: item.description,
        minimumStock: item.minimumStock,
        sapCode: item.sapCode,
        category: {
          idCategory: item.categoryId,
          value: item.categoryValue,
        },
        totalQuantity: item.totalQuantity || 0,
        image:
          item.imageData && item.imageType
            ? {
                type: item.imageType,
                data: item.imageData.toString("base64"),
              }
            : null,
        lots:
          item.lots && item.lots.length > 0 && item.lots[0].idLot
            ? item.lots
            : [],
        technicalSpecs:
          item.technicalSpecs &&
          item.technicalSpecs.length > 0 &&
          item.technicalSpecs[0].idTechnicalSpec
            ? item.technicalSpecs
            : [],
      };

      return handleResponse(res, 200, {
        success: true,
        message: "Detalhes do item obtidos com sucesso.",
        data: formattedItem,
        arrayName: "item",
      });
    } catch (error) {
      console.error("Erro ao buscar item por ID com detalhes:", error);
      return handleResponse(res, 500, {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      });
    }
  }

  static async getAllItems(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const query = `
            SELECT
                i.idItem, i.name, i.aliases, i.brand, i.description, i.minimumStock, i.sapCode,
                c.idCategory AS categoryId, c.categoryValue,
                l.totalQuantity,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'idTechnicalSpec', its.fkIdTechnicalSpec,
                        'technicalSpecKey', ts.technicalSpecKey,
                        'technicalSpecValue', its.specValue
                    )
                ) AS technicalSpecs
            FROM item i
            LEFT JOIN category c ON i.fkIdCategory = c.idCategory
            LEFT JOIN (
                SELECT fkIdItem, SUM(quantity) AS totalQuantity FROM lots GROUP BY fkIdItem
            ) l ON i.idItem = l.fkIdItem
            LEFT JOIN itemSpec its ON i.idItem = its.fkIdItem
            LEFT JOIN technicalSpec ts ON its.fkIdTechnicalSpec = ts.idTechnicalSpec
            GROUP BY i.idItem, l.totalQuantity
            ORDER BY i.name
            LIMIT ? OFFSET ?
        `;
      const items = await queryAsync(query, [limit, offset]);

      const countQuery = `
            SELECT COUNT(*) as totalCount FROM item
        `;
      const [{ totalCount }] = await queryAsync(countQuery);
      const totalPages = Math.ceil(totalCount / limit);

      const formattedItems = items.map((item) => ({
        idItem: item.idItem,
        name: item.name,
        aliases: item.aliases,
        brand: item.brand,
        description: item.description,
        minimumStock: item.minimumStock,
        sapCode: item.sapCode,
        category: {
          idCategory: item.categoryId,
          value: item.categoryValue,
        },
        totalQuantity: item.totalQuantity || 0,
        technicalSpecs:
          item.technicalSpecs &&
          item.technicalSpecs.length > 0 &&
          item.technicalSpecs[0].idTechnicalSpec
            ? item.technicalSpecs
            : [],
      }));

      return handleResponse(res, 200, {
        success: true,
        message: "Lista de itens obtida com sucesso.",
        data: formattedItems,
        arrayName: "items",
        pagination: {
          totalItems: totalCount,
          totalPages: totalPages,
          currentPage: page,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      console.error("Erro ao buscar e agrupar itens:", error);
      return handleResponse(res, 500, {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      });
    }
  }

  static async filterItems(req, res) {
    try {
      const { name, idCategory } = req.body;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      let query = `
            SELECT
                i.idItem, i.name, i.aliases, i.brand, i.description, i.minimumStock, i.sapCode,
                c.idCategory AS categoryId, c.categoryValue,
                l.totalQuantity,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'idTechnicalSpec', its.fkIdTechnicalSpec,
                        'technicalSpecKey', ts.technicalSpecKey,
                        'technicalSpecValue', its.specValue
                    )
                ) AS technicalSpecs
            FROM item i
            LEFT JOIN category c ON i.fkIdCategory = c.idCategory
            LEFT JOIN (
                SELECT fkIdItem, SUM(quantity) AS totalQuantity FROM lots GROUP BY fkIdItem
            ) l ON i.idItem = l.fkIdItem
            LEFT JOIN itemSpec its ON i.idItem = its.fkIdItem
            LEFT JOIN technicalSpec ts ON its.fkIdTechnicalSpec = ts.idTechnicalSpec
            WHERE 1=1
        `;
      let countQuery = `
            SELECT COUNT(DISTINCT i.idItem) as totalCount
            FROM item i
            WHERE 1=1
        `;
      const queryParams = [];
      const countQueryParams = [];

      if (name) {
        const normalizedName = `%${name
          .trim()
          .toLowerCase()
          .replace(/\s/g, "")}%`;
        query += ` AND (REPLACE(LOWER(i.name), ' ', '') LIKE ? OR REPLACE(LOWER(i.aliases), ' ', '') LIKE ?)`;
        countQuery += ` AND (REPLACE(LOWER(i.name), ' ', '') LIKE ? OR REPLACE(LOWER(i.aliases), ' ', '') LIKE ?)`;
        queryParams.push(normalizedName, normalizedName);
        countQueryParams.push(normalizedName, normalizedName);
      }

      if (idCategory && Array.isArray(idCategory) && idCategory.length > 0) {
        const placeholders = idCategory.map(() => "?").join(",");
        query += ` AND i.fkIdCategory IN (${placeholders})`;
        countQuery += ` AND i.fkIdCategory IN (${placeholders})`;
        queryParams.push(...idCategory);
        countQueryParams.push(...idCategory);
      }

      query += ` GROUP BY i.idItem, l.totalQuantity ORDER BY i.name LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);

      const items = await queryAsync(query, queryParams);
      const [{ totalCount }] = await queryAsync(countQuery, countQueryParams);
      const totalPages = Math.ceil(totalCount / limit);

      const formattedItems = items.map((item) => ({
        idItem: item.idItem,
        name: item.name,
        aliases: item.aliases,
        brand: item.brand,
        description: item.description,
        minimumStock: item.minimumStock,
        sapCode: item.sapCode,
        category: {
          idCategory: item.categoryId,
          value: item.categoryValue,
        },
        totalQuantity: item.totalQuantity || 0,
        technicalSpecs:
          item.technicalSpecs &&
          item.technicalSpecs.length > 0 &&
          item.technicalSpecs[0].idTechnicalSpec
            ? item.technicalSpecs
            : [],
      }));

      return handleResponse(res, 200, {
        success: true,
        message: "Itens filtrados com sucesso.",
        data: formattedItems,
        arrayName: "items",
        pagination: {
          totalItems: totalCount,
          totalPages: totalPages,
          currentPage: page,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      console.error("Erro ao filtrar itens:", error);
      return handleResponse(res, 500, {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      });
    }
  }

  static async createItem(req, res) {
    const {
      sapCode,
      name,
      aliases,
      minimumStock,
      quantity,
      expirationDate,
      fkIdLocation,
      fkIdUser,
      fkIdCategory,
      technicalSpecs,
      ...itemData
    } = req.body;

    const validationResult = await validateItem.validateCreateItem(req.body);
    if (!validationResult.success) {
      return handleResponse(res, 400, {
        success: false,
        error: validationResult.error || "Erro de validação.",
        details: validationResult.details || validationResult.message,
      });
    }

    try {
      await queryAsync("START TRANSACTION");

      const existingItemQuery =
        "SELECT idItem, name FROM item WHERE sapCode = ?";
      const [existingItemResult] = await queryAsync(existingItemQuery, [
        sapCode,
      ]);
      if (existingItemResult) {
        await queryAsync("ROLLBACK");
        return handleResponse(res, 409, {
          success: false,
          error: `Item com sapCode '${sapCode}' já existe.`,
          details: "Para adicionar um novo lote, use o endpoint apropriado.",
          existingItemId: existingItemResult.idItem,
          existingItemName: existingItemResult.name,
        });
      }

      const insertItemQuery = `
            INSERT INTO item (sapCode, name, aliases, brand, description, minimumStock, fkIdCategory)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
      const itemValues = [
        sapCode,
        name,
        aliases,
        itemData.brand,
        itemData.description,
        minimumStock,
        fkIdCategory,
      ];
      const itemResult = await queryAsync(insertItemQuery, itemValues);
      const fkIdItem = itemResult.insertId;

      if (technicalSpecs && Object.keys(technicalSpecs).length > 0) {
        const insertSpecsQuery =
          "INSERT INTO itemSpec (fkIdItem, fkIdTechnicalSpec, specValue) VALUES ?";
        const specsValues = Object.entries(technicalSpecs).map(
          ([id, value]) => [fkIdItem, id, value]
        );
        await queryAsync(insertSpecsQuery, [specsValues]);
      }

      const getLotNumberQuery = `
            SELECT COALESCE(MAX(lotNumber), 0) + 1 AS newLotNumber
            FROM lots
            WHERE fkIdItem = ?
        `;
      const [lotResult] = await queryAsync(getLotNumberQuery, [fkIdItem]);
      const lotNumber = lotResult.newLotNumber;

      const insertLotQuery = `
            INSERT INTO lots (lotNumber, quantity, expirationDate, fkIdLocation, fkIdItem)
            VALUES (?, ?, ?, ?, ?)
        `;
      const lotValues = [
        lotNumber,
        quantity,
        expirationDate,
        fkIdLocation,
        fkIdItem,
      ];
      const newLotResult = await queryAsync(insertLotQuery, lotValues);
      const newLotId = newLotResult.insertId;

      const insertTransactionQuery = `
            INSERT INTO transactions (fkIdUser, fkIdLot, actionDescription, quantityChange, oldQuantity, newQuantity)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
      const transactionValues = [
        fkIdUser,
        newLotId,
        "IN",
        quantity,
        0,
        quantity,
      ];
      await queryAsync(insertTransactionQuery, transactionValues);

      await queryAsync("COMMIT");

      return handleResponse(res, 201, {
        success: true,
        message: "Item, lote e especificações criados com sucesso!",
        details:
          "O item, seu primeiro lote e especificações foram adicionados ao estoque.",
        data: {
          itemId: fkIdItem,
          sapCode: sapCode,
          lotNumber: lotNumber,
          lotId: newLotId,
        },
        arrayName: "data",
      });
    } catch (error) {
      console.error("Erro ao criar item:", error);
      await queryAsync("ROLLBACK");
      return handleResponse(res, 500, {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      });
    }
  }

  static async updateSingleLotQuantity(req, res) {
    const { idItem } = req.params;
    const { quantity: rawQuantity, isAjust, fkIdUser } = req.body;
    if (idItem === undefined || isNaN(Number(idItem))) {
      return handleResponse(res, 400, {
        success: false,
        error: "O ID do item é obrigatório e deve ser um número.",
      });
    }
    if (fkIdUser === undefined || isNaN(Number(fkIdUser))) {
      return handleResponse(res, 400, {
        success: false,
        error: "O ID do usuário é obrigatório e deve ser um número.",
      });
    }
    if (typeof isAjust !== "boolean") {
      return handleResponse(res, 400, {
        success: false,
        error: "O campo 'isAjust' deve ser um booleano (true ou false).",
      });
    }
    let quantityNum;
    let actionDescription;
    let quantityChange;
    try {
      quantityNum = parseFloat(rawQuantity);
      if (isNaN(quantityNum)) {
        return handleResponse(res, 400, {
          success: false,
          error: "A quantidade é obrigatória e deve ser um número válido.",
        });
      }
      await queryAsync("START TRANSACTION");
      const getInfoQuery = `
            SELECT 
                l.idLot, l.quantity AS currentLotQuantity, i.quantity AS currentItemQuantity
            FROM lots l
            JOIN item i ON l.fkIdItem = i.idItem
            WHERE l.fkIdItem = ?
        `;
      const lots = await queryAsync(getInfoQuery, [idItem]);

      if (lots.length === 0) {
        await queryAsync("ROLLBACK");
        return handleResponse(res, 404, {
          success: false,
          error: "Item não encontrado ou não possui lotes.",
          details: "A operação de atualização de lote único falhou.",
        });
      }

      if (lots.length > 1) {
        await queryAsync("ROLLBACK");
        return handleResponse(res, 400, {
          success: false,
          error: "Este item possui mais de um lote.",
          details:
            "Esta operação é apenas para itens com um único lote. Use o endpoint de movimentação de lote se houver múltiplos.",
        });
      }

      const lotInfo = lots[0];
      const idLot = lotInfo.idLot;
      const currentLotQuantity = parseFloat(lotInfo.currentLotQuantity);
      const currentItemQuantity = parseFloat(lotInfo.currentItemQuantity) || 0;
      let newLotQuantity;
      let newItemQuantity;
      let quantityDifference;

      if (isAjust) {
        newLotQuantity = quantityNum;
        quantityChange = newLotQuantity - currentLotQuantity;
        actionDescription = "AJUST";
        newItemQuantity = currentItemQuantity + quantityChange;
      } else {
        if (quantityNum > 0) {
          newLotQuantity = currentLotQuantity + quantityNum;
          quantityChange = quantityNum;
          actionDescription = "IN";
        } else {
          const quantityToRemove = Math.abs(quantityNum);
          newLotQuantity = currentLotQuantity - quantityToRemove;
          quantityChange = -quantityToRemove;
          actionDescription = "OUT";
        }
        if (newLotQuantity < 0) {
          await queryAsync("ROLLBACK");
          return handleResponse(res, 400, {
            success: false,
            error: "A remoção de quantidade resultaria em um estoque negativo.",
            details: `Quantidade atual: ${currentLotQuantity}. Tentativa de remover: ${Math.abs(
              quantityNum
            )}.`,
          });
        }

        newItemQuantity = currentItemQuantity + quantityChange;
      }
      if (newItemQuantity < 0 && actionDescription !== "AJUST") {
        await queryAsync("ROLLBACK");
        return handleResponse(res, 400, {
          success: false,
          error:
            "A operação resultaria em uma quantidade total negativa para o item.",
          details:
            "Ajustes podem levar a valores negativos se necessário, mas IN/OUT não.",
        });
      }

      newLotQuantity = parseFloat(newLotQuantity.toFixed(4));
      newItemQuantity = parseFloat(newItemQuantity.toFixed(4));
      quantityChange = parseFloat(quantityChange.toFixed(4));

      const updateLotQuery = "UPDATE lots SET quantity = ? WHERE idLot = ?";
      await queryAsync(updateLotQuery, [newLotQuantity, idLot]);
      const updateItemQuery = "UPDATE item SET quantity = ? WHERE idItem = ?";
      await queryAsync(updateItemQuery, [newItemQuantity, idItem]);
      const insertTransactionQuery = `
                INSERT INTO transactions (fkIdUser, fkIdLot, actionDescription, quantityChange, oldQuantity, newQuantity)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
      await queryAsync(insertTransactionQuery, [
        fkIdUser,
        idLot,
        actionDescription,
        quantityChange,
        currentLotQuantity,
        newLotQuantity,
      ]);
      await queryAsync("COMMIT");
      return handleResponse(res, 200, {
        success: true,
        message: "Quantidade do lote e do item atualizadas com sucesso!",
        details: `A nova quantidade do lote é ${newLotQuantity}. A nova quantidade total do item é ${newItemQuantity}.`,
        data: { idLot, newLotQuantity, newItemQuantity },
        arrayName: "data",
      });
    } catch (error) {
      console.error("Erro ao atualizar quantidade do lote único:", error);
      await queryAsync("ROLLBACK");
      return handleResponse(res, 500, {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      });
    }
  }

  static async updateItemInformation(req, res) {
    const { idItem } = req.params;
    const {
      sapCode: newSapCode,
      fkIdCategory,
      technicalSpecs,
      ...otherData
    } = req.body;

    const validationResult = await validateItem.validateUpdateInformation(
      req.body
    );
    if (!validationResult.success) {
      return handleResponse(res, 400, {
        success: false,
        error: validationResult.error || "Erro de validação.",
        details: validationResult.details || validationResult.message,
      });
    }

    try {
      await queryAsync("START TRANSACTION");

      const findItemQuery = "SELECT sapCode FROM item WHERE idItem = ?";
      const [existingItem] = await queryAsync(findItemQuery, [idItem]);
      if (!existingItem) {
        await queryAsync("ROLLBACK");
        return handleResponse(res, 404, {
          success: false,
          error: "Item não encontrado.",
        });
      }

      if (newSapCode !== undefined && newSapCode !== existingItem.sapCode) {
        const checkSapCodeQuery = "SELECT idItem FROM item WHERE sapCode = ?";
        const [itemWithNewSapCode] = await queryAsync(checkSapCodeQuery, [
          newSapCode,
        ]);
        if (itemWithNewSapCode) {
          await queryAsync("ROLLBACK");
          return handleResponse(res, 409, {
            success: false,
            error: "Novo sapCode já está em uso por outro item.",
          });
        }
      }

      const updateFields = [];
      const updateValues = [];

      if (newSapCode !== undefined) {
        updateFields.push("sapCode = ?");
        updateValues.push(newSapCode);
      }

      if (fkIdCategory !== undefined) {
        updateFields.push("fkIdCategory = ?");
        updateValues.push(fkIdCategory);
      }

      for (const key in otherData) {
        updateFields.push(`${key} = ?`);
        updateValues.push(otherData[key]);
      }

      if (updateFields.length > 0) {
        const updateItemQuery = `UPDATE item SET ${updateFields.join(
          ", "
        )} WHERE idItem = ?`;
        await queryAsync(updateItemQuery, [...updateValues, idItem]);
      }

      if (technicalSpecs !== undefined) {
        const existingSpecsQuery = `
                SELECT fkIdTechnicalSpec, specValue
                FROM itemSpec
                WHERE fkIdItem = ?
            `;
        const existingSpecs = await queryAsync(existingSpecsQuery, [idItem]);
        const existingSpecsMap = new Map(
          existingSpecs.map((spec) => [
            String(spec.fkIdTechnicalSpec),
            spec.specValue,
          ])
        );

        const newSpecsMap = new Map(Object.entries(technicalSpecs));

        const specsToInsert = [];
        const specsToUpdate = [];
        const specsToDelete = [];

        for (const [id, value] of newSpecsMap.entries()) {
          if (existingSpecsMap.has(id)) {
            if (existingSpecsMap.get(id) !== value) {
              specsToUpdate.push([value, idItem, id]);
            }
          } else {
            specsToInsert.push([idItem, id, value]);
          }
        }

        for (const [id] of existingSpecsMap.entries()) {
          if (!newSpecsMap.has(id)) {
            specsToDelete.push(id);
          }
        }

        if (specsToInsert.length > 0) {
          await queryAsync(
            "INSERT INTO itemSpec (fkIdItem, fkIdTechnicalSpec, specValue) VALUES ?",
            [specsToInsert]
          );
        }

        if (specsToUpdate.length > 0) {
          for (const [value, itemId, specId] of specsToUpdate) {
            await queryAsync(
              "UPDATE itemSpec SET specValue = ? WHERE fkIdItem = ? AND fkIdTechnicalSpec = ?",
              [value, itemId, specId]
            );
          }
        }

        if (specsToDelete.length > 0) {
          await queryAsync(
            "DELETE FROM itemSpec WHERE fkIdItem = ? AND fkIdTechnicalSpec IN (?)",
            [idItem, specsToDelete]
          );
        }
      }

      await queryAsync("COMMIT");

      return handleResponse(res, 200, {
        success: true,
        message: "Informações do item atualizadas com sucesso!",
        details: "As informações do item foram salvas.",
      });
    } catch (error) {
      console.error("Erro ao atualizar informações do item:", error);
      await queryAsync("ROLLBACK");
      return handleResponse(res, 500, {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      });
    }
  }

  static async insertImage(req, res) {
    const { idItem } = req.params;
    const imageFile = req.file;

    if (!imageFile) {
      return handleResponse(res, 400, {
        success: false,
        error: "Nenhuma imagem foi enviada.",
      });
    }

    try {
      const [item] = await queryAsync(
        "SELECT fkIdImage FROM item WHERE idItem = ?",
        [idItem]
      );

      if (!item) {
        await fs
          .unlink(imageFile.path)
          .catch((err) =>
            console.error("Erro ao remover arquivo temporário:", err)
          );
        return handleResponse(res, 404, {
          success: false,
          error: "Item não encontrado.",
        });
      }

      const imageData = await fs.readFile(imageFile.path);
      const imageType = imageFile.mimetype;

      let message;
      let statusCode;
      let fkIdImage;

      if (item.fkIdImage) {
        await queryAsync(
          "UPDATE image SET imageData = ?, imageType = ? WHERE idImage = ?",
          [imageData, imageType, item.fkIdImage]
        );
        fkIdImage = item.fkIdImage;
        message = "Imagem do item atualizada com sucesso!";
        statusCode = 200;
      } else {
        const imageResult = await queryAsync(
          "INSERT INTO image (imageData, imageType) VALUES (?, ?)",
          [imageData, imageType]
        );
        fkIdImage = imageResult.insertId;
        await queryAsync("UPDATE item SET fkIdImage = ? WHERE idItem = ?", [
          fkIdImage,
          idItem,
        ]);
        message = "Imagem adicionada com sucesso ao item!";
        statusCode = 201;
      }

      await fs
        .unlink(imageFile.path)
        .catch((err) =>
          console.error("Erro ao remover arquivo temporário:", err)
        );
      return handleResponse(res, statusCode, {
        success: true,
        message,
        data: { fkIdImage },
        arrayName: "data",
      });
    } catch (error) {
      console.error("Erro ao inserir/atualizar imagem do item:", error);
      if (imageFile) {
        await fs
          .unlink(imageFile.path)
          .catch((err) =>
            console.error("Erro ao remover arquivo temporário:", err)
          );
      }
      return handleResponse(res, 500, {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      });
    }
  }

  static async deleteImage(req, res) {
    const { idItem } = req.params;
    try {
      const [item] = await queryAsync(
        "SELECT fkIdImage FROM item WHERE idItem = ?",
        [idItem]
      );
      if (!item) {
        return handleResponse(res, 404, {
          success: false,
          error: "Item não encontrado.",
        });
      }
      if (!item.fkIdImage) {
        return handleResponse(res, 404, {
          success: false,
          error: "Este item não possui uma imagem para ser excluída.",
        });
      }
      await queryAsync("START TRANSACTION");
      await queryAsync("UPDATE item SET fkIdImage = NULL WHERE idItem = ?", [
        idItem,
      ]);
      await queryAsync("DELETE FROM image WHERE idImage = ?", [item.fkIdImage]);
      await queryAsync("COMMIT");
      return handleResponse(res, 200, {
        success: true,
        message: "Imagem do item excluída com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir imagem do item:", error);
      await queryAsync("ROLLBACK");
      return handleResponse(res, 500, {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      });
    }
  }

  static async deleteItem(req, res) {
    const { idItem } = req.params;
    try {
      await queryAsync("START TRANSACTION");
      const getItemQuery = "SELECT fkIdImage FROM item WHERE idItem = ?";
      const [item] = await queryAsync(getItemQuery, [idItem]);
      if (!item) {
        await queryAsync("ROLLBACK");
        return handleResponse(res, 404, {
          success: false,
          error: "Item não encontrado.",
        });
      }
      await queryAsync(
        "DELETE FROM transactions WHERE fkIdLot IN (SELECT idLot FROM lots WHERE fkIdItem = ?)",
        [idItem]
      );
      await queryAsync("DELETE FROM lots WHERE fkIdItem = ?", [idItem]);
      await queryAsync("DELETE FROM item WHERE idItem = ?", [idItem]);
      if (item.fkIdImage) {
        await queryAsync("DELETE FROM image WHERE idImage = ?", [
          item.fkIdImage,
        ]);
      }
      await queryAsync("COMMIT");
      return handleResponse(res, 200, {
        success: true,
        message:
          "Item e dados associados (lotes, transações e imagem) excluídos com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      await queryAsync("ROLLBACK");
      return handleResponse(res, 500, {
        success: false,
        error: "Erro interno do servidor",
        details: error.message,
      });
    }
  }
};
