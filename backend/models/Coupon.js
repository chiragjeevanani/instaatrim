const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    discountPercent: {
        type: Number,
        default: null
    },
    flatDiscount: {
        type: Number,
        default: null
    },
    maxDiscount: {
        type: Number,
        default: null
    },
    minOrder: {
        type: Number,
        default: 0
    },
    scope: {
        type: String,
        default: 'platform'
    },
    firstBookingOnly: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);
