const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');

router.get('/active', referralController.getActiveCampaign);

module.exports = router;
