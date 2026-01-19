const express = require("express");
const router = express.Router();
const mediaController = require("./media.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const upload = require("./media.upload");

router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  mediaController.upload
);

module.exports = router;
