const authService = require("./auth.service");
const User = require("./auth.model");
const cloudinary = require("../../config/cloudinary");



const register = async (req, res) => {
  try {
    const { token, user } = await authService.register(req.body);
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { token, user } = await authService.login(req.body);
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};






module.exports = { register, login };
