const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, logout, saveFcmToken } = require('../controllers/authController');

const { authRateLimiter } = require('../middlewares/enterpriseMiddleware');
const { validateAndSanitize, schemas } = require('../middlewares/validationMiddleware');

// POST /api/auth/send-otp   → send OTP to phone (with rate limiting & Zod input validation)
router.post('/send-otp', authRateLimiter, validateAndSanitize(schemas.phoneOtpSchema), sendOTP);

// POST /api/auth/verify-otp → verify OTP and login/signup (with rate limiting & Zod input validation)
router.post('/verify-otp', authRateLimiter, validateAndSanitize(schemas.verifyOtpSchema), verifyOTP);

// POST /api/auth/logout → logout user
router.post('/logout', logout);

const { protectCustomer } = require('../middlewares/authMiddleware');

// POST /api/auth/save-fcm-token → save FCM token
router.post('/save-fcm-token', protectCustomer, saveFcmToken);

module.exports = router;
