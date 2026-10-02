const ReferralCampaign = require('../models/ReferralCampaign');

exports.getActiveCampaign = async (req, res) => {
    try {
        let campaign = await ReferralCampaign.findOne({ isActive: true });
        
        // If no campaign exists, create a default one
        if (!campaign) {
            campaign = await ReferralCampaign.create({
                title: "Refer & Earn ₹150",
                description: "Share your link with friends. They get ₹100 OFF, and you get ₹150 credits!",
                referrerBonus: 150,
                refereeDiscount: 100,
                defaultCode: "INSTATRIM50",
                isActive: true
            });
        }
        
        res.status(200).json({ success: true, data: campaign });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
