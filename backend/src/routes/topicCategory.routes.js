const express = require('express');
const router = express.Router();
const topicCategoryController = require('../controllers/topicCategory.controller');
const { protect } = require('../middleware/auth');

// GET /api/topic-categories - Public access (needed for topic creation forms)
router.get('/', topicCategoryController.getAllCategories);

module.exports = router;
