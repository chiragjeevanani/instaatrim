// Customer home page sections ("Trending Near You" / "Featured Service Packages") are driven by
// the admin's Category setting `homeSection` (DB). A service shows in a section only when its
// category is marked for that section AND the category applies to the service's salon
// (category salonId null = all salons, otherwise only that salon).
const norm = (v) => String(v || '').trim().toLowerCase();
const idOf = (v) => (v && typeof v === 'object' ? String(v._id || v.id || '') : String(v || ''));

export const categoriesForHomeSection = (categories = [], section) =>
  (categories || []).filter((c) => c && c.isActive !== false && c.homeSection === section);

export const serviceInHomeSection = (service, sectionCategories = []) =>
  sectionCategories.some(
    (c) =>
      (norm(c.name) === norm(service.category) || (c.shortName && norm(c.shortName) === norm(service.category))) &&
      (!c.salonId || idOf(c.salonId) === String(service.salonId))
  );
