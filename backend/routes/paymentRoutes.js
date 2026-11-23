const express = require('express');
const router = express.Router();
const { requireAdmin, requireLogin, requireCustomer, requireSalonOrAdmin, requireSalonParamOrAdmin, requireCustomerParamOrAdmin } = require('../middlewares/accessControl');
const paymentController = require('../controllers/paymentController');

router.post('/create-order', requireCustomer, paymentController.createOrder);
router.post('/verify', requireCustomer, paymentController.verifyPayment);

module.exports = router;
