const mongoose = require('mongoose');

const referralCampaignSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    referrerBonus: { type: Number, required: true },
    refereeDiscount: { type: Number, required: true },
    defaultCode: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ReferralCampaign', referralCampaignSchema);
