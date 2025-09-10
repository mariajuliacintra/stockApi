const express = require("express");
const multer = require("multer");
const ApkController = require("../controllers/apkController");

const router = express.Router();

// Configuração do multer (usando memória, igual ao exemplo)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 300 * 1024 * 1024 }, // limite 300MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/vnd.android.package-archive" ||
      file.originalname.endsWith(".apk")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Somente arquivos APK são permitidos"));
    }
  }
});

// Upload do APK (rota protegida para admin)
router.post("/upload", upload.single("apk"), ApkController.uploadApk);

// Download do último APK (público)
router.get("/download", ApkController.downloadApk);

module.exports = router;
