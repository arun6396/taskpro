const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    dateOfBirth: { type: String },
    email: { type: String },
    mobileNumber: { type: Number, unique: true },
    country: { type: String },
    city: { type: String },
    token: { type: String, select: false },
    webDeviceToken: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
    isNewUser: { type: Boolean, default: true },
  },
  { versionKey: false }
);

module.exports = mongoose.model("User", userSchema);
