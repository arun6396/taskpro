const express = require("express");
const router = express.Router();
const userController = require("../Controller/userController");
const verifyToken = require("../MiddleWare/verifyToken");

router.post("/otp/send", userController.sendOtp);
router.post("/otp/verify", userController.verifyOtp);
router.put("/update/:id", userController.updateUserById);

router.get("/getByUser",verifyToken ,userController.getByUser);

// router.patch("/update-device-token", userController.updateDeviceToken);

module.exports = router;
