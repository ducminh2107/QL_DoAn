const express = require('express');
const router = express.Router();
const rubricController = require('../../controllers/rubric.controller');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);

router.get('/', rubricController.getAllRubrics);
router.get('/:id', rubricController.getRubricById);

// Admin only routes
router.use(authorize('admin'));
router.post('/', rubricController.createRubric);
router.put('/:id', rubricController.updateRubric);
router.delete('/:id', rubricController.deleteRubric);

module.exports = router;
