// Home "Trending Near You" / "Featured Service Packages": one card per service (e.g. "Full Arms"),
// even when several salons offer it. Booking then asks the customer to choose the salon.
const norm = (v) => String(v || '').trim().toLowerCase();

// Price the customer sees on the card / in the salon list (offer applied, same as cart & salon page)
export const displayPriceOf = (s) =>
  s.offerDeal ? s.offerDeal.basePrice - s.offerDeal.totalDiscount : Number(s.price) || 0;

// services (already filtered & mapped, keeps their order) → groups
// group = cheapest option's fields + { groupKey, options: [services, cheapest first], salonCount }
export const groupBySalonChoice = (services = []) => {
  const map = new Map();
  services.forEach((s) => {
    const key = `${norm(s.name || s.title)}|${norm(s.category)}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  });
  return [...map.entries()].map(([groupKey, list]) => {
    const options = [...list].sort((a, b) => displayPriceOf(a) - displayPriceOf(b));
    const label = String(list[0].name || list[0].title || '').trim(); // name as first listed (clean casing)
    return {
      ...options[0],
      name: label || options[0].name,
      title: label || options[0].title,
      groupKey,
      options,
      salonCount: new Set(options.map((o) => String(o.salonId))).size
    };
  });
};
