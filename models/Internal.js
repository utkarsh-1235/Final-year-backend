const mongoose = require("mongoose");

// Internal Result of Students
const internalSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    //required: true,
  },
  marks: {
    universityRollno: { type: String },
      CO1:{
        A1a: {
           type: String
        },
        A1b:{
           type: String
        },
        A1c: {
          type: String
       },
       B2a:{
        type: String
       },
       B2b:{
        type: String
       },
       B2c:{
        type: String
       },
       C3a:{
        type: String
       },
       C3b:{
        type: String
       },
       C5a:{
        type: String
       }
      },

      CO2:{
        A1d: {
           type: String
        },
        A1e:{
           type: String
        },
       B2d:{
        type: String
       },
       B2e:{
        type: String
       },
       C4a:{
        type: String
       },
       C4b:{
        type: String
       },
       C5b:{
        type: String
       }
      },

      CO3:{
        A1a: {
           type: String
        },
        A1b:{
           type: String
        },
        A1c: {
          type: String
       },
       B2a:{
        type: String
       },
       C3a:{
        type: String
       },
       C3b:{
        type: String
       },
      },
      CO4:{
        A1d: {
           type: String
        },
       B2b:{
        type: String
       },
       B2c:{
        type: String
       },
       C4a:{
        type: String
       },
       C4b:{
        type: String
       },
      },
      CO5:{
        A1e: {
           type: String
        },
       B2d:{
        type: String
       },
       B2e:{
        type: String
       },
       C5a:{
        type: String
       },
       C5b:{
        type: String
       },
      },
      attandance: {
        type: Number,
        // required: true,
      },
      total: {
        type: Number,
        // required: true,
      },
    },
},{
  timestamps: true
});

module.exports = mongoose.model("Internal", internalSchema);
