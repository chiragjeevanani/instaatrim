const express = require('express');
const router = express.Router();
const pageCampaignController = require('../controllers/pageCampaignController');

router.get('/elite', pageCampaignController.getEliteConfig);
router.put('/elite', pageCampaignController.updateEliteConfig);
router.get('/midpage', pageCampaignController.getMidPageCampaigns);

module.exports = router;
