const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
  },
  { _id: false } 
);

const timeSlotSchema = new mongoose.Schema(
  {
    slots: [slotSchema],
  },
  { versionKey: false }
);

module.exports = mongoose.model("TimeSlot", timeSlotSchema);
