export const PRODUCT_RECOMMENDATIONS = {
  Facial: [
    {
      id: 'pr-loreal-revitalift',
      brand: "L'Oréal Paris",
      tagline: 'Revitalift Hyaluronic Acid Glow Serum Infusion',
      category: 'Facial',
      badge: 'Bestseller',
      accentColor: 'from-rose-500 to-pink-600',
      description: 'Intense hydration + micro-plumping essence for ultra luminous glow'
    },
    {
      id: 'pr-ponds-miracle',
      brand: "Pond's Gold Radiance",
      tagline: 'Age Miracle Deep Cellular Renewal Polish',
      category: 'Facial',
      badge: 'Radiance Boost',
      accentColor: 'from-amber-400 to-yellow-600',
      description: 'Gold micro-particles with CLA complex to revive tired skin'
    },
    {
      id: 'pr-biotique-papaya',
      brand: 'Biotique Botanicals',
      tagline: 'Bio Papaya Tan Removal & Enzyme Exfoliation',
      category: 'Facial',
      badge: '100% Ayurvedic',
      accentColor: 'from-emerald-500 to-teal-600',
      description: 'Pure fruit enzymes to melt away pigmentation and brighten complexions'
    },
    {
      id: 'pr-lakme-vitc',
      brand: 'Lakmé Absolute',
      tagline: 'Vitamin C+ Antioxidant Brightening Complex',
      category: 'Facial',
      badge: 'Salon Grade',
      accentColor: 'from-orange-500 to-amber-600',
      description: 'Kakadu plum extract rich in antioxidants for instant sun damage recovery'
    }
  ],
  Spa: [
    {
      id: 'pr-forest-essentials',
      brand: 'Forest Essentials',
      tagline: 'Madurai Jasmine & Mogra Cold-Pressed Elixir',
      category: 'Spa',
      badge: 'Luxury Ayurvedic',
      accentColor: 'from-purple-600 to-indigo-700',
      description: 'Signature cold-pressed oils enriched with sweet almond and pure herb extracts'
    },
    {
      id: 'pr-kama-ayurveda',
      brand: 'Kama Ayurveda',
      tagline: 'Himalayan Deodar & Cedar Soothing Oil Blend',
      category: 'Spa',
      badge: 'Therapeutic',
      accentColor: 'from-amber-700 to-stone-800',
      description: 'Deep muscle decompression formula sourced directly from Himalayan cedar trees'
    },
    {
      id: 'pr-biotique-algae',
      brand: 'Biotique Bio Seaweed',
      tagline: 'Revitalizing Oceanic Mineral Scrub & Mud Pack',
      category: 'Spa',
      badge: 'Detoxifying',
      accentColor: 'from-cyan-600 to-blue-700',
      description: 'Natural marine algae extract to draw out impurities and relieve fatigue'
    }
  ],
  'Hair Studio': [
    {
      id: 'pr-loreal-prof',
      brand: "L'Oréal Professionnel",
      tagline: 'Absolut Repair Molecular Hair Spa Treatment',
      category: 'Hair Studio',
      badge: 'Salon Pro',
      accentColor: 'from-rose-600 to-red-700',
      description: 'Rebuilds hair molecular structure and restores smoothness from root to tip'
    },
    {
      id: 'pr-wella-system',
      brand: 'Wella Professionals',
      tagline: 'SP LuxeOil Keratin Conditioning Infusion',
      category: 'Hair Studio',
      badge: 'Keratin Care',
      accentColor: 'from-yellow-500 to-amber-700',
      description: 'Argan, Jojoba and Almond luxury oil blend for silky velvet texture'
    },
    {
      id: 'pr-matrix-biolage',
      brand: 'Matrix Biolage',
      tagline: 'Hydrasource Aloe Vera Deep Conditioning Pack',
      category: 'Hair Studio',
      badge: 'Deep Hydration',
      accentColor: 'from-teal-500 to-emerald-700',
      description: 'Optimizes moisture balance for chemically treated or color-styled hair'
    }
  ]
};

export const getRecommendationsForCategories = (categories = []) => {
  const matched = [];
  const addedIds = new Set();

  for (const cat of categories) {
    const list = PRODUCT_RECOMMENDATIONS[cat];
    if (list && list.length > 0) {
      for (const item of list) {
        if (!addedIds.has(item.id)) {
          addedIds.add(item.id);
          matched.push(item);
        }
      }
    }
  }

  // If no category matched directly, provide the top brand partner kits so it is always demonstratable
  if (matched.length === 0) {
    return [
      PRODUCT_RECOMMENDATIONS.Facial[0],
      PRODUCT_RECOMMENDATIONS.Spa[0],
      PRODUCT_RECOMMENDATIONS['Hair Studio'][0],
      PRODUCT_RECOMMENDATIONS.Facial[2]
    ];
  }

  return matched;
};
