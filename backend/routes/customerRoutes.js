const express = require('express');
const router = express.Router();
const { protectCustomer } = require('../middlewares/authMiddleware');
const { getMyProfile, updateMyProfile, getAllCustomers } = require('../controllers/customerController');

// GET  /api/customers/all  → get all customers (admin use)
router.get('/all', getAllCustomers);

// GET  /api/customers/me  → get own profile (protected)
router.get('/me', protectCustomer, getMyProfile);

// PUT  /api/customers/me  → update own profile (protected)
router.put('/me', protectCustomer, updateMyProfile);

// PATCH /api/customers/:id/elite → upgrade to elite
router.patch('/:id/elite', require('../controllers/customerController').upgradeToElite);

module.exports = router;
