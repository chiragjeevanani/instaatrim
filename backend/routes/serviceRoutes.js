const express = require('express');
const { getServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protectAdmin } = require('../middlewares/authMiddleware'); // we can protect if we want, but GET is fine

const router = express.Router();

router.get('/', getServices);
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;
