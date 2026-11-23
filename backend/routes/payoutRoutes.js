const express = require('express');
const router = express.Router();
const { getPayouts, createPayout, updatePayoutStatus, seedPayouts } = require('../controllers/payoutController');
const { requireAdmin, requireSalonOrAdmin } = require('../middlewares/accessControl');

router.get('/', requireSalonOrAdmin, getPayouts);        // salon sees only its own
router.post('/', requireSalonOrAdmin, createPayout);     // salon can request only for itself
router.put('/:id/status', requireAdmin, updatePayoutStatus);
router.post('/seed', requireAdmin, seedPayouts);

module.exports = router;
