const EliteConfig = require('../models/EliteConfig');
const MidPageCampaign = require('../models/MidPageCampaign');

exports.getEliteConfig = async (req, res) => {
    try {
        let config = await EliteConfig.findOne({ isActive: true });
        
        const defaultPlans = [
            { planName: 'Monthly', durationMonths: 1, price: 99, originalPrice: 199 },
            { planName: 'Quarterly', durationMonths: 3, price: 199, originalPrice: 499 },
            { planName: 'Annual', durationMonths: 12, price: 299, originalPrice: 999 }
        ];

        if (!config) {
            config = await EliteConfig.create({
                title: "Elite",
                discountText: "Get 10% OFF on all bookings",
                plans: defaultPlans,
                benefits: [
                  'Flat 10% Extra Discount on all bookings across all salons',
                  'Free cancellation up to 1 hour before scheduled time',
                  'Priority slot access & zero convenience charges',
                  'Free Safety & Sanitized Kit on every visit'
                ],
                isActive: true
            });
        } else if (!config.plans || config.plans.length === 0) {
            config.plans = defaultPlans;
            await config.save();
        }
        
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateEliteConfig = async (req, res) => {
    try {
        let config = await EliteConfig.findOne({ isActive: true });
        if (!config) {
            config = new EliteConfig({ ...req.body, isActive: true });
            await config.save();
        } else {
            Object.assign(config, req.body);
            await config.save();
        }
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMidPageCampaigns = async (req, res) => {
    try {
        let campaigns = await MidPageCampaign.find({ isActive: true });
        
        if (campaigns.length === 0) {
            const campaign1 = await MidPageCampaign.create({
                tag: "LUXURY RITUALS SPOTLIGHT",
                title: "Korean Glass Skin & Hair Botox Fest",
                subtitle: "Flat ₹500 OFF with Dyson & L'Oréal Salons",
                bgClass: "from-[#2A0845] to-[#6441A5]",
                offerText: "SPECIAL OFFER",
                offerDetail: "HydraGlow Facial + Blowout Package",
                couponCode: "KOREAGLOW",
                isActive: true
            });
            campaigns = [campaign1];
        }
        
        res.status(200).json({ success: true, data: campaigns });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
