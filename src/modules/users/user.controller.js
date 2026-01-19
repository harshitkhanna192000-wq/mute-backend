const userService = require("./user.service");
const cloudinary = require("../../config/cloudinary");
const User = require("../auth/auth.model");



const getMe = async (req, res) => {
  try {
    const user = await userService.getMe(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};


const updateAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  cloudinary.uploader.upload_stream(
    {
      folder: "avatars",
      public_id: `${req.user.id}-${Date.now()}`,
      overwrite: true,
    },
    async (error, result) => {
      if (error) {
        return res.status(500).json({ message: "Cloudinary upload failed" });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: result.secure_url },
        { new: true }
      ).select("_id email displayName avatar");

      res.json(user);
    }
  ).end(req.file.buffer);
};

const updateMe = async (req, res) => {
  try {
    const { displayName } = req.body;

    if (!displayName) {
      return res.status(400).json({ message: "Display name is required" });
    }

    // Fetch the user from the DB
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the displayName and save
    user.displayName = displayName;
    await user.save();

    // Remove password before sending response
    const userObj = user.toObject();
    delete userObj.password;

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const findByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email }).select(
      "_id email displayName avatar"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};





module.exports = { getMe, updateAvatar,updateMe, findByEmail };
