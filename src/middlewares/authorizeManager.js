const { handleResponse } = require("../utils/functions");

const authorizeManager = (req, res, next) => {
  if (req.role !== "manager") {
    return handleResponse(res, 403, {
      success: false,
      error: "Acesso negado",
      details: "Apenas administradores podem realizar esta ação.",
    });
  }
  next();
};
module.exports = authorizeManager;
