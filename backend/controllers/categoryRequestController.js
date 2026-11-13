const mongoose = require('mongoose');
const CategoryRequest = require('../models/CategoryRequest');
const Category = require('../models/Category');
const Salon = require('../models/Salon');
const Notification = require('../models/Notification');

const norm = (s) => String(s || '').trim().toLowerCase();
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cleanName = (s) => String(s || '').replace(/\s+/g, ' ').trim();

const parseTags = (tags) => {
    const list = Array.isArray(tags) ? tags : String(tags || '').split(',');
    const seen = new Set();
    return list
        .map(cleanName)
        .filter((t) => t && t.length <= 80 && !seen.has(norm(t)) && seen.add(norm(t)));
};

const getIO = () => {
    try { return require('../socket').getIO(); } catch { return null; }
};

// Tell the salon in real time (socket + in-app notification + push)
const notifySalon = async (request, title, message) => {
    try {
        await Notification.create({
            title,
            message,
            audience: 'salon',
            audienceId: String(request.salonId),
            type: 'category_request',
            link: '/salon/services/new'
        });
    } catch (e) {
        console.error('[CategoryRequest] notification save failed:', e.message);
    }

    const io = getIO();
    if (io) {
        io.emit('category_request_updated', {
            salonId: String(request.salonId),
            requestId: String(request._id),
            status: request.status,
            type: request.type,
            requestedName: request.requestedName,
            categoryName: request.categoryName,
            adminNote: request.adminNote,
            title,
            message
        });
    }

    try {
        const { sendPushNotification } = require('../config/firebase');
        const salon = await Salon.findById(request.salonId).select('fcmtoken fcmtokenweb');
        const tokens = [salon?.fcmtokenweb, salon?.fcmtoken].filter(Boolean);
        for (const t of tokens) {
            await sendPushNotification(t, title, message, {
                type: 'CATEGORY_REQUEST',
                status: request.status,
                salonId: String(request.salonId)
            });
        }
    } catch (e) {
        console.error('[CategoryRequest] push failed:', e.message);
    }
};

const uniqueSlug = async (name) => {
    let base = norm(name).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'category';
    let candidate = base;
    let i = 1;
    // eslint-disable-next-line no-await-in-loop
    while (await Category.exists({ slug: candidate })) {
        i += 1;
        candidate = `${base}-${i}`;
    }
    return candidate;
};

// Category visible to this salon (global or assigned to it) with this exact name
const findVisibleCategoryByName = (name, salonId) =>
    Category.findOne({
        name: { $regex: `^${escapeRegex(cleanName(name))}$`, $options: 'i' },
        $or: [{ salonId: null }, { salonId: { $exists: false } }, { salonId }]
    });

// ── Salon: create a request ──
exports.createRequest = async (req, res) => {
    try {
        if (!req.salon) {
            return res.status(403).json({ success: false, message: 'Only salon partners can send category requests.' });
        }
        const salonId = req.salon._id;
        const type = req.body.type === 'category' ? 'category' : 'subcategory';
        const requestedName = cleanName(req.body.requestedName);
        const note = cleanName(req.body.note).slice(0, 300);
        const gender = ['men', 'women', 'unisex'].includes(req.body.gender) ? req.body.gender : 'unisex';

        if (requestedName.length < 2 || requestedName.length > 60) {
            return res.status(400).json({ success: false, message: 'Name must be 2–60 characters.' });
        }

        let categoryId = null;
        let categoryName = '';
        let tags = [];

        if (type === 'subcategory') {
            if (!mongoose.Types.ObjectId.isValid(req.body.categoryId)) {
                return res.status(400).json({ success: false, message: 'Please choose the category for this sub-category.' });
            }
            const cat = await Category.findById(req.body.categoryId);
            const visible = cat && (!cat.salonId || String(cat.salonId) === String(salonId));
            if (!visible) {
                return res.status(404).json({ success: false, message: 'Category not found.' });
            }
            if ((cat.serviceCategories || []).some((t) => norm(t) === norm(requestedName))) {
                return res.status(409).json({ success: false, message: `"${requestedName}" already exists in ${cat.name}. You can select it directly.` });
            }
            const inGroups = (cat.subcategoryGroups || []).some((g) => (g.services || []).some((sv) => norm(sv.name) === norm(requestedName)));
            if (inGroups) {
                return res.status(409).json({ success: false, message: `"${requestedName}" already exists in ${cat.name}. You can select it directly.` });
            }
            categoryId = cat._id;
            categoryName = cat.name;
        } else {
            const existing = await findVisibleCategoryByName(requestedName, salonId);
            if (existing) {
                return res.status(409).json({ success: false, message: `Category "${existing.name}" already exists. You can select it directly.` });
            }
            tags = parseTags(req.body.tags).slice(0, 30);
        }

        const duplicate = await CategoryRequest.findOne({
            salonId,
            type,
            status: 'pending',
            categoryId,
            requestedName: { $regex: `^${escapeRegex(requestedName)}$`, $options: 'i' }
        });
        if (duplicate) {
            return res.status(409).json({ success: false, message: 'You already have a pending request for this. Admin will review it soon.' });
        }

        const salonDoc = await Salon.findById(salonId).select('name');
        const request = await CategoryRequest.create({
            salonId,
            salonName: salonDoc?.name || '',
            type,
            categoryId,
            categoryName,
            requestedName,
            // missing service: sub-category + suggested time & price (optional)
            groupName: type === 'subcategory' ? cleanName(req.body.groupName).slice(0, 60) : '',
            duration: type === 'subcategory' && Number(req.body.duration) > 0 ? Math.min(720, Math.round(Number(req.body.duration))) : null,
            price: type === 'subcategory' && Number(req.body.price) > 0 ? Math.round(Number(req.body.price)) : 0,
            tags,
            gender,
            note
        });

        const io = getIO();
        if (io) io.emit('category_request_created', { requestId: String(request._id), salonName: request.salonName, requestedName });

        res.status(201).json({ success: true, data: request });
    } catch (error) {
        console.error('createRequest error:', error);
        res.status(500).json({ success: false, message: 'Could not send request. Please try again.' });
    }
};

// ── Salon: my requests ──
exports.getMyRequests = async (req, res) => {
    try {
        if (!req.salon) {
            return res.status(403).json({ success: false, message: 'Only salon partners can view their requests.' });
        }
        const list = await CategoryRequest.find({ salonId: req.salon._id }).sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, data: list });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ── Admin: list requests ──
exports.getAllRequests = async (req, res) => {
    try {
        const filter = {};
        if (['pending', 'approved', 'rejected'].includes(req.query.status)) filter.status = req.query.status;
        const list = await CategoryRequest.find(filter).sort({ createdAt: -1 }).limit(200);
        res.json({ success: true, data: list });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ── Admin: approve ──
// body (optional): { name, scope: 'global' | 'salon', gender, tags, adminNote }
exports.approveRequest = async (req, res) => {
    try {
        const request = await CategoryRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Request already ${request.status}.` });
        }

        const finalName = cleanName(req.body.name) || request.requestedName;
        let resultCategory;

        if (request.type === 'subcategory') {
            resultCategory = await Category.findById(request.categoryId);
            if (!resultCategory) {
                return res.status(404).json({ success: false, message: 'The target category no longer exists.' });
            }
            const exists = (resultCategory.serviceCategories || []).some((t) => norm(t) === norm(finalName));
            if (!exists) {
                resultCategory.serviceCategories = [...(resultCategory.serviceCategories || []), finalName];
            }
            // Also put it into the sub-category (so it shows in the salon's catalog picker).
            // Category with sub-categories → requested sub-category, or "Other" if none was chosen.
            const groups = (resultCategory.subcategoryGroups || []).map((g) => (g.toObject ? g.toObject() : g));
            const wantedGroup = cleanName(req.body.groupName) || request.groupName || (groups.length ? 'Other' : '');
            if (wantedGroup) {
                let g = groups.find((x) => norm(x.name) === norm(wantedGroup));
                if (!g) {
                    g = { name: wantedGroup, services: [] };
                    groups.push(g);
                }
                if (!(g.services || []).some((sv) => norm(sv.name) === norm(finalName))) {
                    g.services = [...(g.services || []), { name: finalName, duration: request.duration || null, price: request.price || 0 }];
                }
                resultCategory.subcategoryGroups = groups;
                resultCategory.markModified('subcategoryGroups');
            }
            await resultCategory.save();
        } else {
            const scope = req.body.scope === 'salon' ? 'salon' : 'global';
            const tags = parseTags(req.body.tags !== undefined ? req.body.tags : request.tags);
            const gender = ['men', 'women', 'unisex'].includes(req.body.gender) ? req.body.gender : request.gender;

            // Same name already exists (e.g. admin created it meanwhile) → merge tags instead of duplicating
            const existing = await findVisibleCategoryByName(finalName, request.salonId);
            if (existing) {
                const lower = (existing.serviceCategories || []).map(norm);
                existing.serviceCategories = [...(existing.serviceCategories || []), ...tags.filter((t) => !lower.includes(norm(t)))];
                await existing.save();
                resultCategory = existing;
            } else {
                resultCategory = await Category.create({
                    name: finalName,
                    shortName: finalName,
                    slug: await uniqueSlug(finalName),
                    gender,
                    serviceCategories: tags,
                    description: request.note || '',
                    salonId: scope === 'salon' ? request.salonId : null,
                    salonName: scope === 'salon' ? request.salonName || 'Specific Salon' : 'All Salons (Global)',
                    isActive: true
                });
            }
        }

        request.status = 'approved';
        request.adminNote = cleanName(req.body.adminNote).slice(0, 300);
        request.resolvedAt = new Date();
        request.resultCategoryId = resultCategory._id;
        if (finalName !== request.requestedName) request.requestedName = finalName;
        await request.save();

        const what = request.type === 'subcategory'
            ? `"${finalName}" is now available in ${resultCategory.name}`
            : `Category "${resultCategory.name}" is now available`;
        await notifySalon(request, '✅ Category request approved', `${what}. You can add services under it now.`);

        const io = getIO();
        if (io) io.emit('categories_updated', { categoryId: String(resultCategory._id) });

        res.json({ success: true, data: request, category: resultCategory });
    } catch (error) {
        console.error('approveRequest error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

// ── Admin: reject ──
exports.rejectRequest = async (req, res) => {
    try {
        const request = await CategoryRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        if (request.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Request already ${request.status}.` });
        }
        request.status = 'rejected';
        request.adminNote = cleanName(req.body.adminNote).slice(0, 300);
        request.resolvedAt = new Date();
        await request.save();

        await notifySalon(
            request,
            '❌ Category request not approved',
            `"${request.requestedName}" was not approved${request.adminNote ? `: ${request.adminNote}` : '.'}`
        );

        res.json({ success: true, data: request });
    } catch (error) {
        console.error('rejectRequest error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
