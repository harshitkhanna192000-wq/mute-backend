const Message = require("../modules/messages/message.model");
const Conversation = require("../modules/conversations/conversation.model");

module.exports = (io, socket, onlineUsers) => {
  const userId = socket.user.id;

  // 🔹 Join conversation room
  socket.on("conversation:join", async ({ conversationId }) => {
    const conversation = await Conversation.findById(conversationId);

    if (
      conversation &&
      conversation.participants.map(String).includes(userId)
    ) {
      socket.join(conversationId);
      console.log(`👥 User ${userId} joined ${conversationId}`);
    }
  });

  // 🔹 Leave room
  socket.on("conversation:leave", ({ conversationId }) => {
    socket.leave(conversationId);
  });

  // 🔹 Send message (REALTIME SOURCE OF TRUTH)
  socket.on("message:send", async (payload, ack) => {
    try {
      const { conversationId, text } = payload;

      const conversation = await Conversation.findById(conversationId);
      if (
        !conversation ||
        !conversation.participants.map(String).includes(userId)
      ) {
        throw new Error("Unauthorized");
      }

      const message = await Message.create({
        conversation: conversationId,
        sender: userId,
        type: "text",          // ✅ REQUIRED FIELD
        text,
        status: "sent",
        readBy: [userId],
      });

      const populatedMessage = await message.populate("sender", "_id name avatar");


      // 🔥 emit realtime message
      io.to(conversationId).emit("message:new", message);

      // delivery status
      const recipientId = conversation.participants
        .map(String)
        .find((id) => id !== userId);

      if (recipientId && onlineUsers.has(recipientId)) {
        message.status = "delivered";
        await message.save();

        io.to(conversationId).emit("message:delivered", {
          messageId: message._id,
        });
      }

      ack?.({ status: "ok", messageId: message._id });
    } catch (err) {
      ack?.({ status: "error", message: err.message });
    }
  });

  // ✍️ Typing
  socket.on("typing:start", ({ conversationId }) => {
    socket.to(conversationId).emit("typing:start", { userId });
  });

  socket.on("typing:stop", ({ conversationId }) => {
    socket.to(conversationId).emit("typing:stop", { userId });
  });

  // 👀 Read receipt
  socket.on("message:read", async ({ messageId, conversationId }) => {
    const message = await Message.findById(messageId);
    if (!message) return;

    message.status = "read";
    await message.save();

    socket.to(conversationId).emit("message:read", {
      messageId,
      userId,
    });
  });
};
