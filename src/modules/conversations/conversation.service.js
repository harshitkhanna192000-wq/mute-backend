const Conversation = require("./conversation.model");

const getMyConversations = async (userId) => {
  // userId must be a STRING like "696bc022f108d2d9e7f6e2cc"
  return Conversation.find({
    participants: { $in: [userId] }
  }).populate("participants", "_id email displayName avatar lastSeen isOnline");
};

module.exports = { getMyConversations };
