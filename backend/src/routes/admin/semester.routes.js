const express = require('express');
const router = express.Router();
const semesterController = require('../../controllers/semester.controller');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);

router.get('/', semesterController.getAllSemesters);
router.get('/:id', semesterController.getSemesterById);

// Admin only routes
router.use(authorize('admin'));
router.post('/', semesterController.createSemester);
router.put('/:id', semesterController.updateSemester);
router.delete('/:id', semesterController.deleteSemester);

module.exports = router;
