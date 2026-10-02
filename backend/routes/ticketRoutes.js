const express = require('express');
const router = express.Router();
const {
    getAllTickets,
    getTicketsByUser,
    createTicket,
    updateTicketStatus,
    replyToTicket
} = require('../controllers/ticketController');

router.get('/', getAllTickets);
router.get('/user/:userId', getTicketsByUser);
router.post('/', createTicket);
router.patch('/:id/status', updateTicketStatus);
router.post('/:id/reply', replyToTicket);

module.exports = router;
