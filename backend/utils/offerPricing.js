// Server-side copy of the customer app's offer rules (frontend/src/shared/lib/offers.js).
// Used to verify booking prices so a customer cannot send a lower price than allowed.
const Offer = require('../models/Offer');

const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const norm = (v) => String(v || '').trim().toLowerCase();

// Customers are in India — evaluate "today" / weekday in IST, like their phones do
const istNow = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    return { date: `${get('year')}-${get('month')}-${get('day')}`, day: get('weekday') };
};

const isOfferLiveNow = (offer, now = istNow()) => {
    if (!offer || offer.isActive === false) return false;
    if (offer.approvalStatus && offer.approvalStatus !== 'approved') return false;
    if (offer.validTill && String(offer.validTill).slice(0, 10) < now.date) return false;
    const days = (offer.applicableDays || []).map((d) => String(d).slice(0, 3));
    if (days.length && !days.includes(now.day)) return false;
    return Number(offer.discountPercent) > 0;
};

const offerAppliesToSalon = (offer, salonId) => !offer.salonId || String(offer.salonId) === String(salonId);

const offerMatchesService = (offer, service) => {
    const cat = norm(offer.category);
    if (cat && cat !== norm(service.category)) return false;
    const subs = (offer.subcategories || []).map(norm).filter((s) => s && s !== cat);
    if (!subs.length) return true;
    return subs.includes(norm(service.subcategory)) || subs.includes(norm(service.title || service.name));
};

const discountAmountFor = (offer, price) => {
    let amt = Math.round((Number(price) * Number(offer.discountPercent || 0)) / 100);
    if (Number(offer.maxDiscount) > 0) amt = Math.min(amt, Number(offer.maxDiscount));
    return Math.max(0, Math.min(amt, Number(price)));
};

// Live offers that can apply in this salon (own + global)
const loadLiveOffersForSalon = async (salonId) => {
    const all = await Offer.find({ isActive: true, approvalStatus: 'approved', $or: [{ salonId: null }, { salonId }] }).lean();
    const now = istNow();
    return all.filter((o) => isOfferLiveNow(o, now) && offerAppliesToSalon(o, salonId));
};

// Price the customer must pay for one service (best live offer applied)
const priceWithBestOffer = (service, offers) => {
    const base = Number(service.price) || 0;
    let best = 0;
    for (const o of offers) {
        if (!offerMatchesService(o, service)) continue;
        best = Math.max(best, discountAmountFor(o, base));
    }
    return base - best;
};

module.exports = { loadLiveOffersForSalon, priceWithBestOffer, istNow };
