const express = require('express');
const { getServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protectSalonOrAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public: customers browse services
router.get('/', getServices);

// Protected: only the owning salon partner (or admin) can add / edit / delete
router.post('/', protectSalonOrAdmin, createService);
router.put('/:id', protectSalonOrAdmin, updateService);
router.delete('/:id', protectSalonOrAdmin, deleteService);

module.exports = router;
