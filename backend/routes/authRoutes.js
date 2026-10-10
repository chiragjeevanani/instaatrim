const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, logout, saveFcmToken } = require('../controllers/authController');

// POST /api/auth/send-otp   → send OTP to phone
router.post('/send-otp', sendOTP);

// POST /api/auth/verify-otp → verify OTP and login/signup
router.post('/verify-otp', verifyOTP);

// POST /api/auth/logout → logout user
router.post('/logout', logout);

const { protectCustomer } = require('../middlewares/authMiddleware');

// POST /api/auth/save-fcm-token → save FCM token
router.post('/save-fcm-token', protectCustomer, saveFcmToken);

module.exports = router;
