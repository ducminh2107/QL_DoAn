const express = require('express');
const router = express.Router();
const periodController = require('../../controllers/registrationPeriod.controller');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);

router.get('/', periodController.getAllPeriods);
router.get('/:id', periodController.getPeriodById);

// Admin only routes
router.use(authorize('admin'));
router.post('/', periodController.createPeriod);
router.put('/:id', periodController.updatePeriod);
router.delete('/:id', periodController.deletePeriod);

module.exports = router;
