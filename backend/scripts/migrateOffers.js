// One-time: move old offers that were stored INSIDE salon documents (salon.offers[])
// into the new Offer collection (discount rules). Old copies are left untouched.
//
// Dry run:  node scripts/migrateOffers.js
// Apply:    node scripts/migrateOffers.js --apply
require('dotenv').config();
const mongoose = require('mongoose');
const Salon = require('../models/Salon');
const Offer = require('../models/Offer');

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

(async () => {
    const apply = process.argv.includes('--apply');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

    const salons = await Salon.find({ 'offers.0': { $exists: true } }).select('name offers');
    const seen = new Set();
    let toCreate = 0;
    let skipped = 0;

    for (const s of salons) {
        for (const o of s.offers || []) {
            const key = String(o.id || o._id || o.title);
            if (seen.has(key)) continue;
            seen.add(key);

            const pct = Number(o.discountPercent) || parseFloat(o.discount) || 0;
            if (!o.title || pct < 1 || pct > 90) {
                skipped += 1;
                console.log(`  skip "${o.title || '(no title)'}" — no valid discount %`);
                continue;
            }
            const isGlobal = !o.salonId || o.salonId === 'all' || String(o.salonName || '').toLowerCase().includes('all salon');
            const exists = await Offer.findOne({ title: o.title, salonId: isGlobal ? null : s._id });
            if (exists) { skipped += 1; continue; }

            const subs = Array.isArray(o.subcategories) && o.subcategories.length
                ? o.subcategories
                : String(o.subcategory || '').split(',').map((x) => x.trim()).filter(Boolean);

            toCreate += 1;
            console.log(`  + "${o.title}" ${pct}% ${isGlobal ? '(all salons)' : `(${s.name})`}`);
            if (apply) {
                await Offer.create({
                    title: o.title,
                    description: o.description || '',
                    category: o.category || '',
                    subcategories: subs.filter((x) => x.toLowerCase() !== String(o.category || '').toLowerCase()),
                    salonId: isGlobal ? null : s._id,
                    salonName: isGlobal ? 'All Salons (Global Offer)' : s.name,
                    discountPercent: Math.round(pct),
                    applicableDays: Array.isArray(o.applicableDays) && o.applicableDays.length ? o.applicableDays.map((d) => String(d).slice(0, 3)).filter((d) => DAYS.includes(d)) : DAYS,
                    validTill: String(o.validTill || '').slice(0, 10),
                    isActive: o.isActive !== false,
                    approvalStatus: ['pending', 'approved', 'rejected'].includes(o.approvalStatus) ? o.approvalStatus : 'approved',
                    createdBy: 'admin'
                });
            }
        }
    }

    console.log(`\nOffers to move: ${toCreate} | skipped: ${skipped}`);
    console.log(apply ? '✅ Applied.' : 'Dry run only — nothing changed. Run with --apply to save.');
    await mongoose.disconnect();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
