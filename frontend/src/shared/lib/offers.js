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

// Offer has a different % per weekday (e.g. weekdays 30%, weekend 10%)
export const isDayWiseOffer = (offer) =>
  !!offer?.dayDiscounts && DAY_KEYS.some((k) => offer.dayDiscounts[k] != null);

// Discount % of an offer on a date's weekday. Day-wise offers use that day's own value;
// others use discountPercent on their applicable days. (Same rule as backend utils/offerPricing.js)
export const offerPercentOn = (offer, now = new Date()) => {
  if (!offer) return 0;
  const day = DAY_KEYS[now.getDay()];
  if (isDayWiseOffer(offer)) return Number(offer.dayDiscounts[day]) || 0;
  const days = Array.isArray(offer.applicableDays) ? offer.applicableDays.map((d) => String(d).slice(0, 3)) : [];
  if (days.length && !days.includes(day)) return 0;
  return Number(offer.discountPercent) || 0;
};

// Active, approved, not expired, and has a discount on today's weekday
export const isOfferLiveNow = (offer, now = new Date()) => {
  if (!offer || offer.isActive === false) return false;
  if (offer.approvalStatus && offer.approvalStatus !== 'approved') return false;
  if (offer.validTill && String(offer.validTill).slice(0, 10) < localDateStr(now)) return false;
  return offerPercentOn(offer, now) > 0;
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

export const discountAmountFor = (offer, basePrice, now = new Date()) => {
  const price = Number(basePrice) || 0;
  let amt = Math.round((price * offerPercentOn(offer, now)) / 100);
  if (Number(offer.maxDiscount) > 0) amt = Math.min(amt, Number(offer.maxDiscount));
  return Math.max(0, Math.min(amt, price));
};

// Offer discount is split: half off the price now, half to the customer's wallet after the service
// is completed (cancel / no-show → no wallet part). Same rule as backend utils/offerPricing.js.
export const OFFER_INSTANT_SHARE = 0.5;
export const splitOfferDiscount = (total) => {
  const instant = Math.round((Number(total) || 0) * OFFER_INSTANT_SHARE);
  return { instant, wallet: (Number(total) || 0) - instant };
};

// Best live offer for a service at a salon →
// { offer, basePrice, finalPrice, savings (off now), offerCashback (to wallet), totalDiscount, label } | null
export const getBestOfferForService = (service, salonId, offers = [], now = new Date()) => {
  const basePrice = Number(service?.basePrice ?? service?.price) || 0;
  if (!basePrice) return null;
  let best = null;
  for (const offer of offers || []) {
    if (!isOfferLiveNow(offer, now) || !offerAppliesToSalon(offer, salonId) || !offerMatchesService(offer, service)) continue;
    const total = discountAmountFor(offer, basePrice, now);
    if (total > 0 && (!best || total > best.totalDiscount)) {
      const { instant, wallet } = splitOfferDiscount(total);
      best = {
        offer,
        basePrice,
        finalPrice: basePrice - instant,
        savings: instant,
        offerCashback: wallet,
        totalDiscount: total,
        label: `${offerPercentOn(offer, now)}% OFF`
      };
    }
  }
  return best;
};

// Live offers visible on one salon's page
export const liveOffersForSalon = (salonId, offers = [], now = new Date()) =>
  (offers || []).filter((o) => isOfferLiveNow(o, now) && offerAppliesToSalon(o, salonId));

// "Mon–Fri 30% • Sat–Sun 10%" for day-wise offers ('' otherwise). Consecutive days with the same % are grouped.
const WEEK_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const dayWiseText = (offer) => {
  if (!isDayWiseOffer(offer)) return '';
  const parts = [];
  let i = 0;
  while (i < WEEK_ORDER.length) {
    const pct = Number(offer.dayDiscounts[WEEK_ORDER[i]]) || 0;
    let j = i;
    while (j + 1 < WEEK_ORDER.length && (Number(offer.dayDiscounts[WEEK_ORDER[j + 1]]) || 0) === pct) j += 1;
    if (pct > 0) parts.push(`${WEEK_ORDER[i]}${j > i ? `–${WEEK_ORDER[j]}` : ''} ${pct}%`);
    i = j + 1;
  }
  return parts.join(' • ');
};

// Human text: "20% OFF on Head Massage, Foot Reflexology" / "on Spa & Massage" / "on all services"
export const offerScopeText = (offer) => {
  const subs = (offer?.subcategories || []).filter((s) => norm(s) !== norm(offer?.category));
  if (subs.length) return subs.join(', ');
  return offer?.category || 'all services';
};
