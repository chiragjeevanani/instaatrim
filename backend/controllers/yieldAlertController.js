const YieldAlert = require('../models/YieldAlert');

exports.getYieldAlert = async (req, res) => {
    try {
        const { salonId } = req.params;
        let alert = await YieldAlert.findOne({ salonId });

        if (!alert) {
            alert = await YieldAlert.create({
                salonId,
                timeWindow: '1:00 PM - 4:00 PM',
                idleStations: 2,
                recommendedDiscount: 25,
                isActive: true
            });
        }
        
        res.status(200).json({ success: true, data: alert });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateYieldAlert = async (req, res) => {
    try {
        const { salonId } = req.params;
        let alert = await YieldAlert.findOne({ salonId });

        if (!alert) {
            alert = await YieldAlert.create({ salonId, ...req.body });
        } else {
            Object.assign(alert, req.body);
            await alert.save();
        }

        res.status(200).json({ success: true, data: alert });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
