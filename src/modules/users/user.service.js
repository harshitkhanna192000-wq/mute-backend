const User = require("../auth/auth.model");

const getMe = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};


module.exports = { getMe };
