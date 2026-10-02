const Ticket = require('../models/Ticket');
const io = require('../socket');

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });
        res.json({ success: true, data: tickets });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTicketsByUser = async (req, res) => {
    try {
        const tickets = await Ticket.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: tickets });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createTicket = async (req, res) => {
    try {
        const { userId, userName, userRole, userContact, salonId, salonName, category, subject, message } = req.body;
        const ticket = new Ticket({
            userId, userName, userRole: userRole || 'customer',
            userContact, salonId, salonName, category, subject,
            messages: message ? [{ sender: userRole || 'customer', senderName: userName || 'Customer', text: message }] : []
        });
        await ticket.save();
        io.getIO().emit('ticket_created', ticket);
        res.status(201).json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        io.getIO().emit('ticket_updated', ticket);
        res.json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.replyToTicket = async (req, res) => {
    try {
        const { sender, senderName, text } = req.body;
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { $push: { messages: { sender, senderName, text } } },
            { new: true }
        );
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        io.getIO().emit('ticket_updated', ticket);
        res.json({ success: true, data: ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
