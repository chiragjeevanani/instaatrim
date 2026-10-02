const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    salonId: { type: String, required: true },
    customerName: { type: String, required: true },
    rating: { type: Number, required: true },
    date: { type: String },
    comment: { type: String },
    service: { type: String },
    reply: { type: String },
    verifiedBooking: { type: Boolean, default: false },
    bookingId: { type: String },
    isFlagged: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
