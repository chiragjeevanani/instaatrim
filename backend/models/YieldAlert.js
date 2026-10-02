const mongoose = require('mongoose');

const yieldAlertSchema = new mongoose.Schema({
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' },
    timeWindow: { type: String, default: '1:00 PM - 4:00 PM' },
    idleStations: { type: Number, default: 2 },
    recommendedDiscount: { type: Number, default: 25 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('YieldAlert', yieldAlertSchema);
