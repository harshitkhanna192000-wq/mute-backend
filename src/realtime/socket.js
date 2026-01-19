const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const registerHandlers = require("./socket.handlers");

const onlineUsers = new Map();

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // 🔐 Auth middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.userId };
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    onlineUsers.set(socket.user.id, socket.id);

    // ✅ PASS onlineUsers
    registerHandlers(io, socket, onlineUsers);

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.user.id);
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
};

module.exports = setupSocket;
