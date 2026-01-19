const cloudinary = require("../../config/cloudinary");
const Media = require("./media.model");

const uploadMedia = async (file, userId) => {
  if (!file) {
    throw new Error("No file provided");
  }

  const resourceType =
    file.mimetype.startsWith("image")
      ? "image"
      : file.mimetype.startsWith("video")
      ? "video"
      : "raw";

  const result = await cloudinary.uploader.upload(file.path, {
    resource_type: resourceType
  });

  const media = await Media.create({
    owner: userId,
    url: result.secure_url,
    publicId: result.public_id,
    type: resourceType === "raw" ? "file" : resourceType,
    format: result.format,
    size: result.bytes
  });

  return media;
};

module.exports = { uploadMedia };
