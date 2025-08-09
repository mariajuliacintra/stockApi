const router = require("express").Router();

const usuarioController = require("../controllers/userController");
const transactionController = require("../controllers/transactionController");
const toolController = require("../controllers/itemsControllers/toolController");
const materialController = require("../controllers/itemsControllers/materialController");
const rawMaterialController = require("../controllers/itemsControllers/rawMaterialController");
const equipmentController = require("../controllers/itemsControllers/equipmentController");
const productController = require("../controllers/itemsControllers/productController");
const diversesController = require("../controllers/itemsControllers/diversesController");
const locationController = require("../controllers/locationController");

const verifyJWT = require("../middlewares/verifyJWT");

router.post("/user/register", usuarioController.registerUser);
router.post("/user/verify-register", usuarioController.verifyUser);
router.post("/user/login", usuarioController.loginUser);
router.put("/user/:idUser", verifyJWT, usuarioController.updateUser);
router.post("/user/verify-update", usuarioController.verifyUpdate);
router.delete("/user/:idUser", verifyJWT, usuarioController.deleteUser);
router.get("/users", verifyJWT, usuarioController.getAllUsers);

// Routes for Locations
router.post("/location", verifyJWT, locationController.createLocation);
router.get("/locations", verifyJWT, locationController.getAllLocations);
router.get("/location/:idLocation", verifyJWT, locationController.getLocationById);
router.put("/location/:idLocation", verifyJWT, locationController.updateLocation);
router.delete("/location/:idLocation", verifyJWT, locationController.deleteLocation);

// Routes for Tools
router.post("/tool", verifyJWT, toolController.createTool);
router.get("/tools", verifyJWT, toolController.getAllTools);
router.get("/tool/:idTool", verifyJWT, toolController.getToolById);
router.put("/tool/:idTool", verifyJWT, toolController.updateTool);
router.delete("/tool/:idTool", verifyJWT, toolController.deleteTool);

// Routes for Materials
router.post("/material", verifyJWT, materialController.createMaterial);
router.get("/materials", verifyJWT, materialController.getAllMaterials);
router.get("/material/:idMaterial", verifyJWT, materialController.getMaterialById);
router.put("/material/:idMaterial", verifyJWT, materialController.updateMaterial);
router.delete("/material/:idMaterial", verifyJWT, materialController.deleteMaterial);

// Routes for Raw Materials
router.post("/rawMaterial", verifyJWT, rawMaterialController.createRawMaterial);
router.get("/rawMaterials", verifyJWT, rawMaterialController.getAllRawMaterials);
router.get("/rawMaterial/:idRawMaterial", verifyJWT, rawMaterialController.getRawMaterialById);
router.put("/rawMaterial/:idRawMaterial", verifyJWT, rawMaterialController.updateRawMaterial);
router.delete("/rawMaterial/:idRawMaterial", verifyJWT, rawMaterialController.deleteRawMaterial);

// Routes for Equipment
router.post("/equipment", verifyJWT, equipmentController.createEquipment);
router.get("/equipments", verifyJWT, equipmentController.getAllEquipment);
router.get("/equipment/:idEquipment", verifyJWT, equipmentController.getEquipmentById);
router.put("/equipment/:idEquipment", verifyJWT, equipmentController.updateEquipment);
router.delete("/equipment/:idEquipment", verifyJWT, equipmentController.deleteEquipment);

// Routes for Products
router.post("/product", verifyJWT, productController.createProduct);
router.get("/products", verifyJWT, productController.getAllProducts);
router.get("/product/:idProduct", verifyJWT, productController.getProductById);
router.put("/product/:idProduct", verifyJWT, productController.updateProduct);
router.delete("/product/:idProduct", verifyJWT, productController.deleteProduct);

// Routes for Diverse Items
router.post("/diverses", verifyJWT, diversesController.createDiverses);
router.get("/diverses-items", verifyJWT, diversesController.getAllDiverses);
router.get("/diverses/:idDiverses", verifyJWT, diversesController.getDiversesById);
router.put("/diverses/:idDiverses", verifyJWT, diversesController.updateDiverses);
router.delete("/diverses/:idDiverses", verifyJWT, diversesController.deleteDiverses);

// Routes for Transactions
router.post("/transaction", verifyJWT, transactionController.createTransactionFromRequest);
router.get("/transactions", verifyJWT, transactionController.getAllTransactions);
router.get("/transaction/:idTransaction", verifyJWT, transactionController.getTransactionById);
router.put("/transaction/:idTransaction", verifyJWT, transactionController.updateTransaction);
router.delete("/transaction/:idTransaction", verifyJWT, transactionController.deleteTransaction);

// Route for AJUST using transactionController
router.put("/ajust", verifyJWT, async (req, res) => {
    try {
        const { fkIdUser, itemType, itemId, newQuantity } = req.body;
        await transactionController.ajust(fkIdUser, itemType, itemId, newQuantity);
        res.status(200).json({ message: "Ajuste realizado com sucesso." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
