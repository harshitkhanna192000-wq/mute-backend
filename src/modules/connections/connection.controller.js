const connectionService = require("./connection.service");

const invite = async (req, res) => {
  try {
    // ✅ Add validation logging
    console.log("Invite request:", {
      fromUser: req.user.id,
      toUser: req.body.userId,
      body: req.body
    });

    if (!req.body.userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const connection = await connectionService.sendInvite(
      req.user.id,
      req.body.userId
    );
    
    res.status(201).json(connection);
  } catch (error) {
    console.error("Invite error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const accept = async (req, res) => {
  try {
    const result = await connectionService.acceptInvite(
      req.params.id,
      req.user.id
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getPendingInvites = async (req, res) => {
  try {
    const invites = await connectionService.getPendingInvites(req.user.id);
    res.status(200).json(invites);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAcceptedConnections = async (req, res) => {
  try {
    const connections = await connectionService.getAcceptedConnections(req.user.id);
    res.status(200).json(connections);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { invite, accept, getPendingInvites, getAcceptedConnections };