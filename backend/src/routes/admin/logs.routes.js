const express = require('express');
const router = express.Router();
const logsController = require('../../controllers/admin/systemLogs.controller');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Logs Routes
router.get('/', logsController.getAllLogs);
router.get('/stats', logsController.getLogStats);
router.get('/export', logsController.exportLogs);
router.post('/clear-old', logsController.clearOldLogs);

module.exports = router;
