const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

const makeStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(UPLOAD_ROOT, folder);
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const ext    = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `${unique}${ext}`);
    },
  });

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const LIMIT = { fileSize: 5 * 1024 * 1024 };

const uploadCard  = multer({ storage: makeStorage('cards'),    fileFilter: imageFilter, limits: LIMIT });
const uploadChild = multer({ storage: makeStorage('children'), fileFilter: imageFilter, limits: LIMIT });

module.exports = { uploadCard, uploadChild };