const router = require("express").Router(); //importando o módolo express

const usuarioController = require("../controllers/userController");
const verifyJWT = require("../middlewares/verifyJWT");

router.post("/user/register", usuarioController.registerUser);
router.post("/user/verify-register", usuarioController.verifyUser);
router.post("/user/login",  usuarioController.loginUsuario);

router.put("/user/:idUser", verifyJWT, usuarioController.updateUser);
router.post("/user/verify-update", usuarioController.verifyUpdate);

router.delete("/user/:idUser", verifyJWT, usuarioController.deleteUser);

router.get("/users", verifyJWT, usuarioController.getAllUsers);

module.exports = router;

//Exportândo a instância de express configurada, para que seja acessada em outros arquivos
