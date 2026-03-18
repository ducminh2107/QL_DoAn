const express = require('express');
const router = express.Router();
const topicController = require('../../controllers/admin/topic.controller');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Pending Topics Routes
router.get('/pending', topicController.getPendingTopics);
router.get('/approved', topicController.getAllApprovedTopics);

// Approve/Reject Routes
router.put('/:id/approve', topicController.approveTopic);
router.put('/:id/reject', topicController.rejectTopic);

module.exports = router;
