const express = require("express");
const router = express.Router();
const paperController = require("../controllers/subjectController");

router.route("/").post(paperController.addPaper);
router.route("/manage/:studentId").get(paperController.getAllPapers);

router.route("/students/:paperId").get(paperController.getStudentsList);
router.route("/teacher/:teacherId").get(paperController.getPapers);
router.route("/teacher").post(paperController.assignSubject);
router.route("/student/:studentId").get(paperController.getPapersStudent);

router
  .route("/:paperId")
  .patch(paperController.updateStudents)
  .delete(paperController.deletePaper);

module.exports = router;
