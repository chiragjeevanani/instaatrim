const express = require('express');
const router = express.Router();
const { getPayouts, updatePayoutStatus, seedPayouts, createPayout } = require('../controllers/payoutController');

router.get('/', getPayouts);
router.post('/', createPayout);
router.put('/:id/status', updatePayoutStatus);
router.post('/seed', seedPayouts);

module.exports = router;
