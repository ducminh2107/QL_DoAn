const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/report.controller');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', reportController.getSystemStats);
router.get('/data', reportController.getReports);
router.get('/dashboard', reportController.getDashboard);

module.exports = router;
