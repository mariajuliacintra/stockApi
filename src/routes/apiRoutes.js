const router = require("express").Router();

const ReportControllerExcel = require("../controllers/reportControllerExcel");
const reportControllerPdf = require("../controllers/reportControllerPdf");
const userController = require("../controllers/userController");
const itemController = require("../controllers/itemController");
const locationController = require("../controllers/locationController");
const transactionController = require("../controllers/transactionController");

const verifyJWT = require("../middlewares/verifyJWT");
const authorizeManager = require("../middlewares/authorizeManager");

router.post("/user/register", userController.registerUser);
router.post("/user/verify-register", userController.verifyUser);
router.post("/user/login", userController.loginUser);
router.put("/user/:idUser", verifyJWT, userController.updateUser);
router.post("/user/verify-update", userController.verifyUpdate);
router.delete("/user/:idUser", verifyJWT, userController.deleteUser);
router.get("/users", verifyJWT, authorizeManager, userController.getAllUsers);
router.post("/user/verify-recovery-password", userController.verifyRecoveryPassword);
router.post("/user/validate-recovery-code", userController.validateRecoveryCode);
router.post("/user/recovery-password", userController.recoveryPassword);

router.get("/items/", verifyJWT, itemController.getAllItems);
router.get("/items/details", verifyJWT, itemController.getAllItemsDetails);
router.get("/item/:category", verifyJWT, itemController.getItemsByCategory);
router.get("/item/:category/details", verifyJWT, itemController.getItemsByCategoryDetails);
router.post("/item", verifyJWT, authorizeManager, itemController.createItem);
router.put("/item/:idItem", verifyJWT, authorizeManager, itemController.updateItem);
router.delete("/item/:idItem", verifyJWT, authorizeManager, itemController.deleteItem);

router.get("/location", verifyJWT, locationController.getLocations);
router.get("/location/:idLocation", verifyJWT, locationController.getLocationById);
router.post("/location", verifyJWT, authorizeManager, locationController.createLocation);
router.put("/location/:idLocation", verifyJWT, authorizeManager, locationController.updateLocation);
router.delete("/location/:idLocation", verifyJWT, authorizeManager, locationController.deleteLocation);

router.get("/report/pdf/general",verifyJWT, authorizeManager, reportControllerPdf.generateGeneralReport);
router.get("/report/pdf/low-stock", verifyJWT, authorizeManager, reportControllerPdf.generateLowStockReport);
router.get("/report/pdf/transactions", verifyJWT, authorizeManager,reportControllerPdf.generateTransactionsReport);

router.get("/report/excel/general", ReportControllerExcel.generateGeneralReportExcel);
router.get("/report/excel/low-stock",ReportControllerExcel.generateLowStockReportExcel);
router.get("/report/excel/transactions", ReportControllerExcel.generateTransactionsReportExcel);

router.get("/transactions", verifyJWT, authorizeManager, transactionController.getAllTransactions);
router.get("/transactions/:idTransaction", verifyJWT, authorizeManager, transactionController.getTransactionById);
router.post("/transactions", verifyJWT, authorizeManager, transactionController.addTransaction);
router.get("/transactions/item/:fkIdItem", verifyJWT, authorizeManager, transactionController.getTransactionByItem);
router.get("/transactions/user/:fkIdUser", verifyJWT, transactionController.getTransactionByUser);

module.exports = router;
