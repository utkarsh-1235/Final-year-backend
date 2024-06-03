const Student = require("./../models/Student");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Subject = require("../models/Subject");

// @desc Get all Student
// @route GET /Student
// @access Private
const getStudent = asyncHandler(async (req, res) => {
  if (!req?.params?.id) return res.status(400).json({ message: "ID Missing" });

  const student = await Student.findById(req.params.id)
    .select("-password -_id -__v")
    .exec();
  if (!student) {
    return res.status(400).json({ message: "Student Not Found." });
  }
  res.json(student);
});

// @desc Get all Student
// @route GET /Student
// @access Private
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.find().select("-password").lean();
  console.log(students);
  if (!students?.length) {
    return res.status(400).json({ message: "No Students Found" });
  }
  res.json(students);
});

// @desc Get Student by subject
// @route GET /Student
// @access Private
const getStudentBySubject = asyncHandler(async (req, res) => {
  const subjectId = req?.params?.subjectId;
  console.log(subjectId)
  if (!subjectId) {
      return res.status(400).json({ message: "Please provide Subject" });
  }

  try {
      // Find the subject by ID
      const subject = await Subject.findById(subjectId);

      if (!subject) {
          return res.status(404).json({ message: "Subject not found" });
      }

      // Retrieve students associated with the subject
      const students = await Student.find({ _id: { $in: subject.students } }).exec();
        console.log(students);
      if (!students || students.length === 0) {
          return res.status(404).json({ message: "No Students Found Related to subject" });
      }

      return res.status(200).json({ subject, students });
  } catch (error) {
      console.error("Error retrieving students by subject:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
});


// @desc Create New Student
// @route POST /Student
// @access Private
const createNewStudent = asyncHandler(async(req, res) => {
  const {name,
         email,
         universityRollno,
         collegeId,
         phoneNumber} = req.body;
          
         console.log(name,
          email,
          universityRollno,
          collegeId,
          phoneNumber)
         if(!name || !email || !universityRollno || !collegeId || !phoneNumber){
          return res.status(400).json({ message: "All fields are required" });      
         }

         const duplicate = await Student.findOne({universityRollno})
         if(duplicate){
          return res.status(400).json({ message: "Already registered" });      
         }

         const studentObj = {
          name,
         email,
         universityRollno,
         collegeId,
         phoneNumber
         }
        
        const result = await Student.create(studentObj);
        console.log(result);
        await result.save();
        return res.status(201).json({ message: `${name} created ${result}` });      

})

// @desc Update Student
// @route PATCH /Student
// @access Private
const updateStudent = asyncHandler(async (req, res) => {
  const { id, name, email, username, password } = req.body;

  // Confirm Data
  if (!id || !name || !email || !username) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find Student
  const student = await Student.findById(id).exec();

  if (!student) {
    return res.status(400).json({ message: "User not found" });
  }

  // Check for duplicate
  const duplicate = await Student.findOne({ username }).lean().exec();

  // Allow Updates to original
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate Username" });
  }

  student.name = name;
  student.email = email;
  student.username = username;

  if (password) {
    // Hash Pwd
    student.password = await bcrypt.hash(password, 10);
  }

  await student.save();

  res.json({ message: "User Updated" });
});

// @desc Delete Student
// @route DELETE /Student
// @access Private
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Student ID required" });
  }

  const student = await Student.findById(id).exec();

  if (!student) {
    return res.status(400).json({ message: "Student not found" });
  }

  const result = await student.deleteOne();

  res.json({ message: `${result.username} deleted` });
});

module.exports = {
  getStudent,
  getAllStudents,
  getStudentBySubject,
  createNewStudent,
  updateStudent,
  deleteStudent,
};
