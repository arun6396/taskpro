const express = require('express');
const verifyToken  = require('../MiddleWare/verifyToken');
const timeSlot = require('../Controller/timeSlotController');
const router = express.Router();
router.get("/get/slots",verifyToken,timeSlot.getAvailableSlots)
router.post("/create",timeSlot.createTimeSlot);


module.exports = router;
