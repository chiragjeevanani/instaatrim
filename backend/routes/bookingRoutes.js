const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAdmin, requireCustomer, requireLogin, requireSalonParamOrAdmin, requireSalonOrAdmin, requireCustomerParamOrAdmin } = require('../middlewares/accessControl');

router.post('/', requireCustomer, bookingController.createBooking);
// Salon counter walk-in: salon's own menu price, no app offers / fees / wallet, no customer account
router.post('/walk-in', requireSalonOrAdmin, bookingController.createWalkInBooking);
router.get('/all', requireAdmin, bookingController.getAllBookings);
router.get('/customer/:customerId', requireCustomerParamOrAdmin('customerId'), bookingController.getCustomerBookings);
router.get('/salon/:salonId/staff/:staffId/busy', bookingController.getStaffBusy); // public: times only, no customer details
router.get('/salon/:salonId', requireSalonParamOrAdmin('salonId'), bookingController.getSalonBookings);
router.get('/:id', requireLogin, bookingController.getBookingById);           // owner check inside
router.patch('/:id/status', requireLogin, bookingController.updateBookingStatus); // owner + transition check inside
router.patch('/:id/reschedule', requireLogin, bookingController.rescheduleBooking); // owner check inside

module.exports = router;
