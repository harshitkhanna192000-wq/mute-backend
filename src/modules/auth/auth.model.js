const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      default: ""
    },
    
     avatar: {
    type: String,
    default: null,
  },
  lastSeen: {
    type: Date,
    default: null,
  },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
