const express = require('express');
const {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon
} = require('../controllers/couponController');

const router = express.Router();
const { requireAdmin, requireLogin, requireCustomer, requireSalonOrAdmin, requireSalonParamOrAdmin, requireCustomerParamOrAdmin } = require('../middlewares/accessControl');

router.post('/', requireAdmin, createCoupon);
router.get('/', getAllCoupons);
router.put('/:id', requireAdmin, updateCoupon);
router.delete('/:id', requireAdmin, deleteCoupon);

module.exports = router;
