const mongoose = require('mongoose');

const midPageCampaignSchema = new mongoose.Schema({
    tag: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    bgClass: { type: String, required: true },
    offerText: { type: String, required: true },
    offerDetail: { type: String, required: true },
    couponCode: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('MidPageCampaign', midPageCampaignSchema);
