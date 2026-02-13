const express = require('express');
const router = express.Router();
const settingsController = require('../../controllers/admin/settings.controller');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Settings Routes
router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.get('/:key', settingsController.getSetting);
router.put('/:key', settingsController.updateSetting);

module.exports = router;
