const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking);
router.get('/customer/:customerId', bookingController.getCustomerBookings);
router.get('/salon/:salonId', bookingController.getSalonBookings);
router.patch('/:id/status', bookingController.updateBookingStatus);

module.exports = router;
