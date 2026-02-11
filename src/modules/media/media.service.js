const cloudinary = require("../../config/cloudinary");
const Media = require("./media.model");
const fs = require("fs/promises");

const uploadMedia = async (file, userId) => {
  if (!file) throw new Error("No file provided");

  const resourceType =
    file.mimetype.startsWith("image")
      ? "image"
      : file.mimetype.startsWith("video")
      ? "video"
      : "raw";

  let result;
  try {
    result = await cloudinary.uploader.upload(file.path, {
      resource_type: resourceType,
      folder: "muted", // optional
    });
  } finally {
    // ✅ IMPORTANT: clean local file even if cloudinary fails partially
    try {
      await fs.unlink(file.path);
    } catch (_) {}
  }

  const media = await Media.create({
    owner: userId,
    url: result.secure_url,
    publicId: result.public_id,
    type: resourceType === "raw" ? "file" : resourceType,
    format: result.format,
    size: result.bytes,
  });

  return media;
};

module.exports = { uploadMedia };
