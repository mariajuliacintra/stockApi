const authorizeManager = (req, res, next) => {
    if (req.role !== "manager") {
      return res.status(403).json({
        auth: false,
        message: "Acesso negado. Apenas administradores podem realizar esta ação.",
      });
    }
    next();
  };
  
module.exports = authorizeManager;