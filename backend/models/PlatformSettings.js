const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
    convenienceFee: { type: Number, default: 15 },
    taxRatePercent: { type: Number, default: 5 },
    defaultCommissionRatePercent: { type: Number, default: 12 },
    referralBonusCustomer: { type: Number, default: 50 },
    referralBonusReferee: { type: Number, default: 100 },
    minPayoutThreshold: { type: Number, default: 1000 },
    cancellationFreeHours: { type: Number, default: 1 },
    supportPhone: { type: String, default: '1800-200-8811' },
    supportEmail: { type: String, default: 'support@instaatrim.com' },
    supportTopics: { 
        type: [String], 
        default: ['Booking & Rescheduling', 'Payment & Refunds', 'Salon Partner Feedback', 'Technical Issue', 'General Inquiry'] 
    },
    partnerSupportTopics: {
        type: [String],
        default: ['Payout & Billing', 'Booking Issue / No-Show', 'Menu & Service Edits', 'KYC & Account Verification', 'Emergency Technical Support']
    }
}, { timestamps: true });

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
