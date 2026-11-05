const express = require('express');
const {
    createRequest,
    getMyRequests,
    getAllRequests,
    approveRequest,
    rejectRequest
} = require('../controllers/categoryRequestController');
const { protectAdmin, protectSalonOrAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Salon partner
router.post('/', protectSalonOrAdmin, createRequest);
router.get('/mine', protectSalonOrAdmin, getMyRequests);

// Admin
router.get('/', protectAdmin, getAllRequests);
router.put('/:id/approve', protectAdmin, approveRequest);
router.put('/:id/reject', protectAdmin, rejectRequest);

module.exports = router;
