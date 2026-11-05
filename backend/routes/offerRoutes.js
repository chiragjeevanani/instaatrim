const express = require('express');
const c = require('../controllers/offerController');
const { protectAdmin, protectSalonOrAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public — live offers for the customer app (?salonId= for one salon)
router.get('/', c.listLiveOffers);

// Salon partner — own + global offers, and propose an offer (pending admin approval)
router.get('/mine', protectSalonOrAdmin, c.listMyOffers);
router.post('/salon', protectSalonOrAdmin, c.createOffer);
router.put('/:id/toggle', protectSalonOrAdmin, c.toggleOffer);

// Admin
router.get('/admin', protectAdmin, c.listAllOffers);
router.post('/', protectAdmin, c.createOffer);
router.put('/:id', protectAdmin, c.updateOffer);
router.put('/:id/status', protectAdmin, c.setOfferStatus);
router.delete('/:id', protectAdmin, c.deleteOffer);

module.exports = router;
