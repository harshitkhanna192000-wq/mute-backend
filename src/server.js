require("dotenv").config();
const app = require("./app");
const http = require("http");
const connectDB = require("./config/db");
const setupSocket = require("./realtime/socket");

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

// attach socket.io to SAME server
setupSocket(server);

// 🚀 THIS IS THE IMPORTANT PART
server.listen(PORT, () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});
