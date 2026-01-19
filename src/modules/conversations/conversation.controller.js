const service = require("./conversation.service");

const list = async (req, res) => {
  try {
    // req.user.id comes from authMiddleware (decoded.userId)
    const conversations = await service.getMyConversations(req.user.id);

    res.status(200).json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

module.exports = { list };
