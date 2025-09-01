const mongoose = require("mongoose");

const userOtpSchema = new mongoose.Schema(
  {
    mobileNumber: { type: Number, required: true },
    otp: { type: Number, required: true },
    expiryTime: { type: Date, required: true },
    is_Active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("UserOtp", userOtpSchema); // NOTE: Capital U
