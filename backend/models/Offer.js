const mongoose = require('mongoose');

// A promotional offer is a DISCOUNT RULE applied to a salon's real services:
// "20% OFF on Spa & Massage → Head Massage at skncns, Mon–Fri, till 31 Dec".
// salonId null = applies to every salon (global offer).
const offerSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },

    // Which services it applies to (matched against Service.category / subcategory / title)
    category: { type: String, default: '', trim: true },        // '' = all categories
    subcategories: [{ type: String, trim: true }],              // [] = whole category

    salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', default: null }, // null = all salons
    salonName: { type: String, default: 'All Salons (Global Offer)' },

    discountPercent: { type: Number, required: true, min: 1, max: 90 },
    maxDiscount: { type: Number, default: 0 },                  // 0 = no cap (₹)

    applicableDays: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    // Day-wise discount (e.g. weekdays 30%, weekend 10%). null = same discountPercent every applicable day.
    // When set: each day's own % (0 = no offer that day); discountPercent = the highest day value.
    dayDiscounts: {
        type: new mongoose.Schema({
            Mon: Number, Tue: Number, Wed: Number, Thu: Number, Fri: Number, Sat: Number, Sun: Number
        }, { _id: false }),
        default: null
    },
    validTill: { type: String, default: '' },                   // 'YYYY-MM-DD', '' = no expiry

    isActive: { type: Boolean, default: true },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    rejectionReason: { type: String, default: '' },
    createdBy: { type: String, enum: ['admin', 'salon'], default: 'admin' },
    redeemedCount: { type: Number, default: 0 }
}, { timestamps: true });

offerSchema.index({ salonId: 1, isActive: 1, approvalStatus: 1 });

module.exports = mongoose.model('Offer', offerSchema);
