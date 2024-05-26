const { default: mongoose } = require("mongoose");
const Attendance = require("./../models/Attendance");
const asyncHandler = require("express-async-handler");

// @desc Get Attendance
// @route GET /attendance
// @access Everyone
const getAttendance = async (req, res) => {
  console.log(req.params.subject, req.params.date, req.params.hour)
  if (!req?.params?.subject || !req?.params?.date || !req?.params?.hour) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Params Missing" });
  }
  const attendance = await Attendance.findOne({
    subject: req.params.subject,
    date: req.params.date,
    hour: req.params.hour,
  })
    .populate({ path: "attandance.student", select: "name" })
    .exec();
    console.log(attendance);
  if (!attendance) {
    return res.status(404).json({
      message: `No Existing Record(s) found. Add New Record.`,
    });
  }
  res.json(attendance);
};

// @desc Get Attendance Student
// @route GET /attendance/student/date
// @access Everyone
const getAttendanceStudent = asyncHandler(async (req, res) => {
  if (!req?.params?.studentId || !req?.params?.date) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Params Missing" });
  }
  const attendance = await Attendance.aggregate([
    { $match: { date: req.params.date } },
    {
      $lookup: {
        from: "subject",
        localField: "subject",
        foreignField: "_id",
        as: "subject",
      },
    },
    {
      $unwind: "$subject",
    },
    {
      $project: {
        attendance: {
          $filter: {
            input: "$attendance",
            as: "att",
            cond: {
              $eq: [
                "$$att.student",
                new mongoose.Types.ObjectId(req.params.studentId),
              ],
            },
          },
        },
        "subject.subject": 1,
        hour: 1,
      },
    },
    {
      $unwind: "$attendance",
    },
    {
      $project: {
        "attendance.student": 0,
        "attendance._id": 0,
        _id: 0,
      },
    },
    {
      $sort: { hour: 1 },
    },
  ]);
  if (!attendance.length) {
    return res.status(404).json({
      message: "No Records found.",
    });
  }
  console.log(attendance)
  res.json(attendance);
});

// @desc Add Attendance
// @route POST /attendance
// @access Private
const addAttendance = asyncHandler(async (req, res) => {
  const subject = req.params.subject;
  const date = req.params.date;
  const hour = req.params.hour;

  const attandance = req.body.attandance;
  console.log(subject, date, hour, attandance);
  console.log(req.body)
  // Confirm Data
  if (!subject || !date || !hour || !attandance) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Body Missing" });
  }

  // Check for Duplicates
  const duplicate = await Attendance.findOne({
    subject: subject,
    date: date,
    hour: hour,
  })
    .lean()
    .exec();

  if (duplicate) {
    return res
      .status(409)
      .json({ message: "Attendance record already exists" });
  }

  const attendanceObj = {
    subject: subject,
    date,
    hour,
    attandance,
  };

  // Create and Store New teacher
  const record = await Attendance.create(attendanceObj);
  console.log(record);
  if (record) {
    res.status(201).json({
      message: `Attendance Record Added`,
    });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});

// @desc Update Attendance
// @route PATCH /attendance
// @access Private
const updateAttendance = asyncHandler(async (req, res) => {
  const { id, subject, date, hour, attendance } = req.body;
  console.log(id, subject, date, hour, attendance);
  // Confirm Data
  if (!id || !subject || !date || !hour || !attendance) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find Record
  const record = await Attendance.findById(id).exec();

  if (!record) {
    return res.status(404).json({ message: "Attendance record doesn't exist" });
  }

  //   // Check for duplicate
  //   const duplicate = await Teacher.findOne({
  //     paper: req.params.paper,
  //     date: req.params.date,
  //     hour: req.params.hour,
  //   })
  //     .lean()
  //     .exec();

  //   // Allow Updates to original
  //   if (duplicate && duplicate?._id.toString() !== id) {
  //     return res.status(409).json({ message: "Duplicate Username" });
  //   }

  record.subject = subject;
  record.date = date;
  record.hour = hour;
  record.attandance = attendance;

  const save = await record.save();
  if (save) {
    res.json({
      message: `Attendance Record Updated`,
    });
  } else {
    res.json({ message: "Save Failed" });
  }
});

// @desc Delete Teacher
// @route DELETE /Teacher
// @access Private
const deleteAttendance = asyncHandler(async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Attendance ID required" });
  }

  const record = await Attendance.findById(req.params.id).exec();

  if (!record) {
    return res.status(404).json({ message: "Attendance Record not found" });
  }

  await record.deleteOne();

  res.json({ message: "Attendance Record deleted" });
});

module.exports = {
  getAttendance,
  getAttendanceStudent,
  addAttendance,
  updateAttendance,
  deleteAttendance,
};
