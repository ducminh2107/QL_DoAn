const express = require('express');
const router = express.Router();
const topicController = require('../../controllers/student/topic.controller');
const { protect, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validation');
const topicValidation = require('../../validations/topic.validation');

// All routes require student authentication
router.use(protect);
router.use(authorize('student'));

// Topic browsing and registration
router.get(
  '/topics',
  validate(topicValidation.filter),
  topicController.getAvailableTopics
);

// Topic proposal
router.post(
  '/topics/propose',
  validate(topicValidation.createUpdate),
  topicController.proposeTopic
);

// Routes with :id should be AFTER specific paths like /propose
router.get('/topics/:id', topicController.getTopicById);

router.post('/topics/:id/register', topicController.registerForTopic);

router.delete('/topics/:id/register', topicController.cancelRegistration);

router.put(
  '/topics/:id',
  validate(topicValidation.createUpdate),
  topicController.updateProposedTopic
);

router.delete('/topics/:id', topicController.deleteProposedTopic);

// My topic and progress
router.get('/my-topics', topicController.getMyTopics);

router.get('/grades', topicController.getGrades);

router.get('/registration-history', topicController.getRegistrationHistory);

router.get('/my-topic', topicController.getMyTopic);
router.get('/statistics', topicController.getStatistics);

router.get('/topics-progress', topicController.getTopicsProgress);
router.get('/topics/:id/progress', topicController.getTopicProgress);
router.put(
  '/topics/:id/milestones/:milestoneIndex',
  topicController.submitMilestone
);

// Add more student routes here as needed

module.exports = router;
