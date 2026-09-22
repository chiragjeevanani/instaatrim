// Curated Advertisements & Brand Marketing Campaigns Data
export const TOP_ADVERTISEMENTS = [
  {
    id: 'ad-loreal-revitalift',
    brand: "L'Oréal Paris",
    sponsorBadge: 'Official Brand Partner',
    title: 'Parisian Glow &\nHyaluronic Care',
    subtitle: 'Exclusive Salon Collaboration',
    description: 'Book any facial with verified salons and receive a complimentary Revitalift Serum session.',
    discountBadge: 'Flat ₹400 OFF',
    couponCode: 'LOREAL400',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    accentColor: 'from-[#78233f] to-[#4a1224]',
    ctaText: 'Claim Deal',
    salonId: 'sal-1',
    category: 'facial',
    validTill: 'Limited Time Offer'
  },
  {
    id: 'ad-dyson-supersonic',
    brand: 'Dyson Professional',
    sponsorBadge: 'Sponsored • Technology Partner',
    title: 'Precision Styling &\nDamage-Free Blowout',
    subtitle: 'Airwrap & Supersonic Lounge',
    description: 'Experience intelligent heat control styling at certified Dyson Partner Salons near you.',
    discountBadge: 'Free Hair Spa Upgrade',
    couponCode: 'DYSONPRO',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    accentColor: 'from-[#1a1a2e] to-[#16213e]',
    ctaText: 'Book Salon',
    salonId: 'sal-2',
    category: 'hair',
    validTill: 'Valid all weekdays'
  },
  {
    id: 'ad-o3-bridal',
    brand: 'O3+ Professional',
    sponsorBadge: 'Festive Sponsor',
    title: 'Pre-Bridal D-Tan &\nCellular Glow Ritual',
    subtitle: 'Gold & Diamond Infusion',
    description: 'Formulated with active oxygen micro-bubbles for luminous party-ready radiance.',
    discountBadge: 'Up to 35% OFF',
    couponCode: 'O3BRIDAL',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    accentColor: 'from-[#8b5a2b] to-[#5c3a1e]',
    ctaText: 'Explore Packages',
    salonId: 'sal-1',
    category: 'facial',
    validTill: 'This weekend only'
  },
  {
    id: 'ad-forest-essentials',
    brand: 'Forest Essentials',
    sponsorBadge: 'Ayurvedic Wellness',
    title: 'Pure Mogra &\nKashmiri Saffron Spa',
    subtitle: 'Cold-Pressed Botanical Elixir',
    description: 'Deep restorative tissue detox and therapeutic aromatherapy massage packages.',
    discountBadge: 'Free Organic Body Polish',
    couponCode: 'FORESTGLOW',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    accentColor: 'from-[#2e4a3d] to-[#1b2e25]',
    ctaText: 'Book Wellness',
    salonId: 'sal-3',
    category: 'spa',
    validTill: 'Exclusive slots'
  }
];

export const BRAND_PARTNERS = [
  {
    id: 'bp-loreal',
    name: "L'Oréal",
    fullName: "L'Oréal Paris",
    couponCode: 'LOREAL400',
    tagline: 'Paris Hair & Skin',
    offer: '40% OFF',
    logo: '💎',
    accent: 'bg-rose-50 text-rose-800 border-rose-200',
    description: 'Certified salons using genuine L\'Oréal Paris Revitalift, Mythic Oil & Majirel formulations.'
  },
  {
    id: 'bp-dyson',
    name: 'Dyson',
    fullName: 'Dyson Professional',
    couponCode: 'DYSONPRO',
    tagline: 'Pro Styling Kit',
    offer: 'Free Scan',
    logo: '✨',
    accent: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    description: 'Styling lounges powered by genuine Dyson Supersonic & Airwrap intelligent heat control tools.'
  },
  {
    id: 'bp-o3',
    name: 'O3+ Pro',
    fullName: 'O3+ Professional',
    couponCode: 'O3BRIDAL',
    tagline: 'Dermat Tested',
    offer: '30% OFF',
    logo: '🌟',
    accent: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'Dermatologist-recommended clinical facial & pre-bridal brighteners.'
  },
  {
    id: 'bp-forest',
    name: 'Forest Essentials',
    fullName: 'Forest Essentials',
    couponCode: 'FORESTGLOW',
    tagline: 'Ayurvedic Luxury',
    offer: 'Free Body Mist',
    logo: '🌿',
    accent: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description: 'Cold-pressed Ayurvedic elixirs, pure saffron & wild rose therapeutic rituals.'
  },
  {
    id: 'bp-lakme',
    name: 'Lakmé',
    fullName: 'Lakmé Salon',
    couponCode: 'CARNIVAL50',
    tagline: 'Absolute Runway',
    offer: 'Buy 1 Get 1',
    logo: '💄',
    accent: 'bg-pink-50 text-pink-800 border-pink-200',
    description: 'Runway beauty aesthetics with Lakmé Absolute Vitamin C+ skin therapy.'
  },
  {
    id: 'bp-wella',
    name: 'Wella',
    fullName: 'Wella Professionals',
    couponCode: 'WELLAPRO',
    tagline: 'Color Motion+',
    offer: 'Free Gloss Kit',
    logo: '💇',
    accent: 'bg-stone-100 text-stone-900 border-stone-300',
    description: 'SP LuxeOil and Color Motion+ hair restoration by certified senior stylists.'
  },
  {
    id: 'bp-beardo',
    name: 'Beardo',
    fullName: 'Beardo Barbershop Pro',
    couponCode: 'BEARDO50',
    tagline: 'Precision Beard Care',
    offer: 'Flat ₹150 OFF',
    logo: '🧔',
    accent: 'bg-amber-50 text-amber-900 border-amber-300',
    description: 'Certified barbershops utilizing Godfather hemp & argan beard sculpting kits.'
  }
];


export const MID_PAGE_CAMPAIGN = {
  id: 'mid-ad-beauty-pass',
  badge: 'Sponsored Campaign',
  title: 'InstaaTrim Gold Glow Carnival',
  subtitle: 'Co-sponsored by Lakmé & O3+ Pro',
  highlight: 'Book 2 Services • Get Free De-Tan',
  coupon: 'CARNIVAL50',
  ctaText: 'Claim Pass',
  bannerImage: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80'
};

