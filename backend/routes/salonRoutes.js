const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');
const { protectAdmin } = require('../middlewares/authMiddleware');

router.post('/register', salonController.registerSalon);
router.post('/login', salonController.loginSalon);
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
