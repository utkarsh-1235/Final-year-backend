const express = require("express");
const router = express.Router();
const studentController = require("./../controllers/studentController");

router
  .route("/:id")
  .get(studentController.getStudent)
  .patch(studentController.updateStudent)
  .delete(studentController.deleteStudent);

router
.route("/subject/:subjectId")  
.get(studentController.getStudentBySubject);

router
  .route("/")
  .get(studentController.getAllStudents)
  .post(studentController.createNewStudent);

module.exports = router;
