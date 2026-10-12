const express = require('express');
const { getDashboardStats, saveFcmToken } = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', getDashboardStats);
router.post('/save-fcm-token', saveFcmToken);

module.exports = router;
