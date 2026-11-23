const express = require('express');
const router = express.Router();
const { requireAdmin, requireLogin, requireCustomer, requireSalonOrAdmin, requireSalonParamOrAdmin, requireCustomerParamOrAdmin } = require('../middlewares/accessControl');
const {
    getAllTickets,
    getTicketsByUser,
    createTicket,
    updateTicketStatus,
    replyToTicket
} = require('../controllers/ticketController');

router.get('/', requireAdmin, getAllTickets);
router.get('/user/:userId', requireLogin, getTicketsByUser);
router.post('/', requireLogin, createTicket);
router.patch('/:id/status', requireAdmin, updateTicketStatus);
router.post('/:id/reply', requireAdmin, replyToTicket);

module.exports = router;
