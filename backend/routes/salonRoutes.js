const express = require('express');
const router = express.Router();
const salonController = require('../controllers/salonController');

router.post('/register', salonController.registerSalon);
router.post('/login', salonController.loginSalon);
router.get('/', salonController.getAllSalons);
router.get('/:id', salonController.getSalonById);
router.patch('/:id/verify', salonController.verifySalon);
router.patch('/:id/reject', salonController.rejectSalon);
router.patch('/:id/commission', salonController.setSalonCommission);
router.put('/:id', salonController.updateSalon);

module.exports = router;
