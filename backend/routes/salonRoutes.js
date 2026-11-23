const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const { requireAdmin, requireSalonParamOrAdmin } = require('../middlewares/accessControl');

router.post('/register', salonController.registerSalon);
router.post('/login', salonController.loginSalon);
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token required' });
        }
        const Salon = require('../models/Salon');
        if (typeof refreshToken !== 'string') {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
        }
        const crypto = require('crypto');
        const jwt = require('jsonwebtoken');
        // Rotate refresh token atomically (only one request can rotate it). The old one stays
        // valid for 2 min so two tabs/requests refreshing at the same moment don't log the partner out.
        let newRefreshToken = `rft_${crypto.randomBytes(32).toString('hex')}`;
        let salon = await Salon.findOneAndUpdate(
            { refreshToken },
            { $set: { refreshToken: newRefreshToken, prevRefreshToken: refreshToken, refreshRotatedAt: new Date() } },
            { new: true }
        );
        if (!salon) {
            salon = await Salon.findOne({ prevRefreshToken: refreshToken, refreshRotatedAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) } });
            if (!salon || !salon.refreshToken) {
                return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
            }
            newRefreshToken = salon.refreshToken; // already rotated moments ago → hand out the current one
        }

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
router.patch('/:id/verify', requireAdmin, salonController.verifySalon);
router.patch('/:id/reject', requireAdmin, salonController.rejectSalon);
router.patch('/:id/commission', requireAdmin, salonController.setSalonCommission);
router.put('/:id', requireSalonParamOrAdmin('id'), salonController.updateSalon);
router.post('/offers/create-admin-offer', requireAdmin, salonController.createAdminOffer);
router.put('/offers/:offerId/update-admin-offer', requireAdmin, salonController.updateAdminOffer);
router.delete('/offers/:offerId/delete-admin-offer', requireAdmin, salonController.deleteAdminOffer);
router.post('/:id/offers', requireSalonParamOrAdmin('id'), salonController.addOffer);
router.put('/:id/offers/:offerId/status', requireAdmin, salonController.updateOfferStatus);

const yieldAlertController = require('../controllers/yieldAlertController');
const salonAnalyticsController = require('../controllers/salonAnalyticsController');

router.get('/:salonId/yield-alert', yieldAlertController.getYieldAlert);
router.put('/:salonId/yield-alert', requireSalonParamOrAdmin('salonId'), yieldAlertController.updateYieldAlert);
router.get('/:id/analytics', requireSalonParamOrAdmin('id'), salonAnalyticsController.getSalonAnalytics);

module.exports = router;
