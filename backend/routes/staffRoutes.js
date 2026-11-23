const express = require('express');
const router = express.Router();
const { requireAdmin, requireLogin, requireCustomer, requireSalonOrAdmin, requireSalonParamOrAdmin, requireCustomerParamOrAdmin } = require('../middlewares/accessControl');
const staffController = require('../controllers/staffController');

router.get('/', staffController.getAllStaff);
router.post('/salon/:salonId', requireSalonParamOrAdmin('salonId'), staffController.createStaff);
router.get('/salon/:salonId', staffController.getStaffBySalon);
router.put('/:id', requireSalonOrAdmin, staffController.updateStaff);
router.delete('/:id', requireSalonOrAdmin, staffController.deleteStaff);

module.exports = router;
