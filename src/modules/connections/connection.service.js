const Connection = require("./connection.model");
const Conversation = require("../conversations/conversation.model");

/* ---------------- SEND INVITE ---------------- */
const sendInvite = async (fromUserId, toUserId) => {
  console.log("🔍 sendInvite called:", { fromUserId, toUserId });
  console.log("🔍 Types:", { 
    fromType: typeof fromUserId, 
    toType: typeof toUserId 
  });

  if (!fromUserId || !toUserId) {
    throw new Error("Both fromUserId and toUserId are required");
  }

  if (fromUserId === toUserId) {
    throw new Error("Cannot connect with yourself");
  }

  const existing = await Connection.findOne({
    $or: [
      { requester: fromUserId, recipient: toUserId },
      { requester: toUserId, recipient: fromUserId },
    ],
  });

  if (existing) {
    throw new Error("Connection already exists");
  }

  const connection = await Connection.create({
    requester: fromUserId,
    recipient: toUserId,
  });

  console.log("✅ Connection created:", connection);
  return connection;
};

/* ---------------- ACCEPT INVITE ---------------- */
const acceptInvite = async (connectionId, userId) => {
  const connection = await Connection.findById(connectionId);

  if (!connection) throw new Error("Connection not found");
  if (connection.recipient.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  connection.status = "accepted";
  await connection.save();

  // prevent duplicate conversations
  let conversation = await Conversation.findOne({
    connection: connection._id,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [connection.requester, connection.recipient],
      connection: connection._id,
    });
  }

  return { connection, conversation };
};

/* ---------------- PENDING INVITES ---------------- */
const getPendingInvites = async (userId) => {
  return Connection.find({
    recipient: userId,
    status: "pending",
  })
    .populate("requester", "_id email displayName avatar")
    .sort({ createdAt: -1 });
};

/* ---------------- ACCEPTED CONNECTIONS (FIXED) ---------------- */
const getAcceptedConnections = async (userId) => {
  const connections = await Connection.find({
    status: "accepted",
    $or: [{ requester: userId }, { recipient: userId }]
  })
    .populate("requester", "_id email displayName avatar")
    .populate("recipient", "_id email displayName avatar");

  const connectionIds = connections.map(c => c._id);

  const conversations = await Conversation.find({
    connection: { $in: connectionIds }
  });

  const conversationMap = {};
  conversations.forEach(c => {
    conversationMap[c.connection.toString()] = c._id;
  });

  return connections.map(conn => ({
    ...conn.toObject(),
    conversationId: conversationMap[conn._id.toString()] || null
  }));
};

module.exports = {
  sendInvite,
  acceptInvite,
  getPendingInvites,
  getAcceptedConnections,
};