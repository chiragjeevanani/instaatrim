const express = require('express');
const {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon
} = require('../controllers/couponController');

const router = express.Router();

router.post('/', createCoupon);
router.get('/', getAllCoupons);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;
