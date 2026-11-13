const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    shortName: { type: String },
    slug: { type: String, required: true, unique: true },
    gender: { type: String, enum: ['men', 'women', 'unisex'], default: 'unisex' },
    // Customer home page section for this category's services ('' = not shown there)
    homeSection: { type: String, enum: ['', 'trending', 'featured'], default: '' },
    serviceCategories: [{ type: String }],
    // Master catalog hierarchy: sub-category → services (suggested duration & base price).
    // e.g. Hair → Haircut → Men's Haircut (30 min, ₹300)
    subcategoryGroups: [{
        _id: false,
        name: { type: String, required: true },
        services: [{
            _id: false,
            name: { type: String, required: true },
            duration: { type: Number, default: null }, // minutes (null = multi-session / varies)
            price: { type: Number, default: 0 }
        }]
    }],
    image: { type: String },
    price: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    originalPrice: { type: Number, default: 0 },
    description: { type: String },
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', default: null }, // Null = All Salons (Global)
    salonName: { type: String, default: 'All Salons (Global)' },
    isActive: { type: Boolean, default: true },
    colSpan: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
