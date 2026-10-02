const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    salonId: { type: String, required: true },
    salonName: { type: String, required: true },
    date: { type: String, required: true },
    bankAccount: { type: String, required: true },
    ifsc: { type: String, required: true },
    grossAmount: { type: Number, required: true },
    commissionDeducted: { type: Number, required: true },
    commissionPercent: { type: Number, required: true },
    netAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Transferred', 'Rejected'], default: 'Pending' },
    utr: { type: String },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
