const express = require('express');
const router = express.Router();
const exportController = require('../../controllers/admin/export.controller');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Export Routes
router.post('/data', exportController.exportData);

module.exports = router;
