const express = require('express');
const router = express.Router();
const topicController = require('../../controllers/student/topic.controller');
const notificationController = require('../../controllers/teacher/notification.controller');
const { protect, authorize } = require('../../middleware/auth');
const { validate } = require('../../middleware/validation');
const topicValidation = require('../../validations/topic.validation');

// All routes require student authentication
router.use(protect);
router.use(authorize('student'));

// ── Notification routes (reuse teacher notification controller logic) ──
router.get('/notifications/unread-count', notificationController.getUnreadCount);
router.get('/notifications', notificationController.getNotifications);
router.patch('/notifications/mark-all-read', notificationController.markAllAsRead);
router.patch('/notifications/:id/read', notificationController.markAsRead);
router.delete('/notifications/:id', notificationController.deleteNotification);

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

// File upload configuration using multer
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reports/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|ppt|pptx|zip|rar/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype || extname) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận các định dạng Word, PPT, PDF, ZIP, RAR'));
  },
});

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
  upload.single('report'),
  topicController.submitMilestone
);
// Final report upload
router.post(
  '/topics/:id/upload-report',
  upload.single('report'),
  topicController.uploadFinalReport
);

module.exports = router;
