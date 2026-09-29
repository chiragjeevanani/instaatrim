const Service = require('../models/Service');

exports.getServices = async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: services.length, data: services });
    } catch (error) {
        console.error('getServices error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
