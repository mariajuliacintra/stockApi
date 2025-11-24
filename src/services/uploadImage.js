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
  // 🎯 MUDANÇA 1: Adicionar 'jfif' na lista de extensões permitidas
  const filetypes = /jpeg|jpg|png|gif|heic|heif|jfif/;

  // 🎯 MUDANÇA 2: Adicionar explicitamente os MIME types comuns para JFIF/JPEG
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/heic",
    "image/heif",
    "image/jfif", // O principal que faltava
    "image/pjpeg", // Garantindo suporte a variações
  ];

  // Testa a extensão do arquivo
  const extnameTest = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  // Testa o MIME type
  const mimetypeTest = allowedMimeTypes.includes(file.mimetype.toLowerCase());

  if (mimetypeTest && extnameTest) {
    return cb(null, true);
  }
  // Retorna o erro com a lista atualizada
  cb(
    new Error(
      "Error: Apenas arquivos de imagem são permitidos (jpeg, jpg, png, gif, heic, heif, jfif)!"
    )
  );
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB
  fileFilter: fileFilter,
});

module.exports = upload;
