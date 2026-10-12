const express = require('express');
const { getDashboardStats, saveFcmToken, getNotifications, sendBroadcast } = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', getDashboardStats);
router.post('/save-fcm-token', saveFcmToken);
router.get('/notifications', getNotifications);
router.post('/broadcast', sendBroadcast);

module.exports = router;
