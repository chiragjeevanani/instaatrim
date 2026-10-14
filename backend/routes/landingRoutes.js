const express = require('express');
const router = express.Router();
const landingController = require('../controllers/landingController');
const { protectAdmin } = require('../middlewares/authMiddleware');

router.get('/', landingController.getLanding);
router.put('/', protectAdmin, landingController.updateLanding);
router.delete('/', protectAdmin, landingController.resetLanding);

module.exports = router;
