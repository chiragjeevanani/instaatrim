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
    isFlagged: { type: Boolean, default: false },
    // Detailed Customer Feedback Fields
    serviceQuality: { type: String, enum: ['Excellent', 'Good', 'Average', 'Poor'], default: 'Excellent' },
    waitingTime: { type: String, enum: ['As Expected', 'Less Than Expected', 'More Than Expected'], default: 'As Expected' },
    valueForMoney: { type: String, enum: ['Excellent', 'Good', 'Average', 'Poor'], default: 'Good' },
    bookingExperience: { type: String, enum: ['Easy', 'Average', 'Difficult'], default: 'Easy' },
    wouldRecommend: { type: String, enum: ['Yes', 'Maybe', 'No'], default: 'Yes' },
    suggestions: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
