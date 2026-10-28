const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    shortName: { type: String },
    slug: { type: String, required: true, unique: true },
    gender: { type: String, enum: ['men', 'women', 'unisex'], default: 'unisex' },
    serviceCategories: [{ type: String }],
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
