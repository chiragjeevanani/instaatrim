// Offer = discount rule from DB. These helpers decide which offer applies to a salon's
// real service and what the customer pays. Used by salon page, cart and checkout so the
// price is identical everywhere.

const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const norm = (v) => String(v || '').trim().toLowerCase();
const idOf = (v) => (v && typeof v === 'object' ? String(v._id || v.id || '') : String(v || ''));

const localDateStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Active, approved, not expired, and valid on today's weekday
export const isOfferLiveNow = (offer, now = new Date()) => {
  if (!offer || offer.isActive === false) return false;
  if (offer.approvalStatus && offer.approvalStatus !== 'approved') return false;
  if (offer.validTill && String(offer.validTill).slice(0, 10) < localDateStr(now)) return false;
  const days = Array.isArray(offer.applicableDays) ? offer.applicableDays.map((d) => String(d).slice(0, 3)) : [];
  if (days.length && !days.includes(DAY_KEYS[now.getDay()])) return false;
  return Number(offer.discountPercent) > 0;
};

// Offer is for this salon (or all salons)
export const offerAppliesToSalon = (offer, salonId) => {
  const sid = idOf(offer?.salonId);
  return !sid || sid === 'all' || sid === idOf(salonId);
};

// Offer covers this service (category, then sub-category / service name)
export const offerMatchesService = (offer, service) => {
  if (!offer || !service) return false;
  const cat = norm(offer.category);
  if (cat && cat !== norm(service.category)) return false;
  const subs = (Array.isArray(offer.subcategories) ? offer.subcategories : [])
    .map(norm)
    .filter((s) => s && s !== cat);
  if (subs.length === 0) return true; // whole category (or every service)
  return subs.includes(norm(service.subcategory)) || subs.includes(norm(service.name || service.title));
};

export const discountAmountFor = (offer, basePrice) => {
  const price = Number(basePrice) || 0;
  let amt = Math.round((price * Number(offer.discountPercent || 0)) / 100);
  if (Number(offer.maxDiscount) > 0) amt = Math.min(amt, Number(offer.maxDiscount));
  return Math.max(0, Math.min(amt, price));
};

// Best live offer for a service at a salon → { offer, basePrice, finalPrice, savings, label } | null
export const getBestOfferForService = (service, salonId, offers = [], now = new Date()) => {
  const basePrice = Number(service?.basePrice ?? service?.price) || 0;
  if (!basePrice) return null;
  let best = null;
  for (const offer of offers || []) {
    if (!isOfferLiveNow(offer, now) || !offerAppliesToSalon(offer, salonId) || !offerMatchesService(offer, service)) continue;
    const savings = discountAmountFor(offer, basePrice);
    if (savings > 0 && (!best || savings > best.savings)) {
      best = { offer, basePrice, finalPrice: basePrice - savings, savings, label: `${offer.discountPercent}% OFF` };
    }
  }
  return best;
};

// Live offers visible on one salon's page
export const liveOffersForSalon = (salonId, offers = [], now = new Date()) =>
  (offers || []).filter((o) => isOfferLiveNow(o, now) && offerAppliesToSalon(o, salonId));

// Human text: "20% OFF on Head Massage, Foot Reflexology" / "on Spa & Massage" / "on all services"
export const offerScopeText = (offer) => {
  const subs = (offer?.subcategories || []).filter((s) => norm(s) !== norm(offer?.category));
  if (subs.length) return subs.join(', ');
  return offer?.category || 'all services';
};
