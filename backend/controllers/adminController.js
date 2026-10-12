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

const Notification = require('../models/Notification');
const { sendPushNotification } = require('../config/firebase');

// Helper to get socket.io safely
const getSocketIO = () => {
    try {
        return require('../socket').getIO();
    } catch (e) {
        return null;
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const list = await Notification.find().sort({ createdAt: -1 }).limit(50);
        res.status(200).json({ success: true, data: list });
    } catch (error) {
        console.error('getNotifications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.sendBroadcast = async (req, res) => {
    try {
        const { title, message, audience = 'all' } = req.body;
        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Title and message are required' });
        }

        // 1. Gather all target FCM tokens from MongoDB
        const tokens = new Set();

        // If target includes customers
        if (audience === 'all' || audience === 'customer' || audience === 'customers') {
            const customers = await Customer.find({
                $or: [
                    { fcmtokenweb: { $exists: true, $ne: null } },
                    { fcmtoken: { $exists: true, $ne: null } }
                ]
            }).select('fcmtoken fcmtokenweb');

            customers.forEach(c => {
                if (c.fcmtokenweb) tokens.add(c.fcmtokenweb);
                if (c.fcmtoken) tokens.add(c.fcmtoken);
            });
        }

        // If target includes salons
        if (audience === 'all' || audience === 'salon' || audience === 'salons') {
            const salons = await Salon.find({
                $or: [
                    { fcmtokenweb: { $exists: true, $ne: null } },
                    { fcmtoken: { $exists: true, $ne: null } }
                ]
            }).select('fcmtoken fcmtokenweb');

            salons.forEach(s => {
                if (s.fcmtokenweb) tokens.add(s.fcmtokenweb);
                if (s.fcmtoken) tokens.add(s.fcmtoken);
            });
        }

        console.log(`[Broadcast] Sending to ${tokens.size} tokens for audience: ${audience}`);

        // 2. Dispatch Push Notification via Firebase FCM
        let sentCount = 0;
        for (const token of tokens) {
            try {
                const res = await sendPushNotification(token, title, message, {
                    type: 'SYSTEM_BROADCAST',
                    title: String(title),
                    body: String(message),
                    audience: String(audience),
                    tag: `broadcast-${Date.now()}`,
                    link: audience === 'salon' ? '/salon/dashboard' : '/'
                });
                if (res) sentCount++;
            } catch (err) {
                console.error('[Broadcast] Token push error:', err.message);
            }
        }

        // 3. Save broadcast in MongoDB
        const newNotif = await Notification.create({
            title,
            message,
            audience,
            type: 'broadcast',
            sentCount
        });

        // 4. Real-time Socket.io broadcast to connected clients
        const io = getSocketIO();
        if (io) {
            io.emit('system_broadcast', {
                id: newNotif._id,
                title,
                message,
                audience,
                createdAt: newNotif.createdAt
            });
        }

        res.status(200).json({
            success: true,
            message: `Broadcast successfully sent to ${tokens.size} recipients`,
            data: newNotif
        });
    } catch (error) {
        console.error('sendBroadcast error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
