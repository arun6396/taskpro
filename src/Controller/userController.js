const User = require("../model/user");
const UserOtp = require("../model/userOtp");
const jwt = require("jsonwebtoken");
const responseFormatter = require("../Utils/responseFormatter");
const getISTDateObject = require("../Utils/timeFormatter");
const mongoose = require("mongoose");
require("dotenv").config();

exports.sendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (!mobileNumber) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "Mobile number is required"));
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "Mobile number must be 10 digits"));
    }

    await UserOtp.updateMany(
      { mobileNumber, is_Active: true },
      { $set: { is_Active: false } }
    );

    const otp = process.env.USE_STATIC_OTP || "123456";
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

    const otpEntry = new UserOtp({
      mobileNumber,
      otp,
      expiryTime,
      is_Active: true,
      createdAt: getISTDateObject(),
    });

    await otpEntry.save();

    return res
      .status(200)
      .json(responseFormatter({ otp }, 200, "OTP sent successfully"));
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res
      .status(500)
      .json(responseFormatter({}, 500, "Server error", err.message));
  }
};
exports.verifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    /////  check MobileNumber required   /////
    if (!mobileNumber) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "Mobile number is required"));
    }

    /////  check otp required   /////
    if (!otp) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "OTP is required"));
    }

    const otpData = await UserOtp.findOne({
      mobileNumber,
      is_Active: true,
    }).sort({ createdAt: -1 });

    if (!otpData) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "No active OTP found"));
    }

    if (otpData.otp !== otp) {
      return res.status(400).json(responseFormatter({}, 400, "Invalid OTP"));
    }

    if (otpData.expiryTime < new Date()) {
      await UserOtp.updateOne(
        { _id: otpData._id },
        { $set: { is_Active: false } }
      );
      return res
        .status(400)
        .json(responseFormatter({}, 400, "OTP has expired"));
    }

    await UserOtp.updateOne(
      { _id: otpData._id },
      { $set: { is_Active: false } }
    );

    let user = await User.findOne({ mobileNumber });

    if (user) {
      const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      user.token = token;
      await user.save();

      const { token: _, ...userWithoutToken } = user.toObject();

      return res
        .status(200)
        .json(
          responseFormatter(
            { user: userWithoutToken },
            200,
            "OTP verified successfully",
            token
          )
        );
    }

    const newUser = new User({
      mobileNumber,
      firstName: null,
      lastName: null,
      email: null,
      dateOfBirth: null,
      country: null,
      city: null,
      isNewUser: true,
      createdAt: getISTDateObject(),
    });

    await newUser.save();

    const token = jwt.sign({ _id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    newUser.token = token;
    await newUser.save();

    const { token: __, ...newUserWithoutToken } = newUser.toObject();

    return res
      .status(200)
      .json(
        responseFormatter(
          { user: newUserWithoutToken },
          200,
          "New user - redirect to create profile",
          token
        )
      );
  } catch (err) {
    console.error("Error verifying OTP:", err.message);
    return res
      .status(500)
      .json(responseFormatter({}, 500, "Server error", err.message));
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "Invalid user ID"));
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "dateOfBirth",
      "country",
      "city",
    ];

    const updateUser = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateUser[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { ...updateUser, isNewUser: false } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json(responseFormatter({}, 404, "User not found"));
    }

    return res
      .status(200)
      .json(
        responseFormatter({ updatedUser }, 200, "User updated successfully")
      );
  } catch (err) {
    console.error("Error updating user:", err.message);

    if (err.code === 11000) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "Duplicate value error", err.message));
    }

    return res
      .status(500)
      .json(responseFormatter({}, 500, "Server error", err.message));
  }
};

exports.getByUser = async (req, res) => {
  try {
    const userId = req.user_id?._id;

    if (!userId) {
      return res
        .status(401)
        .json(responseFormatter({}, 401, "Unauthorized: user ID missing"));
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json(responseFormatter({}, 404, "User not found"));
    }

    return res
      .status(200)
      .json(responseFormatter({ user }, 200, "User fetched successfully"));
  } catch (err) {
    console.error("Error in getByUser:", err.message);
    return res
      .status(500)
      .json(responseFormatter({}, 500, "Server error", err.message));
  }
};
