const TimeSlot = require("../model/timeSlot");
const responseFormatter = require("../Utils/responseFormatter");
const getISTDateObject = require("../Utils/timeFormatter");

exports.createTimeSlot = async (req, res) => {
  try {
    const { slots } = req.body;

    /////  check slots for empty or not  and Array format check  ///// 
    if (!slots || !Array.isArray(slots) || slots.length === 0) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "Slots array is required"));
    }
 
    ///// check startTime and endTime  inside slots //////
    for (const slot of slots) {
      if (!slot.startTime || !slot.endTime) {
        return res.status(400).json(
          responseFormatter({}, 400, "Each slot must have startTime and endTime")
        );
      }
 
      ////// start time greater than or equal to end time  ////// 
      if (slot.startTime >= slot.endTime) {
        return res.status(400).json(
          responseFormatter({}, 400, "startTime must be less than endTime")
        );
      }
    }

    /////  Timeslot inside exist slot
    let timeSlotDoc = await TimeSlot.findOne();

    if (timeSlotDoc) {
     
      for (const newSlot of slots) {
        const duplicate = timeSlotDoc.slots.find(
          s => s.startTime === newSlot.startTime && s.endTime === newSlot.endTime
        );
        if (duplicate) {
          return res.status(409).json(
            responseFormatter({}, 409, `Slot ${newSlot.startTime} - ${newSlot.endTime} already exists`)
          );
        }
      }

     
      timeSlotDoc.slots.push(...slots);
    } else {
      
      timeSlotDoc = new TimeSlot({ slots });
    }

    await timeSlotDoc.save();

    return res.status(201).json(
      responseFormatter({ timeSlot: timeSlotDoc }, 201, "Time slots created successfully under one ID")
    );
  } catch (err) {
    console.error("Error creating time slots:", err.message);
    return res
      .status(500)
      .json(responseFormatter({}, 500, "Server error", err.message));
  }
};
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query; 

    if (!date) {
      return res
        .status(400)
        .json(responseFormatter({}, 400, "Date is required"));
    }
 
   const requestedDate = new Date(date); // This includes time, possibly in UTC

// Convert all dates to local date (midnight, IST) for safe comparison
const toLocalDateOnly = (d) => {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const todayIST = getISTDateObject(); // This gives current IST datetime

const today = toLocalDateOnly(todayIST);

const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

const requestedDateOnly = toLocalDateOnly(requestedDate);

if (requestedDateOnly < today || requestedDateOnly > dayAfterTomorrow) {
  return res.status(400).json(
    responseFormatter(
      {},
      400,
      "Invalid date. Only today and the next 2 days are allowed."
    )
  );
}
 
    const timeSlotDoc = await TimeSlot.findOne();

    if (!timeSlotDoc) {
      return res
        .status(404)
        .json(responseFormatter({}, 404, "No time slots available"));
    }

    let availableSlots = timeSlotDoc.slots.filter(slot => !slot.isBooked);

    
    const isToday = requestedDate.toDateString() === getISTDateObject().toDateString();
    if (isToday) {
      const currentTime = getISTDateObject().toTimeString().slice(0, 5); 
      availableSlots = availableSlots.filter(slot => slot.startTime > currentTime);
      console.log("Current IST time:", currentTime);
console.log("All available slots before filtering:", availableSlots);
    }

    return res.status(200).json(
      responseFormatter(
        {
          requestedDate: date,
          availableSlots,
          totalSlots: timeSlotDoc.slots.length,
          availableCount: availableSlots.length,
        },
        200,
        "Available slots fetched successfully"
      )
    );
  } catch (err) {
    console.error("Error fetching slots:", err.message);
    return res
      .status(500)
      .json(responseFormatter({}, 500, "Server error", err.message));
  }
};
