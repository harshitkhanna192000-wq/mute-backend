const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const uploadAvatar = require("../../middlewares/upload.middleware");
const authMiddleware = require("../../middlewares/auth.middleware");

router.get("/me", authMiddleware, userController.getMe);

router.put(
  "/me/avatar",
  authMiddleware,
  uploadAvatar.single("avatar"),
  userController.updateAvatar
);

router.put(
  "/me",
  authMiddleware,
  userController.updateMe
);

module.exports = router;
