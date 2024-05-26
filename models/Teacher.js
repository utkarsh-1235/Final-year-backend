const {Schema, model} = require("mongoose");


// Teacher Details
const teacherSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Teacher", "HOD", "Coordinator"],
    default: "Teacher",
    required: true
  },
  college_id: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  phoneNumber: {
     type: String,
     required: true
  },
  students:[
     {
      type: Schema.Types.ObjectId,
      ref: 'Student'
    }
  ]
},  {
  timestamps: true
});

module.exports = model("Teacher", teacherSchema);
 