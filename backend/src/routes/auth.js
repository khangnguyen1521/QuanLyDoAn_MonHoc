const express = require('express');
const {
  register,
  login,
  refreshToken,
  getMe,
  logout,
  logoutAll,
  getActiveSessions,
  revokeSession,
  updateProfile
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Đăng ký user mới
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Đăng nhập user
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', refreshToken);

// @route   GET /api/auth/me
// @desc    Lấy thông tin user hiện tại
// @access  Private
router.get('/me', authenticate, getMe);

// @route   POST /api/auth/logout
// @desc    Đăng xuất user
// @access  Private
router.post('/logout', authenticate, logout);



// @route   POST /api/auth/logout-all
// @desc    Đăng xuất tất cả thiết bị
// @access  Private
router.post('/logout-all', authenticate, logoutAll);

// @route   GET /api/auth/sessions
// @desc    Lấy danh sách sessions của user
// @access  Private
router.get('/sessions', authenticate, getActiveSessions);

// @route   DELETE /api/auth/sessions/:sessionId
// @desc    Revoke session cụ thể
// @access  Private
router.delete('/sessions/:sessionId', authenticate, revokeSession);





// @route   PUT /api/auth/profile
// @desc    Cập nhật thông tin user
// @access  Private
router.put('/profile', authenticate, updateProfile);

module.exports = router;
