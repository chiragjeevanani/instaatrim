const express = require('express');
const { getStationsBySalon, createStation, updateStation, deleteStation } = require('../controllers/stationController');
const { protectSalonOrAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public read (chair availability)
router.get('/salon/:salonId', getStationsBySalon);

// Only the owning salon partner (or admin) can change chairs
router.post('/', protectSalonOrAdmin, createStation);
router.put('/:id', protectSalonOrAdmin, updateStation);
router.delete('/:id', protectSalonOrAdmin, deleteStation);

module.exports = router;
