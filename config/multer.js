const multer = require('multer');

// Memory Storage Configuration
const storage = multer.memoryStorage();

// File Filter for Images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, and PNG images are allowed!'), false);
  }
};

// Multer Upload Instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 MB Limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
