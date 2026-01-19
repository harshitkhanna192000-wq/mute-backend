const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./auth.model");


const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const register = async ({ email, password, displayName }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
    displayName
  });

  const token = generateToken(user);

  return {
    token,
    user: {
      _id: user._id,
      email: user.email,
      displayName: user.displayName
    }
  };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      _id: user._id,
      email: user.email,
      displayName: user.displayName
    }
  };
};

module.exports = { register, login };
