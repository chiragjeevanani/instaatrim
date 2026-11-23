const express = require('express');
const router = express.Router();
const { requireAdmin, requireLogin, requireCustomer, requireSalonOrAdmin, requireSalonParamOrAdmin, requireCustomerParamOrAdmin } = require('../middlewares/accessControl');
const reviewController = require('../controllers/reviewController');

router.get('/', reviewController.getAllReviews);
router.get('/salon/:salonId', reviewController.getReviewsBySalon);
router.post('/', requireCustomer, reviewController.createReview);
router.patch('/:id/reply', requireSalonOrAdmin, reviewController.replyReview);
router.patch('/:id/flag', requireSalonOrAdmin, reviewController.flagReview);
router.delete('/:id', requireAdmin, reviewController.deleteReview);

module.exports = router;
