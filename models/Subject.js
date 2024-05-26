const mongoose = require("mongoose");

// Individual Paper in a Course
const subjectSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  
  universityCode: {
    type: String,
    required: true,
    unique: true
  },

  nbaCode: {
    type: String,
    required: true,
    unique: true
},
semester:{
    type: String
},
year: {
   type: String
},
department:{
  type: String
},
 teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'

 },
 students: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    default: [],
  },
],
},{
    timestamps: true
});

module.exports = mongoose.model("Subject", subjectSchema);
