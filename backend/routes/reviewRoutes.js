const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.get('/', reviewController.getAllReviews);
router.get('/salon/:salonId', reviewController.getReviewsBySalon);
router.post('/', reviewController.createReview);
router.patch('/:id/reply', reviewController.replyReview);
router.patch('/:id/flag', reviewController.flagReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
