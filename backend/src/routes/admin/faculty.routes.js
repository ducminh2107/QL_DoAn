const express = require('express');
const router = express.Router();
const facultyController = require('../../controllers/faculty.controller');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);

router.get('/', facultyController.getAllFaculties);
router.get('/:id', facultyController.getFacultyById);

// Admin only routes
router.use(authorize('admin'));
router.post('/', facultyController.createFaculty);
router.put('/:id', facultyController.updateFaculty);
router.delete('/:id', facultyController.deleteFaculty);

module.exports = router;
