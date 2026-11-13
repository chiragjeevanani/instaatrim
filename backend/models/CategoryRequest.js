const mongoose = require('mongoose');

// A salon partner asks admin to add a new sub-category (service tag) to an existing
// category, or to create a brand-new category. Admin approves / rejects.
const categoryRequestSchema = new mongoose.Schema({
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
    salonName: { type: String, default: '' },

    type: { type: String, enum: ['subcategory', 'category'], required: true },

    // For type 'subcategory': the existing category it should be added to
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    categoryName: { type: String, default: '' },

    // Requested service name (type 'subcategory'), or new category name (type 'category')
    requestedName: { type: String, required: true, trim: true },
    // For a missing service: which sub-category it belongs to (e.g. "Haircut") + suggested time & price
    groupName: { type: String, default: '', trim: true },
    duration: { type: Number, default: null },  // minutes
    price: { type: Number, default: 0 },
    // For type 'category': initial sub-services the salon suggests
    tags: [{ type: String, trim: true }],
    gender: { type: String, enum: ['men', 'women', 'unisex'], default: 'unisex' },
    note: { type: String, default: '', trim: true },

    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
    // Category that was created / updated on approval
    resultCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
}, { timestamps: true });

categoryRequestSchema.index({ status: 1, createdAt: -1 });
categoryRequestSchema.index({ salonId: 1, createdAt: -1 });

module.exports = mongoose.model('CategoryRequest', categoryRequestSchema);
