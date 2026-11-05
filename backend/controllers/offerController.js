const mongoose = require('mongoose');
const Offer = require('../models/Offer');
const Salon = require('../models/Salon');

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();

// API shape kept compatible with the existing UI (salonId 'all' for global, `discount` label, `id`)
const toClient = (o) => {
    const d = o.toObject ? o.toObject() : o;
    return {
        ...d,
        id: String(d._id),
        salonId: d.salonId ? String(d.salonId) : 'all',
        discount: `${d.discountPercent}% OFF`,
        subcategory: (d.subcategories || []).join(', ')
    };
};

const todayStr = () => new Date().toISOString().slice(0, 10);

// Validate + normalise admin / salon input
const buildFields = async (body, { forceSalonId } = {}) => {
    const errors = [];
    const out = {};

    if (body.title !== undefined) {
        out.title = clean(body.title);
        if (!out.title) errors.push('Offer name is required');
    }
    if (body.description !== undefined) out.description = clean(body.description).slice(0, 500);
    if (body.category !== undefined) out.category = clean(body.category);
    if (body.subcategories !== undefined) {
        const list = Array.isArray(body.subcategories) ? body.subcategories : String(body.subcategories).split(',');
        out.subcategories = Array.from(new Set(list.map(clean).filter(Boolean)));
    }
    if (body.discountPercent !== undefined) {
        const p = Number(body.discountPercent);
        if (!Number.isFinite(p) || p < 1 || p > 90) errors.push('Discount must be between 1% and 90%');
        out.discountPercent = Math.round(p);
    }
    if (body.maxDiscount !== undefined) out.maxDiscount = Math.max(0, Number(body.maxDiscount) || 0);
    if (body.applicableDays !== undefined) {
        const days = (Array.isArray(body.applicableDays) ? body.applicableDays : []).map((d) => String(d).slice(0, 3)).filter((d) => DAYS.includes(d));
        out.applicableDays = days.length ? days : DAYS;
    }
    if (body.validTill !== undefined) {
        const v = String(body.validTill || '').slice(0, 10);
        if (v && !/^\d{4}-\d{2}-\d{2}$/.test(v)) errors.push('Invalid valid-till date');
        out.validTill = v;
    }
    if (body.isActive !== undefined) out.isActive = !!body.isActive;

    const rawSalon = forceSalonId !== undefined ? forceSalonId : body.salonId;
    if (rawSalon !== undefined) {
        if (!rawSalon || rawSalon === 'all') {
            out.salonId = null;
            out.salonName = 'All Salons (Global Offer)';
        } else if (!mongoose.Types.ObjectId.isValid(String(rawSalon))) {
            errors.push('Invalid salon');
        } else {
            const salon = await Salon.findById(rawSalon).select('name');
            if (!salon) errors.push('Salon not found');
            else {
                out.salonId = salon._id;
                out.salonName = salon.name;
            }
        }
    }
    return { out, errors };
};

// ── Public: live offers (customer app). ?salonId= → that salon's + global offers ──
exports.listLiveOffers = async (req, res) => {
    try {
        const filter = { isActive: true, approvalStatus: 'approved', $or: [{ validTill: '' }, { validTill: { $gte: todayStr() } }] };
        if (req.query.salonId && mongoose.Types.ObjectId.isValid(req.query.salonId)) {
            filter.salonId = { $in: [null, new mongoose.Types.ObjectId(req.query.salonId)] };
        }
        const list = await Offer.find(filter).sort({ discountPercent: -1, createdAt: -1 });
        res.json({ success: true, data: list.map(toClient) });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ── Admin: every offer (any status) ──
exports.listAllOffers = async (req, res) => {
    try {
        const list = await Offer.find().sort({ createdAt: -1 });
        res.json({ success: true, data: list.map(toClient) });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ── Salon: its own offers + global ones ──
exports.listMyOffers = async (req, res) => {
    try {
        if (!req.salon) return res.status(403).json({ success: false, message: 'Salon partners only' });
        const list = await Offer.find({ salonId: { $in: [null, req.salon._id] } }).sort({ createdAt: -1 });
        res.json({ success: true, data: list.map(toClient) });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ── Admin creates (approved immediately) / Salon proposes (pending admin approval) ──
exports.createOffer = async (req, res) => {
    try {
        const isSalon = !!req.salon;
        const { out, errors } = await buildFields(
            {
                ...req.body,
                title: req.body.title ?? '',
                // accepts 25 or "25% OFF"
                discountPercent: Number(req.body.discountPercent) || parseFloat(req.body.discount) || 0
            },
            isSalon ? { forceSalonId: String(req.salon._id) } : {}
        );
        if (errors.length) return res.status(400).json({ success: false, message: errors.join('. ') });

        const offer = await Offer.create({
            ...out,
            createdBy: isSalon ? 'salon' : 'admin',
            approvalStatus: isSalon ? 'pending' : 'approved'
        });
        res.status(201).json({ success: true, data: toClient(offer) });
    } catch (e) {
        console.error('createOffer error:', e);
        res.status(500).json({ success: false, message: e.message || 'Server Error' });
    }
};

// ── Admin: edit ──
exports.updateOffer = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid offer ID' });
        const body = { ...req.body };
        if (body.discountPercent === undefined && body.discount !== undefined) body.discountPercent = parseFloat(body.discount);
        const { out, errors } = await buildFields(body);
        if (errors.length) return res.status(400).json({ success: false, message: errors.join('. ') });
        if (body.approvalStatus && ['pending', 'approved', 'rejected'].includes(body.approvalStatus)) out.approvalStatus = body.approvalStatus;
        if (body.rejectionReason !== undefined) out.rejectionReason = clean(body.rejectionReason);

        const offer = await Offer.findByIdAndUpdate(req.params.id, out, { new: true, runValidators: true });
        if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
        res.json({ success: true, data: toClient(offer) });
    } catch (e) {
        console.error('updateOffer error:', e);
        res.status(500).json({ success: false, message: e.message || 'Server Error' });
    }
};

// ── Salon: pause / resume an offer of its own salon (admin may toggle any) ──
exports.toggleOffer = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid offer ID' });
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
        if (req.salon && (!offer.salonId || String(offer.salonId) !== String(req.salon._id))) {
            return res.status(403).json({ success: false, message: 'Platform-wide offers can only be changed by DrimStyle admin.' });
        }
        offer.isActive = !!req.body.isActive;
        await offer.save();
        res.json({ success: true, data: toClient(offer) });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ── Admin: approve / reject ──
exports.setOfferStatus = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid offer ID' });
        const status = req.body.approvalStatus;
        if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
        const patch = {
            approvalStatus: status,
            isActive: status === 'approved',
            rejectionReason: status === 'rejected' ? clean(req.body.rejectionReason) || 'Rejected by administrator' : ''
        };
        const offer = await Offer.findByIdAndUpdate(req.params.id, patch, { new: true });
        if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
        res.json({ success: true, data: toClient(offer) });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ── Admin: delete ──
exports.deleteOffer = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid offer ID' });
        const offer = await Offer.findByIdAndDelete(req.params.id);
        if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
        res.json({ success: true, data: toClient(offer) });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
