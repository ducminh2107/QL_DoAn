const express = require('express');
const router = express.Router();
const systemTopicsController = require('../../controllers/admin/systemTopics.controller');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// System Topics Routes
router.get('/', systemTopicsController.getAllTopics);
router.post('/', systemTopicsController.createTopic);
router.put('/:id', systemTopicsController.updateTopic);
router.delete('/:id', systemTopicsController.deleteTopic);

module.exports = router;
