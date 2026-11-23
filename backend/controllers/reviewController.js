const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { refreshRatings } = require('../utils/ratingAggregator');

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

const { identify } = require('../middlewares/accessControl');
// Salon partner may only reply to / flag reviews of its own salon (admin: any)
const ownsReview = async (req, id) => {
    const a = identify(req);
    if (a.admin) return true;
    const rv = await Review.findById(id).select('salonId').lean().catch(() => null);
    return !!rv && String(rv.salonId) === a.salonId;
};

exports.createReview = async (req, res) => {
    try {
        const body = { ...req.body };
        const rating = Number(body.rating);
        if (!body.salonId || !Number.isFinite(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'salonId and a rating between 1 and 5 are required' });
        }
        body.rating = rating;
        // Never trust client for these — derived from the booking below
        delete body.staffId;
        delete body.stationId;
        delete body.verifiedBooking;
        delete body.isFlagged;

        if (body.bookingId) {
            // One review per booking
            const already = await Review.findOne({ bookingId: String(body.bookingId) });
            if (already) {
                return res.status(409).json({ success: false, message: 'This booking has already been reviewed.' });
            }
            // Booking _id is a custom string (e.g. IT-220001), not an ObjectId
            {
                const booking = await Booking.findById(String(body.bookingId)).select('salonId staffId stationId customerId').catch(() => null);
                // 'Verified booking' only when it is the reviewer's own booking at this salon
                if (booking && String(booking.salonId) === String(body.salonId) && String(booking.customerId) === identify(req).customerId) {
                    body.staffId = booking.staffId || '';
                    body.stationId = booking.stationId || '';
                    body.verifiedBooking = true;
                }
            }
        }

        const review = new Review(body);
        await review.save();
        await refreshRatings({ salonId: review.salonId, staffId: review.staffId });
        res.status(201).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.replyReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;
        if (!(await ownsReview(req, id))) return res.status(404).json({ success: false, message: 'Review not found' });
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
        if (!(await ownsReview(req, id))) return res.status(404).json({ success: false, message: 'Review not found' });
        const review = await Review.findByIdAndUpdate(id, { isFlagged, flagReason }, { new: true });
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        // Flagged reviews don't count towards ratings
        await refreshRatings({ salonId: review.salonId, staffId: review.staffId });
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
        await refreshRatings({ salonId: review.salonId, staffId: review.staffId });
        res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
