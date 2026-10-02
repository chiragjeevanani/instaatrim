const HeroBanner = require('../models/HeroBanner');

// POST /api/herobanners
exports.createHeroBanner = async (req, res) => {
    try {
        const banner = new HeroBanner(req.body);
        const saved = await banner.save();
        res.status(201).json({ success: true, data: saved });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/herobanners
exports.getHeroBanners = async (req, res) => {
    try {
        const banners = await HeroBanner.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: banners });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/herobanners/:id
exports.updateHeroBanner = async (req, res) => {
    try {
        const updated = await HeroBanner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/herobanners/:id
exports.deleteHeroBanner = async (req, res) => {
    try {
        const deleted = await HeroBanner.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
