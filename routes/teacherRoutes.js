const express = require("express");
const router = express.Router();
const teacherController = require("./../controllers/teacherController");

// router.route("/create").post(teacherController.createNewTeacher);
router.post("/create", teacherController.createNewTeacher);
router.route("/list/:department").get(teacherController.getTeacherList);
router.route("/approve/:department").get(teacherController.getNewTeachers);

router
  .route("/:id")
  .get(teacherController.getTeacher)
  .patch(teacherController.approveTeacher)
  .delete(teacherController.deleteTeacher);

module.exports = router;
