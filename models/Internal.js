const mongoose = require("mongoose");

// Internal Result of Students
const internalSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  marks: {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        //required: true,
      },
      co1: {
         type: String
      },
      co2: {
        type: String
     },
     co3: {
      type: String
     },
   co4: {
    type: String
     },
     co5: {
      type: String
     },
     co6: {
      type: String
     },
      attandance: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        required: true,
      },
    },
},{
  timestamps: true
});

module.exports = mongoose.model("Internal", internalSchema);
