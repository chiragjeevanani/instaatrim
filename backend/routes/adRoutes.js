const express = require('express');
const { createAd, getAds, deleteAd, updateAd, uploadAdsMiddleware } = require('../controllers/adController');
const router = express.Router();

router.post('/', uploadAdsMiddleware, createAd);
router.put('/:id', uploadAdsMiddleware, updateAd);
router.get('/', getAds);
router.delete('/:id', deleteAd);

module.exports = router;
