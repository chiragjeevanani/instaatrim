const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    shortName: { type: String },
    slug: { type: String, required: true, unique: true },
    gender: { type: String, enum: ['men', 'women', 'unisex'], default: 'unisex' },
    serviceCategories: [{ type: String }],
    image: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    colSpan: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
