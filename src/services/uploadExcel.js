const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname, "..", "uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
        return cb(null, true);
    }
    cb(new Error("Error: Apenas arquivos Excel são permitidos (.xlsx, .xls)!"));
};

const uploadExcel = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // até 10MB
    fileFilter: fileFilter
});

module.exports = uploadExcel;
