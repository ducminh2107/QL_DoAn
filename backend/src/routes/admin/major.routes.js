const express = require('express');
const router = express.Router();
const majorController = require('../../controllers/major.controller');
const { protect, authorize } = require('../../middleware/auth');

// Public routes - needed for topic creation forms
router.get('/', majorController.getAllMajors);
router.get('/:id', majorController.getMajorById);

// Admin only routes - require authentication and admin role
router.post('/', protect, authorize('admin'), majorController.createMajor);
router.put('/:id', protect, authorize('admin'), majorController.updateMajor);
router.delete('/:id', protect, authorize('admin'), majorController.deleteMajor);

module.exports = router;
