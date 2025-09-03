const router = require("express").Router();

const reportController = require("../controllers/reportController");
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

router.get("/item", verifyJWT, itemController.getAllItems);
router.get("/item/:category", verifyJWT, itemController.getItemsByCategory);
router.post("/item", verifyJWT, authorizeManager, itemController.createItem);
router.post("/item/withdraw", verifyJWT, authorizeManager, itemController.withdrawItem);
router.put("/item/:idItem", verifyJWT, authorizeManager, itemController.updateItem);
router.delete("/item/:idItem", verifyJWT, authorizeManager, itemController.deleteItem);

router.get("/location", verifyJWT, locationController.getLocations);
router.get("/location/:idLocation", verifyJWT, locationController.getLocationById);
router.post("/location", verifyJWT, authorizeManager, locationController.createLocation);
router.put("/location/:idLocation", verifyJWT, authorizeManager, locationController.updateLocation);
router.delete("/location/:idLocation", verifyJWT, authorizeManager, locationController.deleteLocation);

router.get("/report/general", verifyJWT, authorizeManager, reportController.generateGeneralReport);
router.get("/report/low-stock", verifyJWT, authorizeManager, reportController.generateLowStockReport);
router.get("/report/transactions", verifyJWT, authorizeManager, reportController.generateTransactionsReport);
router.get("/report/by-location", verifyJWT, authorizeManager, reportController.generateByLocationReport);
router.get("/report/users", verifyJWT, authorizeManager, reportController.generateUsersReport);

router.get("/transactions", verifyJWT, authorizeManager, transactionController.getAllTransactions);
router.get("/transactions/:idTransaction", verifyJWT, authorizeManager, transactionController.getTransactionById);
router.post("/transactions", verifyJWT, authorizeManager, transactionController.addTransaction);
router.get("/transactions/item/:fkIdItem", verifyJWT, authorizeManager, transactionController.getTransactionByItem);
router.get("/transactions/user/:fkIdUser", verifyJWT, transactionController.getTransactionByUser);

module.exports = router;
