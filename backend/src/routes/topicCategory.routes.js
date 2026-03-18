const express = require('express');
const router = express.Router();
const topicCategoryController = require('../controllers/topicCategory.controller');
const { protect } = require('../middleware/auth');

// GET /api/topic-categories - Public access (needed for topic creation forms)
router.get('/', topicCategoryController.getAllCategories);

// Protected routes
router.use(protect);
router.post('/', topicCategoryController.createCategory);
router.put('/:id', topicCategoryController.updateCategory);
router.delete('/:id', topicCategoryController.deleteCategory);

module.exports = router;
