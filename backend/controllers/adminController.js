const Salon = require('../models/Salon');
const Customer = require('../models/Customer');
const Coupon = require('../models/Coupon');

exports.getDashboardStats = async (req, res) => {
    try {
        // Count real DB data
        const totalSalons = await Salon.countDocuments();
        const activeSalons = await Salon.countDocuments({ verificationStatus: 'Live' });
        const pendingSalons = await Salon.countDocuments({ verificationStatus: 'Pending' });
        const totalCustomers = await Customer.countDocuments();
        const totalCoupons = await Coupon.countDocuments();

        // Recent 5 salons registered
        const recentSalons = await Salon.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('salonName ownerName verificationStatus city createdAt');

        const stats = {
            totalSalons,
            activeSalons,
            pendingSalons,
            totalCustomers,
            totalCoupons,
            recentSalons: recentSalons.map(s => ({
                id: s._id.toString(),
                name: s.salonName,
                ownerName: s.ownerName,
                verificationStatus: s.verificationStatus,
                city: s.city,
                createdAt: s.createdAt
            }))
        };

        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('getDashboardStats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const PlatformSettings = require('../models/PlatformSettings');

exports.saveFcmToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = await PlatformSettings.create({});
        }

        if (!settings.adminFcmTokens) {
            settings.adminFcmTokens = [];
        }

        if (!settings.adminFcmTokens.includes(token)) {
            settings.adminFcmTokens.push(token);
            await settings.save();
        }

        res.status(200).json({ success: true, message: 'Admin FCM token registered' });
    } catch (error) {
        console.error('admin saveFcmToken error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
