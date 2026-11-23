const express = require('express');
const router = express.Router();
const { requireAdmin, requireLogin, requireCustomer, requireSalonOrAdmin, requireSalonParamOrAdmin, requireCustomerParamOrAdmin } = require('../middlewares/accessControl');
const platformSettingsController = require('../controllers/platformSettingsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', platformSettingsController.getSettings);
router.put('/', requireAdmin, platformSettingsController.updateSettings);

module.exports = router;
