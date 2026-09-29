const mongoose = require('mongoose');

const adCampaignSchema = new mongoose.Schema({
    brand: { type: String, required: true },
    sponsorBadge: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    discountBadge: { type: String },
    couponCode: { type: String },
    ctaText: { type: String, default: 'Claim Deal' },
    images: [{ type: String, required: true }],
    salonId: { type: String }, // Temporarily String since Salons are still static
    category: { type: String },
    validTill: { type: String },
    isActive: { type: Boolean, default: true },
    campaignType: { 
        type: String, 
        enum: ['top_carousel', 'hero_banner', 'mid_page', 'sponsored_deal', 'brand_showcase'], 
        default: 'top_carousel' 
    },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('AdCampaign', adCampaignSchema);
