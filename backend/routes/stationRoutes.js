const express = require('express');
const { getStationsBySalon, createStation, updateStation, deleteStation } = require('../controllers/stationController');

const router = express.Router();

router.get('/salon/:salonId', getStationsBySalon);
router.post('/', createStation);
router.put('/:id', updateStation);
router.delete('/:id', deleteStation);

module.exports = router;
