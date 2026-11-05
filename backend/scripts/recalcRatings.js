// Recalculate every salon & staff rating from REAL customer reviews in DB.
// - Links old reviews to the stylist/chair of their booking (if missing)
// - Salon rating  = average of its non-flagged reviews (0 = "New")
// - Staff rating  = average of reviews of bookings that stylist served (0 = "New")
//   → this also removes the old fake default 4.8 / 42 from staff.
//
// Dry run (only shows what would change):  node scripts/recalcRatings.js
// Apply:                                   node scripts/recalcRatings.js --apply
require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Salon = require('../models/Salon');
const Staff = require('../models/Staff');

const round1 = (n) => Math.round(Number(n || 0) * 10) / 10;

(async () => {
    const apply = process.argv.includes('--apply');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

    // 1) Link old reviews to their booking's stylist / chair
    const unlinked = await Review.find({ bookingId: { $nin: [null, ''] }, $or: [{ staffId: { $in: [null, ''] } }, { staffId: { $exists: false } }] });
    let linked = 0;
    for (const r of unlinked) {
        // Booking _id is a custom string (e.g. IT-220001)
        const b = await Booking.findById(String(r.bookingId)).select('staffId stationId salonId').catch(() => null);
        if (b && b.staffId && String(b.salonId) === String(r.salonId)) {
            linked += 1;
            if (apply) await Review.updateOne({ _id: r._id }, { staffId: b.staffId, stationId: b.stationId || '', verifiedBooking: true });
        }
    }
    console.log(`Reviews linked to stylist: ${linked}`);

    // 2) Aggregate real averages
    const agg = (field) =>
        Review.aggregate([
            { $match: { isFlagged: { $ne: true }, [field]: { $nin: [null, ''] } } },
            { $group: { _id: `$${field}`, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
    const salonMap = new Map((await agg('salonId')).map((r) => [String(r._id), r]));
    const staffMap = new Map((await agg('staffId')).map((r) => [String(r._id), r]));

    // 3) Salons
    let salonChanged = 0;
    for (const s of await Salon.find().select('name rating reviewsCount')) {
        const row = salonMap.get(String(s._id));
        const rating = row ? round1(row.avg) : 0;
        const count = row ? row.count : 0;
        if (Number(s.rating || 0) !== rating || Number(s.reviewsCount || 0) !== count) {
            salonChanged += 1;
            console.log(`  Salon "${s.name}": ${s.rating || 0} (${s.reviewsCount || 0}) → ${rating} (${count})`);
            if (apply) await Salon.updateOne({ _id: s._id }, { rating, reviewsCount: count });
        }
    }

    // 4) Staff
    let staffChanged = 0;
    for (const st of await Staff.find().select('name rating reviewCount')) {
        const row = staffMap.get(String(st._id));
        const rating = row ? round1(row.avg) : 0;
        const count = row ? row.count : 0;
        if (Number(st.rating || 0) !== rating || Number(st.reviewCount || 0) !== count) {
            staffChanged += 1;
            console.log(`  Staff "${st.name}": ${st.rating || 0} (${st.reviewCount || 0}) → ${rating} (${count})`);
            if (apply) await Staff.updateOne({ _id: st._id }, { rating, reviewCount: count });
        }
    }

    console.log(`\nSalons to update: ${salonChanged} | Staff to update: ${staffChanged}`);
    console.log(apply ? '✅ Applied.' : 'Dry run only — nothing changed. Run with --apply to save.');
    await mongoose.disconnect();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
