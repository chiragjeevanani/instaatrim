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
    auth_provider: {
        type: String,
        default: 'otp',
    },
    otp: {
        type: String,
    },
    otpExpiry: {
        type: Date,
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Customer', customerSchema);
