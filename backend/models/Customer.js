const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Customer',
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
    },
    gender: {
        type: String,
        enum: ['female', 'male', 'other'],
        default: 'female',
    },
    dob: {
        type: Date,
    },
    is_elite: {
        type: Boolean,
        default: false,
    },
    referral_code: {
        type: String,
        unique: true,
    },
    referred_by_code: {
        type: String,
    },
    favorite_salon_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salon'
    }],
    saved_locations: [{
        _id: false,
        id: { type: String, required: true },
        userId: { type: String, required: true },
        area: { type: String, required: true },
        address: { type: String, required: true },
        landmark: { type: String, default: '' },
        city: { type: String, default: '' },
        pincode: { type: String, default: '' },
        lat: { type: Number },
        lng: { type: Number },
        isCurrent: { type: Boolean, default: false },
    }],
    cart_items: { type: [mongoose.Schema.Types.Mixed], default: [] },
    booking_slot: { type: mongoose.Schema.Types.Mixed, default: null },
    auth_provider: {
        type: String,
        default: 'otp',
    },
    otp: {
        type: String,
    },
    fcmtoken: {
        type: String,
    },
    fcmtokenweb: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Customer', customerSchema);
