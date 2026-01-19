const multer = require("multer");

const storage = multer.memoryStorage(); // 🔥 IMPORTANT

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 2MB
  },
});

module.exports = uploadAvatar;
