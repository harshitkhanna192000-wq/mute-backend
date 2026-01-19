const express = require("express");
const router = express.Router();
const controller = require("./message.controller");
const auth = require("../../middlewares/auth.middleware");

// send message
router.post("/", auth, controller.send);

// ✅ GET messages for a conversation
router.get("/:conversationId", auth, controller.list);

// optional: undelivered
router.get("/undelivered", auth, controller.undelivered);

module.exports = router;
