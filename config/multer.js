const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure destination directories exist
const uploadDir = path.join(__dirname, '../public/uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate secure, unique filename: [role]-[userId]-[timestamp].[ext]
    const role = (req.session && req.session.user) ? req.session.user.role : 'user';
    const userId = (req.session && req.session.user) ? req.session.user.id : 'unknown';
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${role}-${userId}-${uniqueSuffix}${fileExtension}`);
  }
});

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
