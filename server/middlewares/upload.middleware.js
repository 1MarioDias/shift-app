const multer = require('multer');
const path = require('path');
const { ErrorHandler } = require('../utils/error');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedFiletypes = /jpeg|jpg|png|gif/;
    const allowedMimetypes = /image\/jpeg|image\/jpg|image\/png|image\/gif/;

    const extnameValid = allowedFiletypes.test(path.extname(file.originalname).toLowerCase());
    const mimetypeValid = allowedMimetypes.test(file.mimetype);

    if (mimetypeValid && extnameValid) {
        cb(null, true);
    } else {
        cb(new ErrorHandler(400, 'Upload failed. Invalid file type. Only JPEG, JPG, PNG, GIF image types are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

module.exports = upload;