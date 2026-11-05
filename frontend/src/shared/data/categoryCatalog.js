// Shared category catalog + smart autocomplete logic.
// Used by Admin → Categories and Salon Onboarding so both behave exactly the same.

export const CATEGORY_CATALOG = [
  {
    name: 'Hair',
    shortName: 'Hair',
    slug: 'hair',
    gender: 'unisex',
    tags: [
      "Men's Haircut",
      "Women's Haircut",
      "Kids' Haircut",
      'Fringe / Trim',
      'Root Touch-up',
      'Global Color',
      'Highlights',
      'Balayage / Ombre',
      'Hair Spa',
      'Keratin',
      'Smoothening / Rebonding',
      'Scalp Treatment',
      'Blow-dry',
      'Hair Wash + Blow-dry',
      'Curls / Straightening',
      'Party Hairstyle'
    ],
    description: 'Professional haircuts, blow dries, and styling treatments.'
  },
  {
    name: 'Hair Coloring & Treatments',
    shortName: 'Hair Color',
    slug: 'hair-color-treatments',
    gender: 'unisex',
    tags: [
      'Root Touch-up',
      'Global Color',
      'Highlights (per streak/section)',
      'Balayage / Ombre',
      'Hair Spa',
      'Keratin',
      'Smoothening / Rebonding',
      'Scalp Treatment'
    ],
    description: 'Rich vibrant hair coloring, highlights, and specialized keratin treatments.'
  },
  {
    name: "Men's Grooming",
    shortName: "Men's Grooming",
    slug: 'mens-grooming',
    gender: 'men',
    tags: ['Beard Trim', 'Beard Styling / Shaping', 'Clean Shave', 'Haircut + Beard', 'Haircut + Head Massage', "Men's Cleanup", "Men's Facial", 'De-tan'],
    description: "Precision beard sculpting, grooming combos, and men's revitalizing cleanups."
  },
  {
    name: 'Skin & Facial',
    shortName: 'Facials',
    slug: 'skin-facial',
    gender: 'unisex',
    tags: ['Basic Cleanup', 'Fruit / Hydrating Facial', 'Anti-Acne Facial', 'Anti-Ageing / Gold Facial', 'De-tan (face/body)', 'Bleach'],
    description: 'Deep cleansing facials, peels, and brightening skin treatments.'
  },
  {
    name: 'Waxing & Threading',
    shortName: 'Waxing',
    slug: 'waxing-threading',
    gender: 'women',
    tags: ['Full Arms', 'Full Legs', 'Underarms', 'Full Body', 'Eyebrows', 'Upper Lip', 'Full Face'],
    description: 'Gentle waxing, hair removal, and precision threading.'
  },
  {
    name: 'Nails',
    shortName: 'Nails',
    slug: 'nails',
    gender: 'women',
    tags: ['Classic Manicure', 'Classic Pedicure', 'Spa Manicure + Pedicure', 'Gel Polish', 'Nail Extensions', 'Nail Art (per nail / full set)'],
    description: 'Full set acrylic nail extensions, long-lasting gel art and pedi-care.'
  },
  {
    name: 'Spa & Massage',
    shortName: 'Spa',
    slug: 'spa-massage',
    gender: 'unisex',
    tags: ['Head Massage', 'Foot Reflexology', 'Full Body Massage (Swedish / Deep Tissue)', 'Swedish Massage', 'Deep Tissue Massage', 'Body Polishing', 'Aromatherapy Massage', 'Body Spa'],
    description: 'Rejuvenating body massages, head champi, and wellness therapies.'
  },
  {
    name: 'Bridal & Party Makeup',
    shortName: 'Makeup',
    slug: 'bridal-makeup',
    gender: 'women',
    tags: ['Party Makeup', 'Saree Draping', 'Bridal Makeup', 'Engagement / Reception Makeup', 'Pre-bridal Package', 'Eye Makeup', 'HD Makeup'],
    description: 'Exquisite bridal makeovers, saree draping, party glam, and pre-wedding beauty rituals.'
  },
  {
    name: 'Packages & Combos',
    shortName: 'Packages',
    slug: 'curated-packages',
    gender: 'unisex',
    tags: ['Groom Package', 'Bridal Glow Package', 'Monthly Grooming Pass', 'Pamper Day Combo', 'Bridal Package', 'Pre-bridal Package', 'Full Body Polishing Combo'],
    description: 'DrimStyle-curated value packages and full-body combo rituals.'
  },
  {
    name: 'Beard & Shave Lounge',
    shortName: 'Beard Care',
    slug: 'beard-shave',
    gender: 'men',
    tags: ['Beard Shape & Trim', 'Royal Shave', 'Beard Spa', 'Mustache Styling'],
    description: 'Precision beard shaping, hot towel shaves, and grooming.'
  }
];

// Catalog + DB categories merged. A DB category with the same name overrides the catalog
// entry (DB is the source of truth); other DB categories are appended.
export const mergeCatalogWithDb = (dbCategories = []) => {
  const combined = [...CATEGORY_CATALOG];
  dbCategories.forEach((cat) => {
    if (!cat.name) return;
    const dbTags = Array.isArray(cat.serviceCategories) ? cat.serviceCategories : [];
    const idx = combined.findIndex((c) => c.name.toLowerCase() === cat.name.trim().toLowerCase());
    if (idx >= 0) {
      const base = combined[idx];
      combined[idx] = {
        ...base,
        shortName: cat.shortName || base.shortName,
        slug: cat.slug || base.slug,
        gender: cat.gender || base.gender,
        tags: dbTags.length ? dbTags : base.tags,
        description: cat.description || base.description,
        fromDb: true
      };
    } else {
      combined.push({
        name: cat.name,
        shortName: cat.shortName || cat.name,
        slug: cat.slug,
        gender: cat.gender || 'unisex',
        tags: dbTags,
        description: cat.description || '',
        fromDb: true
      });
    }
  });
  return combined;
};

// Smart autocomplete: matches category name, short name, tags, description and individual words.
export const getCategorySuggestions = (query, dbCategories = []) => {
  const rawQuery = (query || '').trim().toLowerCase();
  if (!rawQuery) {
    return mergeCatalogWithDb(dbCategories).slice(0, 8);
  }

  const queryTokens = rawQuery.split(/[\s-]+/).filter(Boolean);

  return mergeCatalogWithDb(dbCategories)
    .filter((item) => {
      const catName = (item.name || '').toLowerCase();
      const short = (item.shortName || '').toLowerCase();
      const tags = (item.tags || []).map((t) => t.toLowerCase());
      const desc = (item.description || '').toLowerCase();

      if (catName.includes(rawQuery) || short.includes(rawQuery)) return true;
      if (tags.some((t) => t.includes(rawQuery) || rawQuery.includes(t))) return true;

      return queryTokens.some((tok) =>
        catName.includes(tok) || tags.some((t) => t.includes(tok)) || desc.includes(tok)
      );
    })
    .slice(0, 6);
};

// Exact match by name / short name / slug (case-insensitive) across catalog + DB.
export const findCategoryByName = (value, dbCategories = []) => {
  const v = (value || '').trim().toLowerCase();
  if (!v) return null;
  return (
    mergeCatalogWithDb(dbCategories).find(
      (c) =>
        c.name?.trim().toLowerCase() === v ||
        c.shortName?.trim().toLowerCase() === v ||
        c.slug?.toLowerCase() === v
    ) || null
  );
};
