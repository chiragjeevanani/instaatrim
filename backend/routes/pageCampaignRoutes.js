const express = require('express');
const router = express.Router();
const { requireAdmin, requireLogin, requireCustomer, requireSalonOrAdmin, requireSalonParamOrAdmin, requireCustomerParamOrAdmin } = require('../middlewares/accessControl');
const pageCampaignController = require('../controllers/pageCampaignController');

router.get('/elite', pageCampaignController.getEliteConfig);
router.put('/elite', requireAdmin, pageCampaignController.updateEliteConfig);
router.get('/midpage', pageCampaignController.getMidPageCampaigns);

module.exports = router;
