const express = require('express');
const router = express.Router();
const topicCategoryController = require('../controllers/topicCategory.controller');
const { protect } = require('../middleware/auth');

// All topic category APIs require authentication
router.use(protect);

// GET /api/topic-categories
router.get('/', topicCategoryController.getAllCategories);

module.exports = router;

