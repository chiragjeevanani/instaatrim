const Payout = require('../models/Payout');

// GET /api/payouts
exports.getPayouts = async (req, res) => {
    try {
        const payouts = await Payout.find();
        res.status(200).json({ success: true, data: payouts });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/payouts
exports.createPayout = async (req, res) => {
    try {
        const payload = req.body;
        const newPayout = new Payout({
            ...payload,
            id: `pay-${Date.now()}`
        });
        await newPayout.save();
        res.status(201).json({ success: true, data: newPayout });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PUT /api/payouts/:id/status
exports.updatePayoutStatus = async (req, res) => {
    try {
        const { status, utr, notes } = req.body;
        const payout = await Payout.findOneAndUpdate(
            { id: req.params.id },
            { status, utr, notes },
            { new: true }
        );
        if (!payout) {
            return res.status(404).json({ success: false, message: 'Payout not found' });
        }
        res.status(200).json({ success: true, data: payout });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// POST /api/payouts/seed (To seed initial mock data from frontend)
exports.seedPayouts = async (req, res) => {
    try {
        await Payout.deleteMany({});
        const payouts = req.body.payouts;
        if (payouts && payouts.length > 0) {
            await Payout.insertMany(payouts);
        }
        res.status(200).json({ success: true, message: 'Payouts seeded' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
