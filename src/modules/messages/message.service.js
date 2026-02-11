const Message = require("./message.model");
const Conversation = require("../conversations/conversation.model");


/**
 * Send a message (text or media)
 * Returns populated message for frontend
 */
const sendMessage = async ({ conversationId, senderId, text, mediaId }) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  if (!conversation.participants.some((p) => p.toString() === senderId)) {
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
    readBy: [senderId],
  });

  // ✅ populate sender + media for frontend + socket clients
  const populated = await Message.findById(message._id).populate("sender", "_id email displayName avatar lastSeen isOnline").populate("media").lean();

  return populated;
};

/**
 * Get messages with cursor-based pagination
 * cursor = createdAt of oldest loaded message
 */
const getMessages = async ({ conversationId, userId, limit = 20, cursor }) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  if (!conversation.participants.some((p) => p.toString() === userId)) {
    throw new Error("Unauthorized");
  }

  const query = { conversation: conversationId };

  if (cursor) {
    const cursorDate = new Date(cursor);
    if (!isNaN(cursorDate.getTime())) {
      query.createdAt = { $lt: cursorDate };
    }
  }

  const safeLimit = Math.min(Number(limit) || 20, 100);

  const messages = await Message.find(query).sort({ createdAt: -1 }).limit(safeLimit).populate("sender", "_id displayName avatar").populate("media").lean();

  return messages;
};

/**
 * Get undelivered messages for a user in a conversation
 */
const getUndeliveredMessages = async (conversationId, userId) => {
  return Message.find({
    conversation: conversationId,
    sender: { $ne: userId },
    status: "sent",
    readBy: { $ne: userId },
  })
    .sort({ createdAt: 1 })
    .populate("sender", "_id displayName avatar")
    .populate("media")
    .lean();
};

module.exports = {
  sendMessage,
  getMessages,
  getUndeliveredMessages,
};
