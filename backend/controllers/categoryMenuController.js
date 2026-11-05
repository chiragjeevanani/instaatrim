const mongoose = require('mongoose');
const Category = require('../models/Category');
const Salon = require('../models/Salon');
const Service = require('../models/Service');

const norm = (s) => String(s || '').trim().toLowerCase();
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Admin: create a salon's starter menu from a category's sub-categories.
// POST /api/categories/:id/salon-services
// body: { salonId, items: [{ name, price, duration (minutes) }] }
// - Only sub-categories of this category are accepted
// - A service that already exists in the salon (same name + category) is NOT overwritten
//   (the salon may have set its own price) — it is reported as skipped.
exports.addCategoryServicesToSalon = async (req, res) => {
    try {
        const { id } = req.params;
        const { salonId, items } = req.body || {};

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid category ID' });
        }
        if (!mongoose.Types.ObjectId.isValid(salonId)) {
            return res.status(400).json({ success: false, message: 'Please choose a specific salon' });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Select at least one sub-category with a price' });
        }

        const [category, salon] = await Promise.all([Category.findById(id), Salon.findById(salonId).select('_id name')]);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        if (!salon) return res.status(404).json({ success: false, message: 'Salon not found' });

        const allowed = new Map((category.serviceCategories || []).map((t) => [norm(t), String(t).trim()]));

        const created = [];
        const skipped = [];
        const invalid = [];

        for (const raw of items.slice(0, 100)) {
            const tag = allowed.get(norm(raw?.name));
            const price = Number(raw?.price);
            const duration = Math.round(Number(raw?.duration) || 30);

            if (!tag || !Number.isFinite(price) || price <= 0 || duration < 5 || duration > 720) {
                invalid.push(String(raw?.name || ''));
                continue;
            }

            const exists = await Service.findOne({
                salonId: salon._id,
                category: { $regex: `^${escapeRegex(category.name)}$`, $options: 'i' },
                title: { $regex: `^${escapeRegex(tag)}$`, $options: 'i' }
            }).select('_id');
            if (exists) {
                skipped.push(tag);
                continue;
            }

            const svc = await Service.create({
                salonId: salon._id,
                title: tag,
                category: category.name,
                subcategory: tag,
                price,
                originalPrice: price,
                duration,
                description: category.description || '',
                image: category.image || '',
                isActive: true,
                isInstantEligible: true
            });
            created.push(svc);
        }

        res.status(201).json({
            success: true,
            message: `${created.length} service(s) added to ${salon.name}${skipped.length ? `, ${skipped.length} already existed` : ''}`,
            data: { created, skipped, invalid }
        });
    } catch (error) {
        console.error('addCategoryServicesToSalon error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
