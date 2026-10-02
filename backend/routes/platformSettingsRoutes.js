const express = require('express');
const router = express.Router();
const platformSettingsController = require('../controllers/platformSettingsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', platformSettingsController.getSettings);
router.put('/', platformSettingsController.updateSettings);

module.exports = router;
