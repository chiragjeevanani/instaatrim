// Loads the DrimStyle Master Service Catalog (category → sub-category → services with
// suggested duration & base price) into the DB. Salon "Add / Edit Service" reads it from DB.
//
// - If a category with the same name (or a known alias) exists → its sub-category groups are set
//   and missing service names are added to its tags (serviceCategories). Nothing else is changed.
// - If it does not exist → a new GLOBAL, active category is created.
//
// Dry run (only shows what would change):  node scripts/seedServiceCatalog.js
// Apply:                                   node scripts/seedServiceCatalog.js --apply
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

// Prices are indicative (metro, mid-range) — from DrimStyle_Master_Service_Catalog
const CATALOG = [
    {
        name: 'Hair', aliases: [], gender: 'unisex',
        groups: [
            { name: 'Haircut', services: [["Men's Haircut", 30, 300], ["Women's Haircut", 45, 600], ["Kids' Haircut", 30, 250], ['Fringe / Trim', 15, 150]] },
            { name: 'Hair Color', services: [['Root Touch-up', 60, 1200], ['Global Color', 120, 3000], ['Highlights (per streak/section)', 90, 2500], ['Balayage / Ombre', 180, 6000]] },
            { name: 'Hair Treatments', services: [['Hair Spa', 60, 1200], ['Keratin', 180, 6000], ['Smoothening / Rebonding', 240, 7000], ['Scalp Treatment', 45, 1000]] },
            { name: 'Styling', services: [['Blow-dry', 30, 400], ['Hair Wash + Blow-dry', 40, 500], ['Curls / Straightening', 45, 700], ['Party Hairstyle', 60, 1500]] }
        ]
    },
    {
        name: "Men's Grooming", aliases: ["Men's Hair & Grooming", 'Mens Grooming'], gender: 'men',
        groups: [
            { name: 'Beard', services: [['Beard Trim', 20, 200], ['Beard Styling / Shaping', 30, 300], ['Clean Shave', 20, 200]] },
            { name: 'Combos', services: [['Haircut + Beard', 50, 450], ['Haircut + Head Massage', 45, 450]] },
            { name: 'Skin', services: [["Men's Cleanup", 30, 600], ["Men's Facial", 45, 1000], ['De-tan', 30, 700]] }
        ]
    },
    {
        name: 'Skin & Facial', aliases: ['Facial', 'Skin and Facial'], gender: 'unisex',
        groups: [
            { name: 'Cleanup', services: [['Basic Cleanup', 30, 600]] },
            { name: 'Facial', services: [['Fruit / Hydrating Facial', 60, 1200], ['Anti-Acne Facial', 60, 1800], ['Anti-Ageing / Gold Facial', 75, 2500]] },
            { name: 'Skin Care', services: [['De-tan (face/body)', 30, 800], ['Bleach', 30, 500]] }
        ]
    },
    {
        name: 'Waxing & Threading', aliases: ['Waxing'], gender: 'women',
        groups: [
            { name: 'Waxing', services: [['Full Arms', 30, 400], ['Full Legs', 40, 600], ['Underarms', 15, 150], ['Full Body', 90, 2000]] },
            { name: 'Threading', services: [['Eyebrows', 10, 60], ['Upper Lip', 5, 40], ['Full Face', 25, 250]] }
        ]
    },
    {
        name: 'Nails', aliases: ['Nails, Art & Extensions', 'Nail Art'], gender: 'women',
        groups: [
            { name: 'Manicure / Pedicure', services: [['Classic Manicure', 40, 600], ['Classic Pedicure', 50, 800], ['Spa Manicure + Pedicure', 90, 1800]] },
            { name: 'Nail Art', services: [['Gel Polish', 45, 900], ['Nail Extensions', 90, 2500], ['Nail Art (per nail / full set)', 30, 500]] }
        ]
    },
    {
        name: 'Makeup', aliases: ['Bridal & Party Makeup', 'Bridal & Makeup'], gender: 'women',
        groups: [
            { name: 'Party Makeup', services: [['Party Makeup', 60, 3000], ['Saree Draping', 30, 800]] },
            { name: 'Bridal', services: [['Bridal Makeup', 150, 15000], ['Engagement / Reception Makeup', 120, 8000], ['Pre-bridal Package', null, 12000]] }
        ]
    },
    {
        name: 'Spa & Massage', aliases: ['Spa'], gender: 'unisex',
        groups: [
            { name: 'Massage', services: [['Head Massage', 20, 300], ['Foot Reflexology', 30, 600], ['Full Body Massage (Swedish / Deep Tissue)', 60, 2000]] },
            { name: 'Body Care', services: [['Body Polishing', 60, 2500]] }
        ]
    }
];

const norm = (s) => String(s || '').trim().toLowerCase();
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const uniqueSlug = async (name) => {
    const base = norm(name).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'category';
    let slug = base;
    let i = 1;
    // eslint-disable-next-line no-await-in-loop
    while (await Category.exists({ slug })) { i += 1; slug = `${base}-${i}`; }
    return slug;
};

const run = async ({ apply, uri, quiet } = {}) => {
    const log = quiet ? () => {} : console.log;
    if (uri) await mongoose.connect(uri);
    let updated = 0;
    let created = 0;

    for (const entry of CATALOG) {
        const groups = entry.groups.map((g) => ({
            name: g.name,
            services: g.services.map(([name, duration, price]) => ({ name, duration, price }))
        }));
        const serviceNames = groups.flatMap((g) => g.services.map((s) => s.name));

        // Prefer a GLOBAL category with the same name / alias
        const names = [entry.name, ...entry.aliases];
        const nameFilter = { $or: names.map((n) => ({ name: { $regex: `^${escapeRegex(n)}$`, $options: 'i' } })) };
        const existing = (await Category.findOne({ ...nameFilter, salonId: null })) // global first
            || (await Category.findOne(nameFilter));

        if (existing) {
            const tags = existing.serviceCategories || [];
            const lower = tags.map(norm);
            const missing = serviceNames.filter((n) => !lower.includes(norm(n)));
            updated += 1;
            log(`  ~ "${existing.name}": ${groups.length} sub-categories, ${serviceNames.length} services${missing.length ? ` (+${missing.length} new tags)` : ''}`);
            if (apply) {
                existing.subcategoryGroups = groups;
                existing.serviceCategories = [...tags, ...missing];
                await existing.save();
            }
        } else {
            created += 1;
            log(`  + new category "${entry.name}" (global): ${groups.length} sub-categories, ${serviceNames.length} services`);
            if (apply) {
                await Category.create({
                    name: entry.name,
                    shortName: entry.name,
                    slug: await uniqueSlug(entry.name),
                    gender: entry.gender,
                    serviceCategories: serviceNames,
                    subcategoryGroups: groups,
                    salonId: null,
                    salonName: 'All Salons (Global)',
                    isActive: true
                });
            }
        }
    }

    log(`\nCategories to update: ${updated} | to create: ${created}`);
    log(apply ? '✅ Applied.' : 'Dry run only — nothing changed. Run with --apply to save.');
    if (uri) await mongoose.disconnect();
    return { updated, created };
};

module.exports = { run, CATALOG };

if (require.main === module) {
    run({ apply: process.argv.includes('--apply'), uri: process.env.MONGODB_URI || process.env.MONGO_URI }).catch((e) => {
        console.error(e);
        process.exit(1);
    });
}
