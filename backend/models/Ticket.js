const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema({
    sender: { type: String, enum: ['customer', 'salon', 'admin'], required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ticketSchema = new mongoose.Schema({
    userId: { type: String },
    userName: { type: String },
    userRole: { type: String, enum: ['customer', 'salon', 'admin'], default: 'customer' },
    userContact: { type: String },
    salonId: { type: String },
    salonName: { type: String },
    category: { type: String },
    subject: { type: String, required: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
    messages: [ticketMessageSchema]
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
