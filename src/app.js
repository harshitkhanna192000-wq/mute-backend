const express = require("express");
const cors = require("cors");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const mediaRoutes = require("./modules/media/media.routes");
const connectionRoutes = require("./modules/connections/connection.routes");
const conversationRoutes = require("./modules/conversations/conversation.routes");
const messageRoutes = require("./modules/messages/message.routes");


const app = express();

app.use(
  cors({
    origin: ["https://muted-nine.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);



app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

module.exports = app;
