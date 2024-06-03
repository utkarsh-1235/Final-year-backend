const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    universityRollno: {
        type: String,
        required: true,
        unique: true
    },
    collegeId:{
       type: String,
       required: true, 
       unique: true 
    },
    phoneNumber: {
        type: String,
        required: true
    },
    subjects: [{
       type: mongoose.Schema.Types.ObjectId,
       ref:  'Subject'
    }],
},{
    timestamps: true
})

module.exports = mongoose.model("Student", studentSchema);