const express = require("express");
const router = express.Router();
const controller = require("./connection.controller");
const userController = require("../users/user.controller");
const auth = require("../../middlewares/auth.middleware");

router.post("/invite", auth, controller.invite);
router.post("/:id/accept", auth, controller.accept);
router.get("/pending", auth, controller.getPendingInvites);
router.get("/accepted", auth, controller.getAcceptedConnections);
router.get("/users/by-email", auth, userController.findByEmail);



module.exports = router;
