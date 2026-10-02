const express = require('express');
const router = express.Router();
const heroBannerController = require('../controllers/heroBannerController');

router.post('/', heroBannerController.createHeroBanner);
router.get('/', heroBannerController.getHeroBanners);
router.put('/:id', heroBannerController.updateHeroBanner);
router.delete('/:id', heroBannerController.deleteHeroBanner);

module.exports = router;
