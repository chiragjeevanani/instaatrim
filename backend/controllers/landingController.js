const LandingContent = require('../models/LandingContent');

// GET /api/landing — public; returns null content until an admin saves once
exports.getLanding = async (req, res) => {
    try {
        const doc = await LandingContent.findOne({ key: 'main' });
        res.status(200).json({ success: true, data: doc ? doc.content : null, updatedAt: doc?.updatedAt || null });
    } catch (error) {
        console.error('getLanding error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PUT /api/landing — admin only; replaces the stored section tree
exports.updateLanding = async (req, res) => {
    try {
        const content = req.body?.content;
        if (!content || typeof content !== 'object' || Array.isArray(content)) {
            return res.status(400).json({ success: false, message: 'content object is required' });
        }
        const doc = await LandingContent.findOneAndUpdate(
            { key: 'main' },
            { content },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.status(200).json({ success: true, data: doc.content, updatedAt: doc.updatedAt });
    } catch (error) {
        console.error('updateLanding error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// DELETE /api/landing — admin only; drops saved copy so the defaults apply again
exports.resetLanding = async (req, res) => {
    try {
        await LandingContent.deleteOne({ key: 'main' });
        res.status(200).json({ success: true, data: null });
    } catch (error) {
        console.error('resetLanding error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
