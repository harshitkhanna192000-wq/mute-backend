const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["image", "video", "file"],
      required: true
    },
    format: String,
    size: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("Media", mediaSchema);
