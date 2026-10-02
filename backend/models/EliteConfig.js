const mongoose = require('mongoose');

const eliteConfigSchema = new mongoose.Schema({
    title: { type: String, required: true },
    discountText: { type: String, required: true },
    plans: [{
        planName: { type: String, required: true },
        durationMonths: { type: Number, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number, required: true }
    }],
    benefits: { type: [String], default: [] },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('EliteConfig', eliteConfigSchema);
