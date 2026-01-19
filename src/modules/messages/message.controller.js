const messageService = require("./message.service");

const send = async (req, res) => {
  try {
    const message = await messageService.sendMessage({
      conversationId: req.body.conversationId,
      senderId: req.user.id,
      text: req.body.text,
      mediaId: req.body.mediaId
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const list = async (req, res) => {
  try {
    const messages = await messageService.getMessages({
      conversationId: req.params.conversationId, // ✅ FIX
      userId: req.user.id,
      limit: req.query.limit,
      cursor: req.query.cursor
    });

    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const undelivered = async (req, res) => {
  try {
    const messages = await messageService.getUndeliveredMessages(
      req.query.conversationId,
      req.user.id
    );
    res.status(200).json(messages);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};


module.exports = { send, list, undelivered };
