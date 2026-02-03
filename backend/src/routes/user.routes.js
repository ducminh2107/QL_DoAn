const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize, canAccessOwnData } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

// User can access their own profile
router.get('/me', userController.getMe);
router.put('/me', userController.updateProfile);

// Admin routes for user management
router.use(authorize('admin'));

router.get('/', userController.getAllUsers);
router.get('/:id', validateObjectId('id'), userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', validateObjectId('id'), userController.updateUser);
router.delete('/:id', validateObjectId('id'), userController.deleteUser);
router.put(
  '/:id/status',
  validateObjectId('id'),
  userController.updateUserStatus
);
router.post('/import', userController.importUsers);

module.exports = router;
