const express = require("express");
const router = express.Router();
const controller = require("./conversation.controller");
const auth = require("../../middlewares/auth.middleware");

router.get("/", auth, controller.list);

module.exports = router;
