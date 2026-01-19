const mediaService = require("./media.service");

const upload = async (req, res) => {
  try {
    const media = await mediaService.uploadMedia(req.file, req.user.id);
    res.status(201).json(media);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { upload };
