const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const { protectAdmin } = require('../middlewares/authMiddleware');

router.post('/register', salonController.registerSalon);
router.post('/login', salonController.loginSalon);
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token required' });
        }
        const Salon = require('../models/Salon');
        const salon = await Salon.findOne({ refreshToken });
        if (!salon) {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
        }
        // Rotate refresh token
        const crypto = require('crypto');
        const jwt = require('jsonwebtoken');
        const newRefreshToken = `rft_${crypto.randomBytes(32).toString('hex')}`;
        salon.refreshToken = newRefreshToken;
        await salon.save();

        const newToken = jwt.sign({ id: salon._id, role: 'salon' }, process.env.JWT_SECRET || 'secret123', {
            expiresIn: '1h'
        });

        return res.status(200).json({
            success: true,
            token: newToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Token rotation failed' });
    }
});
router.post('/save-fcm-token', salonController.saveFcmToken);
router.get('/', salonController.getAllSalons);
router.get('/:id', salonController.getSalonById);
router.delete('/:id', protectAdmin, salonController.deleteSalon);
router.patch('/:id/verify', salonController.verifySalon);
router.patch('/:id/reject', salonController.rejectSalon);
router.patch('/:id/commission', salonController.setSalonCommission);
router.put('/:id', salonController.updateSalon);
router.post('/:id/offers', salonController.addOffer);
router.put('/:id/offers/:offerId/status', salonController.updateOfferStatus);

const yieldAlertController = require('../controllers/yieldAlertController');
const salonAnalyticsController = require('../controllers/salonAnalyticsController');

router.get('/:salonId/yield-alert', yieldAlertController.getYieldAlert);
router.put('/:salonId/yield-alert', yieldAlertController.updateYieldAlert);
router.get('/:id/analytics', salonAnalyticsController.getSalonAnalytics);

module.exports = router;
