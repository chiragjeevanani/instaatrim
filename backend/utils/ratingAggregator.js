// Real ratings, calculated from customer reviews stored in DB.
// Salon rating = average of all (non-flagged) reviews of that salon.
// Staff rating = average of reviews whose booking was served by that stylist.
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Salon = require('../models/Salon');
const Staff = require('../models/Staff');

const round1 = (n) => Math.round(Number(n || 0) * 10) / 10;

const averageFor = async (match) => {
    const [row] = await Review.aggregate([
        { $match: { ...match, isFlagged: { $ne: true } } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    return { rating: row ? round1(row.avg) : 0, count: row ? row.count : 0 };
};

const recalcSalonRating = async (salonId) => {
    if (!salonId || !mongoose.Types.ObjectId.isValid(String(salonId))) return null;
    const { rating, count } = await averageFor({ salonId: String(salonId) });
    await Salon.findByIdAndUpdate(salonId, { rating, reviewsCount: count });
    return { rating, count };
};

const recalcStaffRating = async (staffId) => {
    if (!staffId || !mongoose.Types.ObjectId.isValid(String(staffId))) return null;
    const { rating, count } = await averageFor({ staffId: String(staffId) });
    await Staff.findByIdAndUpdate(staffId, { rating, reviewCount: count });
    return { rating, count };
};

// Safe wrapper: rating refresh must never break the review request itself
const refreshRatings = async ({ salonId, staffId }) => {
    try {
        await Promise.all([recalcSalonRating(salonId), recalcStaffRating(staffId)]);
    } catch (e) {
        console.error('[Ratings] recalculation failed:', e.message);
    }
};

module.exports = { recalcSalonRating, recalcStaffRating, refreshRatings };
