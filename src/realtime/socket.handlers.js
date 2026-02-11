const Conversation = require("../modules/conversations/conversation.model");
const messageService = require("../modules/messages/message.service");

module.exports = (io, socket, onlineUsers) => {
  const userId = socket.user.id;

  socket.on("conversation:join", async ({ conversationId }) => {
    const conversation = await Conversation.findById(conversationId);

    if (conversation && conversation.participants.map(String).includes(userId)) {
      socket.join(conversationId);
      console.log(`👥 User ${userId} joined ${conversationId}`);
    }
  });

  socket.on("conversation:leave", ({ conversationId }) => {
    socket.leave(conversationId);
  });

  // ✅ REALTIME SOURCE OF TRUTH (supports text + media)
  socket.on("message:send", async (payload, ack) => {
    try {
      const { conversationId, text, mediaId } = payload;

      // ✅ Use service so it validates + populates sender + media
      const populatedMessage = await messageService.sendMessage({
        conversationId,
        senderId: userId,
        text,
        mediaId,
      });

      // ✅ emit the POPULATED message (this is what receiver needs)
      io.to(conversationId).emit("message:new", populatedMessage);

      // delivery status
      const conversation = await Conversation.findById(conversationId).lean();
      const recipientId = conversation.participants
        .map(String)
        .find((id) => id !== userId);

      if (recipientId && onlineUsers.has(recipientId)) {
        io.to(conversationId).emit("message:delivered", {
          messageId: populatedMessage._id,
        });
      }

      ack?.({ status: "ok", messageId: populatedMessage._id });
    } catch (err) {
      ack?.({ status: "error", message: err.message });
    }
  });

  socket.on("typing:start", ({ conversationId }) => {
    socket.to(conversationId).emit("typing:start", { userId });
  });

  socket.on("typing:stop", ({ conversationId }) => {
    socket.to(conversationId).emit("typing:stop", { userId });
  });

  socket.on("message:read", async ({ messageId, conversationId }) => {
    // optional: keep your existing logic
    socket.to(conversationId).emit("message:read", { messageId, userId });
  });
};
