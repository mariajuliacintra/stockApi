const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Adicionado 'heic' e 'heif' à lista de tipos permitidos
  const filetypes = /jpeg|jpg|png|gif|heic|heif/;

  // Testa o MIME type (Ex: image/heic)
  const mimetypeTest = filetypes.test(file.mimetype.toLowerCase());
  // Testa a extensão (Ex: .heic)
  const extnameTest = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetypeTest && extnameTest) {
    return cb(null, true);
  }
  cb(
    new Error(
      "Error: Apenas arquivos de imagem são permitidos (jpeg, jpg, png, gif, heic)!"
    )
  );
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter,
});

module.exports = upload;
