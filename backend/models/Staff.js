const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    serviceCategories: [{ type: String }],
    // Real values only (0 = no reviews yet → UI shows "New"). Never set by salon.
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
