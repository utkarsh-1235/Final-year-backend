const mongoose = require("mongoose");

// Attendance of Students
const attendanceSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    hour: {
      type: Number,
      required: true,
    },
    attandance: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Student",
        },
        present: {
          type: Boolean,
          default: "true",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
