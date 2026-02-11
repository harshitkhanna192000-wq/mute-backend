const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const registerHandlers = require("./socket.handlers");
const User = require("../modules/auth/auth.model");

const onlineUsers = new Map();

let ioInstance = null;
const getIO = () => ioInstance;

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  ioInstance = io;

  // 🔐 Auth middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.userId };
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    onlineUsers.set(socket.user.id, socket.id);

    await User.findByIdAndUpdate(socket.user.id, {
      isOnline: true,
      lastSeen: null,
    });

    // ✅ Send initial online list to this user
    socket.emit("users:online:list", {
      users: Array.from(onlineUsers.keys()),
    });

    // ✅ notify others
    socket.broadcast.emit("user:online", {
      userId: socket.user.id,
    });

    // ✅ register handlers
    registerHandlers(io, socket, onlineUsers);

    socket.on("disconnect", async () => {
      onlineUsers.delete(socket.user.id);

      const lastSeen = new Date();

      await User.findByIdAndUpdate(socket.user.id, {
        isOnline: false,
        lastSeen,
      });

      socket.broadcast.emit("user:offline", {
        userId: socket.user.id,
        lastSeen,
      });

      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = setupSocket;
module.exports.getIO = getIO;
