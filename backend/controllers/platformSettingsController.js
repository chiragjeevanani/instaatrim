const PlatformSettings = require('../models/PlatformSettings');

exports.getSettings = async (req, res) => {
    try {
        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = await PlatformSettings.create({});
        }
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        console.error('getSettings error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = await PlatformSettings.create(req.body);
        } else {
            Object.assign(settings, req.body);
            await settings.save();
        }
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        console.error('updateSettings error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
