const express = require('express');
const router = express.Router();
const { requireAdmin, requireLogin, requireCustomer, requireSalonOrAdmin, requireSalonParamOrAdmin, requireCustomerParamOrAdmin } = require('../middlewares/accessControl');
const heroBannerController = require('../controllers/heroBannerController');

router.post('/', requireAdmin, heroBannerController.createHeroBanner);
router.get('/', heroBannerController.getHeroBanners);
router.put('/:id', requireAdmin, heroBannerController.updateHeroBanner);
router.delete('/:id', requireAdmin, heroBannerController.deleteHeroBanner);

module.exports = router;
