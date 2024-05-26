const Teacher = require("./../models/Teacher");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateJWTToken= async function(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expiration time
  });
}

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: true
}


// @desc Get Teacher
// @route GET /teacher
// @access Private
const getTeacher = asyncHandler(async (req, res) => {
  if (!req?.params?.id) return res.status(400).json({ message: "ID Missing" });
  console.log(req.params.id)

  const teacher = await Teacher.findById(req.params.id)
    .select("-password -_id -__v")
    .lean();
  if (!teacher) {
    return res.status(404).json({ message: "No Teacher Found." });
  }
  res.json(teacher);
});

// @desc Get all Teachers
// @route GET /Teachers
// @access Private
const getNewTeachers = asyncHandler(async (req, res) => {
  console.log(req.params.department)
  const department = req.params.department;
  if (!department)
    return res.status(400).json({ message: "Params Missing" });

  const teachers = await Teacher.find({
    department
  })
    .select("-password")
    .lean();

    console.log(teachers.length);
  if (!teachers?.length) {
    return res.status(404).json({ message: "No Registered Teacher(s) Found." });
  }
  res.json(teachers);
});

// @desc Get Teacher Names only
// @route GET /TeachersList
// @access Private
const getTeacherList = asyncHandler(async (req, res) => {
  const department = req?.params?.department;
  console.log(department);
  if (!department)
    return res.status(400).json({ message: "Params Missing" });

  const teachersList = await Teacher.find({
    department,
  })
    .select("name")
    .lean();

    console.log(teachersList);
  if (!teachersList?.length) {
    return res.status(400).json({ message: "No Teacher(s) Found" });
  }
  res.json(teachersList);
});

// @desc Create New Teacher
// @route POST /Teacher
// @access Private
const createNewTeacher = asyncHandler(async (req, res) => {
  const { name, email, role, qualification, department, college_id, password, phoneNumber, address } =
    req.body;

  // Confirm Data
  if (
    !name ||
    !email ||
    !role ||
    !qualification ||
    !department ||
    !college_id ||
    !password ||
    !phoneNumber ||
    !address
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for Duplicates
  const duplicate = await Teacher.findOne({ college_id }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate College id" });
  }

  // Hash Password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds

  const teacherObj = {
    name,
    email,
    qualification,
    department,
    password: hashedPwd,
    role,
    college_id,
    address,
    phoneNumber
  };

  // Create and Store New teacher
  const teacher = await Teacher.create(teacherObj);

  if (teacher) {
    const token = await generateJWTToken(teacher);
    //console.log(token);
    res.cookie('token', token, cookieOptions)
    res.status(201).json({
      success: true,
      message: 'teacher registered successfully',
      teacher
    });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
  await teacher.save();
  console.log(teacher);
});

// @desc Update Teacher
// @route PATCH /Teacher
// @access Private
const approveTeacher = asyncHandler(async (req, res) => {
  const { id, role } = req.body;

  // Confirm Data
  if ((!id, !role)) {
    return res.status(400).json({ message: "All fields are required" });
  }
  // Find Teacher
  const teacher = await Teacher.findById(id).exec();
  if (!teacher) {
    return res.status(400).json({ message: "User not found" });
  }

  teacher.role = role;

  // if (password) {
  //   // Hash Pwd
  //   teacher.password = await bcrypt.hash(password, 10);
  // }
  await teacher.save();

  res.json({ message: "Teacher Approved" });
});

// @desc Delete Teacher
// @route DELETE /Teacher
// @access Private
const deleteTeacher = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "Teacher ID required" });
  }

  const teacher = await Teacher.findById(id).exec();

  if (!teacher) {
    return res.status(400).json({ message: "Teacher not found" });
  }

  const result = await teacher.deleteOne();

  res.json({ message: `${result.username} deleted` });
});

module.exports = {
  getTeacher,
  getNewTeachers,
  getTeacherList,
  createNewTeacher,
  approveTeacher,
  deleteTeacher,
};
