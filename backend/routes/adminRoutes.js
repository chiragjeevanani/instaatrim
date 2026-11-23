const express = require('express');
const crypto = require('crypto');
const { getDashboardStats, saveFcmToken, getNotifications, sendBroadcast } = require('../controllers/adminController');
const { requireAdmin, signAdminToken } = require('../middlewares/accessControl');
const { authRateLimiter } = require('../middlewares/enterpriseMiddleware');

const router = express.Router();

// Admin panel login — checked on the server (was only checked in the browser).
// Credentials can be changed with ADMIN_EMAIL / ADMIN_PASSWORD in backend/.env.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@drimstyle.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2025';
const sameText = (a, b) => {
    const ha = crypto.createHash('sha256').update(String(a)).digest();
    const hb = crypto.createHash('sha256').update(String(b)).digest();
    return crypto.timingSafeEqual(ha, hb);
};

router.post('/login', authRateLimiter, (req, res) => {
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    const password = String((req.body && req.body.password) || '');
    const okEmail = sameText(email, ADMIN_EMAIL);
    const okPassword = sameText(password, ADMIN_PASSWORD);
    if (!(okEmail && okPassword)) {
        return res.status(401).json({ success: false, message: 'Invalid admin email or password.' });
    }
    return res.status(200).json({
        success: true,
        token: signAdminToken(ADMIN_EMAIL),
        data: { email: ADMIN_EMAIL, name: 'DrimStyle Super Admin', role: 'super_admin' }
    });
});

router.get('/stats', requireAdmin, getDashboardStats);
router.post('/save-fcm-token', requireAdmin, saveFcmToken);
router.get('/notifications', getNotifications);
router.post('/broadcast', requireAdmin, sendBroadcast);

module.exports = router;
