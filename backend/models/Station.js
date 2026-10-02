const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    name: { type: String, required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Station', stationSchema);
