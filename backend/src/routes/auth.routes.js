const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const authValidation = require('../validations/auth.validation');

// Public routes - CHỈ CÒN LOGIN VÀ QUÊN MẬT KHẨU
router.post('/login', validate(authValidation.login), authController.login);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.put('/reset-password/:token', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Protected routes (cần đăng nhập)
router.use(protect);

router.get('/me', authController.getMe);
router.put('/update-profile', validate(authValidation.updateProfile), authController.updateProfile);
router.put('/change-password', validate(authValidation.changePassword), authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;