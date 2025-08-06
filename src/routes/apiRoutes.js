const router = require("express").Router(); //importando o módolo express

const usuarioController = require("../controllers/userController");
const verifyJWT = require("../middlewares/verifyJWT");

router.post("/register", usuarioController.createUsuarios);
router.post("/login",  usuarioController.loginUsuario);

router.get("/users", verifyJWT, usuarioController.getAllUsers);

module.exports = router;

//Exportândo a instância de express configurada, para que seja acessada em outros arquivos
