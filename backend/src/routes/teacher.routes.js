const express = require('express');
const router = express.Router();

// Controllers
const topicController = require('../controllers/teacher/topic.controller');
const studentController = require('../controllers/teacher/student.controller');
const gradingController = require('../controllers/teacher/grading.controller');

// Middleware
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Validation schemas
const teacherValidation = require('../validations/teacher.validation');

// All routes require teacher authentication
router.use(protect);
router.use(authorize('teacher'));

// Topic Management Routes
router.get('/topics', topicController.getTeacherTopics);
router.post('/topics', validate(teacherValidation.createTopic), topicController.createTopic);
router.put('/topics/:id', validate(teacherValidation.updateTopic), topicController.updateTopic);
router.delete('/topics/:id', topicController.deleteTopic);

// Topic Approval Routes
router.get('/topics/pending-approval', topicController.getPendingApprovalTopics);
router.put('/topics/:id/approve', validate(teacherValidation.approveTopic), topicController.approveTopic);

// Student Management Routes
router.get('/students/registrations', studentController.getStudentRegistrations);
router.put('/students/:studentId/registrations/:topicId', studentController.handleRegistration);
router.delete('/students/:studentId/topics/:topicId', studentController.removeStudentFromTopic);
router.get('/students/guided', studentController.getGuidedStudents);

// Grading Routes
router.get('/grading/topics', gradingController.getTopicsForGrading);
router.get('/grading/rubric/:topicId', gradingController.getGradingRubric);
router.post('/grading/submit/:topicId', validate(teacherValidation.submitGrades), gradingController.submitGrades);
router.get('/grading/history', gradingController.getGradingHistory);

module.exports = router;