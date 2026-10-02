const Review = require('../models/Review');

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getReviewsBySalon = async (req, res) => {
    try {
        const { salonId } = req.params;
        const reviews = await Review.find({ salonId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createReview = async (req, res) => {
    try {
        const review = new Review(req.body);
        await review.save();
        res.status(201).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.replyReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;
        const review = await Review.findByIdAndUpdate(id, { reply }, { new: true });
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        res.status(200).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.flagReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { isFlagged, flagReason } = req.body;
        const review = await Review.findByIdAndUpdate(id, { isFlagged, flagReason }, { new: true });
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        res.status(200).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByIdAndDelete(id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
