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
    token: { type: String,select:false },
    webDeviceToken: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt:{type:Date,default:Date.now},
    isNewUser: {type : Boolean, default : true },
  },
   { versionKey: false, timestamps:true }
);

module.exports = mongoose.model("User", userSchema);
