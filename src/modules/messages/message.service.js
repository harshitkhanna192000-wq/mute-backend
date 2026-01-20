const Message = require("./message.model");
const Conversation = require("../conversations/conversation.model");

/**
 * Send a message
 */
const sendMessage = async ({ conversationId, senderId, text, mediaId }) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) throw new Error("Conversation not found");

  if (!conversation.participants.some(p => p.toString() === senderId)) {
    throw new Error("Not a participant of this conversation");
  }

  if (!text && !mediaId) {
    throw new Error("Message must contain text or media");
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    type: mediaId ? "media" : "text",
    text: text || null,
    media: mediaId || null,
    status: "sent",
    readBy: [senderId]
  });

  return message;
};

/**
 * Get messages with cursor-based pagination
 * Cursor = createdAt of the oldest loaded message
 */
const getMessages = async ({ conversationId, userId, limit = 20, cursor }) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) throw new Error("Conversation not found");

  if (!conversation.participants.some(p => p.toString() === userId)) {
    throw new Error("Unauthorized");
  }

  const query = { conversation: conversationId };

  // Cursor pagination by createdAt
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 }) // newest first
    .limit(Number(limit))
    .populate("sender", "displayName avatar")
    .populate("media")
    .lean();

  return messages;
};

/**
 * Get undelivered messages for a user
 */
const getUndeliveredMessages = async (conversationId, userId) => {
  return Message.find({
    conversation: conversationId,
    sender: { $ne: userId },
    status: "sent",
    readBy: { $ne: userId }
  })
    .sort({ createdAt: 1 })
    .populate("sender", "displayName avatar")
    .populate("media")
    .lean();
};

module.exports = {
  sendMessage,
  getMessages,
  getUndeliveredMessages
};
