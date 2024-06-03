const { mongoose } = require("mongoose");
const Paper = require("../models/Paper");
const asyncHandler = require("express-async-handler");
const Subject = require("../models/Subject");
const Student = require("../models/Student");


const assignSubject = asyncHandler(async (req, res) => {
  const { studentIds, subjectId } = req.body;

  // Find the subject
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  // Check if any student is already assigned to the subject
  const students = await Student.find({ _id: { $in: studentIds } });
  const alreadyAssignedStudents = students.filter(student => student.subjects.includes(subjectId));

  if (alreadyAssignedStudents.length > 0) {
    const alreadyAssignedStudentIds = alreadyAssignedStudents.map(student => student._id);
    return res.status(400).json({ error: `Students with ids ${alreadyAssignedStudentIds.join(', ')} are already assigned to the subject` });
  }

  // Update each student
  await Promise.all(students.map(async (student) => {
    if (!student.subjects.includes(subjectId)) {
      student.subjects.push(subjectId);
      await student.save();
    }
  }));

  // Add students to subject's students list if not already present
  studentIds.forEach(studentId => {
    if (!subject.students.includes(studentId)) {
      subject.students.push(studentId);
    }
  });

  // Save the modified subject
  await subject.save();

  return res.status(200).json({ message: 'Subjects assigned successfully' });
});

// @desc Get Papers for each Teacher
// @route GET /Paper/teacher/teacherId
// @access Everyone
const getPapers = asyncHandler(async (req, res) => {
  if (!req?.params?.teacherId) {
    return res.status(400).json({ message: "Teacher ID Missing" });
  }
  const papers = await Subject.find({
    teacher: req.params.teacherId,
  })
    .select("-students")
    .exec();

    console.log(papers)
  if (!papers) {
    return res.status(404).json({
      message: `No Paper(s) found`,
    });
  }
  res.json(papers);
});

// @desc Get Papers for each Student
// @route GET /paper/student/:studentId
// @access Everyone
const getPapersStudent = asyncHandler(async (req, res) => {
  if (!req?.params?.studentId) {
    return res.status(400).json({ message: "Student ID Missing" });
  }
  const papers = await Subject.aggregate([
    {
      $lookup: {
        from: "teachers",
        localField: "teacher",
        foreignField: "_id",
        as: "teacher",
      },
    },
    {
      $unwind: "$teacher",
    },
    {
      $project: {
        students: {
          $in: [new mongoose.Types.ObjectId(req.params.studentId), "$students"],
        },
        semester: 1,
        year: 1,
        paper: 1,
        "teacher.name": 1,
      },
    },
    {
      $match: { students: true },
    },
  ]);
  if (!papers) {
    return res.status(404).json({
      message: `No Paper(s) found`,
    });
  }
  res.json(papers);
});

// @desc Get All Papers
// @route GET /paper/
// @access Everyone
const getAllPapers = asyncHandler(async (req, res) => {
  if (!req?.params?.studentId) {
    return res.status(400).json({ message: "Student ID Missing" });
  }

  const papers = await Subject.aggregate([
    {
      $lookup: {
        from: "teachers",
        localField: "teacher",
        foreignField: "_id",
        as: "teacher",
      },
    },
    {
      $unwind: "$teacher",
    },
    {
      $project: {
        subject:1,
        semester: 1,
        year: 1,
        paper: 1,
        "teacher.name": 1,
        students: 1,
        department: 1,
        joined: {
          $in: [new mongoose.Types.ObjectId(req.params.studentId), "$students"],
        },
      },
    },
  ]);
  console.log(papers);
  if (!papers) {
    return res.status(404).json({
      message: `No Paper(s) found`,
    });
  }
  res.json(papers);
});

// @desc Get Students for each paper
// @route GET /paper/students/:paperId
// @access Private
const getStudentsList = asyncHandler(async (req, res) => {
  console.log(req.params.paperId)
  if (!req?.params?.paperId) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Params Missing" });
  }

  const students = await Subject.findById(req.params.paperId)
    .select("students")
    .populate({ path: "students",select: "name universityRollno" })
    .exec();

    console.log(students);
  if (!students?.students) {
    return res.status(400).json({ message: "No Students Found" });
  }
  res.json(students.students);
});

// @desc Get Paper
// @route GET /Paper
// @access Everyone
const getSubject = asyncHandler(async (req, res) => {
  if (!req?.params?.subjectId) {
    return res
      .status(400)
      .json({ message: "Incomplete Request: Params Missing" });
  }
  const subject = await Subject.findOne({
    _id: req.params.SubjectId,
  })
    .populate({ path: "teacher", select: "name" })
    .populate({ path: "students", select: "name" })
    .exec();
  if (!subject) {
    return res.status(404).json({
      message: `No Paper(s) found`,
    });
  }
  res.json(subject);
});

// @desc Add Paper
// @route POST /Paper
// @access Private
const addPaper = asyncHandler(async (req, res) => {
  const { department, subject, universityCode, nbaCode, year, students, semester, teacher } = req.body;

  // Confirm Data
  // if (!department || !paper || !semester || !year || !students || !teacher) {
    if (!department || !subject || !universityCode ||!nbaCode || !semester || !year || !teacher){
    return res
      .status(400)
      .json({ message: "Incomplete Request: Fields Missing" });
  }

  // Check for Duplicates
  const duplicate = await Subject.findOne({
    universityCode
  })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({ message: "Paper already exists" });
  }

  const subjectObj = {
    subject,
    universityCode,
    nbaCode,
    semester,
    year,
    department,
    teacher,
    students
  };

  // Create and Store New teacher
  const record = await Subject.create(subjectObj);
 
  if (record) {
    res.status(201).json({
      message: `New Subject ${req.body.subject} added `,
    });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
});

// @desc Update Paper
// @route PATCH /Paper
// @access Private
const updateStudents = asyncHandler(async (req, res) => {
  const { id, students } = req.body;

  // Confirm Data
  if (!id || !students) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find Record
  const record = await Paper.findById(id).exec();

  if (!record) {
    return res.status(404).json({ message: "Paper doesn't exist" });
  }

  record.students = students;

  const save = await record.save();
  if (save) {
    res.json({ message: "Updated" });
  } else {
    res.json({ message: "Save Failed" });
  }
});

// @desc Delete Paper
// @route DELETE /Paper
// @access Private
const deletePaper = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Paper ID required" });
  }

  const record = await Paper.findById(id).exec();

  if (!record) {
    return res.status(404).json({ message: "Paper not found" });
  }

  await record.deleteOne();

  res.json({ message: `${paper} deleted` });
});

module.exports = {
  assignSubject,
  addPaper,
  getAllPapers,
  getPapers,
  getPapersStudent,
  getStudentsList,
  getSubject,
  updateStudents,
  deletePaper,
};
