const router = require("express").Router();

// Controladores de Entidades Principais
const userController = require("../controllers/userController");
const itemController = require("../controllers/itemController");
const lotController = require("../controllers/lotController");
const transactionController = require("../controllers/transactionController");

// Controladores de Gerenciamento de Dados Auxiliares
const locationController = require("../controllers/locationController");
const categoryController = require("../controllers/categoryController");
const technicalSpecController = require("../controllers/technicalSpecController");

// Controladores de Relatórios e Importação
const reportControllerExcel = require("../controllers/reportControllerExcel");
const reportControllerPdf = require("../controllers/reportControllerPdf");
const importControllerReports = require("../controllers/importControllerReports");

// Middlewares de Segurança
const verifyJWT = require("../middlewares/verifyJWT");
const authorizeManager = require("../middlewares/authorizeManager");

// Serviços de Upload
const uploadImage = require('../services/uploadImage');
const uploadExcel = require('../services/uploadExcel');

// - Rotas de Cadastro e Verificação de Conta (Acesso Público e Privado)
// Inclui registro de usuário comum, registro por gerente e confirmação de conta via código.
router.post("/user/register", userController.registerUser);
router.post("/user/register/manager", verifyJWT, authorizeManager ,userController.registerUserByManager);
router.post("/user/verify-register", userController.verifyUser);

// - Rotas de Autenticação
// Gerencia o login do usuário.
router.post("/user/login", userController.loginUser);

// - Rotas de Recuperação de Senha
// Gerencia a solicitação de código, validação do código e redefinição final da senha.
router.post("/user/verify-recovery-password", userController.verifyRecoveryPassword);
router.post("/user/validate-recovery-code", userController.validateRecoveryCode);
router.post("/user/recovery-password", userController.recoveryPassword);

// - Rotas de Gerenciamento de Perfil (CRUD e Validações)
// Inclui atualização de dados, verificação de atualização (para e-mail) e desativação/exclusão da conta.
router.put("/user/:idUser", verifyJWT, userController.updateUser);
router.post("/user/verify-update", userController.verifyUpdate);
router.post("/user/validate-password/:idUser", verifyJWT, userController.validatePassword); // Validação de senha atual
router.delete("/user/:idUser", verifyJWT, userController.deleteUser);

// - Rotas de Leitura de Usuários
// Busca por todos os usuários (apenas gerentes) ou por um usuário específico (o próprio perfil).
router.get("/users", verifyJWT, authorizeManager, userController.getAllUsers);
router.get("/user/:idUser", verifyJWT, userController.getUserById);

// Criação, leitura, atualização, exclusão e gestão de imagens de itens.
router.get("/items", verifyJWT, itemController.getAllItems);
router.get("/item/:idItem/details", verifyJWT, itemController.getItemByIdDetails);
router.post("/items/filter", verifyJWT, itemController.filterItems);

// Rotas para checagem de itens
router.get("/item/check/:sapCode", verifyJWT, itemController.checkItemBySapCode);

// Rotas para a criação e gerenciamento de itens
router.post("/item", verifyJWT, itemController.createItem);
router.put('/item/:idItem/lot/quantity', verifyJWT, itemController.updateSingleLotQuantity);
router.put("/item/information/:idItem", verifyJWT, itemController.updateItemInformation);
router.delete("/item/:idItem", verifyJWT, authorizeManager, itemController.deleteItem);

// Gestão de imagens de itens
router.post("/item/image/:idItem", verifyJWT, uploadImage.single('image'), itemController.insertImage);
router.delete("/item/image/:idItem", verifyJWT, itemController.deleteImage);

// Criação e atualização de lotes de itens.
router.post("/lot/sapcode/:sapCode", verifyJWT,  lotController.createLotBySapCode);
router.post("/lot/item/:idItem", verifyJWT,  lotController.createLotByIdItem);

router.put("/lot/quantity/:idLot", verifyJWT, lotController.updateLotQuantity);
router.put("/lot/information/:idLot", verifyJWT, lotController.updateLotInformation);

// CRUD para gerenciamento de localizações no sistema.
router.get("/location", verifyJWT, locationController.getLocations);
router.get("/location/:idLocation", verifyJWT, locationController.getLocationById);
router.post("/location", verifyJWT, authorizeManager, locationController.createLocation);
router.put("/location/:idLocation", verifyJWT, authorizeManager, locationController.updateLocation);
router.delete("/location/:idLocation", verifyJWT, authorizeManager, locationController.deleteLocation);

// CRUD para gerenciamento de categorias de itens.
router.get("/category", verifyJWT, categoryController.getCategories);
router.get("/category/:idCategory", verifyJWT, categoryController.getCategoryById);
router.post("/category", verifyJWT, authorizeManager, categoryController.createCategory);
router.put("/category/:idCategory", verifyJWT, authorizeManager, categoryController.updateCategory);
router.delete("/category/:idCategory", verifyJWT, authorizeManager, categoryController.deleteCategory);

// CRUD para gerenciamento de especificações técnicas dos itens.
router.get("/technicalSpec", verifyJWT, technicalSpecController.getTechnicalSpecs);
router.get("/technicalSpec/:idTechnicalSpec", verifyJWT, technicalSpecController.getTechnicalSpecById);
router.post("/technicalSpec", verifyJWT, authorizeManager, technicalSpecController.createTechnicalSpec);
router.put("/technicalSpec/:idTechnicalSpec", verifyJWT, authorizeManager, technicalSpecController.updateTechnicalSpec);
router.delete("/technicalSpec/:idTechnicalSpec", verifyJWT, authorizeManager, technicalSpecController.deleteTechnicalSpec);

// Geração de relatórios em formato PDF.
router.get("/report/pdf/general", verifyJWT, authorizeManager, reportControllerPdf.generateGeneralReport);
router.get("/report/pdf/low-stock", verifyJWT, authorizeManager, reportControllerPdf.generateLowStockReport);
router.get("/report/pdf/transactions", verifyJWT, authorizeManager,reportControllerPdf.generateTransactionsReport);

// Geração de relatórios em formato Excel.
router.get("/report/excel/general", verifyJWT, authorizeManager, reportControllerExcel.generateGeneralReportExcel);
router.get("/report/excel/low-stock", verifyJWT, authorizeManager,reportControllerExcel.generateLowStockReportExcel);
router.get("/report/excel/transactions", verifyJWT, authorizeManager, reportControllerExcel.generateTransactionsReportExcel);

// Importação de dados (itens) via arquivo Excel.
router.post("/import/excel/items", uploadExcel.single("file"), verifyJWT, authorizeManager, importControllerReports.importItemsExcel);

// Visualização e adição de transações (movimentações) de itens.
router.get("/transactions", verifyJWT, authorizeManager, transactionController.getAllTransactions);
router.get("/transactions/:idTransaction", verifyJWT, authorizeManager, transactionController.getTransactionById);
router.post("/transactions", verifyJWT, authorizeManager, transactionController.addTransaction);
router.get("/transactions/item/:fkIdItem", verifyJWT, authorizeManager, transactionController.getTransactionByItem);
router.get("/transactions/user/:fkIdUser", verifyJWT, transactionController.getTransactionByUser);

// Rota de saúde da API.
router.get("/", (req, res) => {
  res.status(200).json({ status: "API Online" });
});

module.exports = router;