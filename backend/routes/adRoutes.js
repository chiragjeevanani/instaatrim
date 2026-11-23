const express = require('express');
const { createAd, getAds, deleteAd, updateAd, uploadAdsMiddleware } = require('../controllers/adController');
const router = express.Router();
const { requireAdmin, requireLogin, requireCustomer, requireSalonOrAdmin, requireSalonParamOrAdmin, requireCustomerParamOrAdmin } = require('../middlewares/accessControl');

router.post('/', requireAdmin, uploadAdsMiddleware, createAd);
router.put('/:id', requireAdmin, uploadAdsMiddleware, updateAd);
router.get('/', getAds);
router.delete('/:id', requireAdmin, deleteAd);

module.exports = router;
