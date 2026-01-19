const Message = require("./message.model");
const Conversation = require("../conversations/conversation.model");

const sendMessage = async ({ conversationId, senderId, text, mediaId }) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) throw new Error("Conversation not found");

  if (!conversation.participants.some(p => p.toString() === senderId)) {
    throw new Error("Not a participant of this conversation");
  }

  if (!text && !mediaId) {
    throw new Error("Message must contain text or media");
  }

  return Message.create({
    conversation: conversationId,
    sender: senderId,
    type: mediaId ? "media" : "text",
    text: text || null,
    media: mediaId || null,
    readBy: [senderId]
  });
};

const getMessages = async ({ conversationId, userId, limit = 20, cursor }) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) throw new Error("Conversation not found");

  if (!conversation.participants.some(p => p.toString() === userId)) {
    throw new Error("Unauthorized");
  }

  const query = { conversation: conversationId };

  if (cursor) {
    query._id = { $lt: cursor };
  }

  return Message.find(query)
    .sort({ createdAt: 1 })
    .limit(Number(limit))
    .populate("sender", "displayName avatar")
    .populate("media")
    .lean();
};

const getUndeliveredMessages = async (conversationId, userId) => {
  return Message.find({
    conversation: conversationId,
    sender: { $ne: userId },
    status: "sent"
  }).sort({ createdAt: 1 });
};

module.exports = {
  sendMessage,
  getMessages,
  getUndeliveredMessages
};
