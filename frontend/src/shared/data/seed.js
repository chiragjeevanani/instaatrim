// Single normalised seed dataset for the whole app.
//
// This replaces two previously-independent sources of truth —
// `modules/customer/data/mockData.js` and the literal arrays at the top of
// `modules/salon/context/SalonContext.jsx` — which held the same salon
// under different shapes and the same booking under two different ID
// schemes. Nothing in the app should import a mock array directly any
// more; everything goes through `shared/services/api.js`, which reads and
// writes this shape.

import { parseDurationToMinutes } from '../lib/time';
import { BOOKING_STATUS } from '../lib/bookingStatus';

// ---------------------------------------------------------------------------
// Taxonomy — Phase 3 fix for category tiles that searched on display labels
// ("Salon for Women") against fields that never contained them. Every
// category now has a stable slug and an explicit list of service-category
// values it maps to, so filtering is a structured lookup, not string
// matching against a title.
// ---------------------------------------------------------------------------
export const CATEGORIES = [
  {
    id: 'cat-hair',
    slug: 'hair',
    name: 'Hair Studio',
    shortName: 'Hair Studio',
    serviceCategories: ['Hair Studio'],
    gender: 'unisex',
    colSpan: 1,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cat-facial',
    slug: 'facial',
    name: 'Facials & Skin',
    shortName: 'Facials',
    serviceCategories: ['Facial'],
    gender: 'unisex',
    colSpan: 2,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cat-spa',
    slug: 'spa',
    name: 'Spa & Wellness',
    shortName: 'Spa',
    serviceCategories: ['Spa'],
    gender: 'unisex',
    colSpan: 1,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cat-waxing',
    slug: 'waxing',
    name: 'Waxing & RICA',
    shortName: 'Waxing',
    serviceCategories: ['Waxing'],
    gender: 'women',
    colSpan: 1,
    image: 'https://images.unsplash.com/photo-1512290900672-1f02e6584285?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cat-body-polishing',
    slug: 'body-polishing',
    name: 'Body Polishing',
    shortName: 'Body Polish',
    serviceCategories: ['Body Polishing'],
    gender: 'unisex',
    colSpan: 1,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cat-makeup',
    slug: 'makeup',
    name: 'Makeup & Styling',
    shortName: 'Makeup & Styling',
    serviceCategories: ['Makeup'],
    gender: 'women',
    colSpan: 1,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cat-manipedi',
    slug: 'mani-pedi',
    name: 'Mani-Pedi',
    shortName: 'Mani-Pedi',
    serviceCategories: ['Mani-Pedi'],
    gender: 'unisex',
    colSpan: 1,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cat-mehandi',
    slug: 'mehandi',
    name: 'Mehandi Art',
    shortName: 'Mehandi Art',
    serviceCategories: ['Mehandi'],
    gender: 'women',
    colSpan: 1,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cat-beard',
    slug: 'beard',
    name: 'Beard Grooming',
    shortName: 'Beard Grooming',
    serviceCategories: ['Beard'],
    gender: 'men',
    colSpan: 1,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cat-grooming',
    slug: 'grooming',
    name: 'Men\'s Grooming',
    shortName: 'Men\'s Grooming',
    serviceCategories: ['Grooming'],
    gender: 'men',
    colSpan: 1,
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80'
  }
];

export const findCategoryBySlug = (slug) => CATEGORIES.find((c) => c.slug === slug);

// ---------------------------------------------------------------------------
// Home hero banners — link through to a real salon + service pair so
// "Book Now" always lands somewhere meaningful.
// ---------------------------------------------------------------------------
export const BANNERS = [
  {
    id: 'b-beard',
    subtitle: 'Precision Beard & Hair Craft',
    title: 'Executive Beard\n& Fade Sculpting',
    desc: 'Hot towel steam prep, straight-razor detailing & beard oil seal',
    ctaText: 'Book Chair',
    tag: 'Men\'s Grooming',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    serviceId: 'srv-beard-1',
    salonId: 'sal-1'
  },
  {
    id: 'b-1',
    subtitle: 'Smoothness You Can Feel',
    title: 'Korean Rice Towel\nBody Polishing',
    desc: 'Inspired by traditional bathhouse exfoliation rituals',
    ctaText: 'Book Now',
    tag: 'Trending Ritual',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDritZYUH3wWaqkvavo6kcFqWBR8YbSIvUYKV-YBRJo8rH1tMeY16TLt53edhR-5vbpC_jQ5pcVDRmop0Ya7L87JrMW41Xx7xOAm_8PXybl3wHwppBJqgvWJCkG7Pg_h6btwEeLQPRQCRMlEeU2MVu2f_dn20QdX6hogxOhBK1m1X8jvxSC5vPEOF4H1HCZonTB1St4pUkQsWdKC_bhQV4awCLT1mqWcGmkl0YO1eCMlZE5DbV9zzkzIA',
    serviceId: 'srv-7',
    salonId: 'sal-1'
  },
  {
    id: 'b-2',
    subtitle: 'Glass Skin Radiance',
    title: 'HydraGlo Deep\nFacial Infusion',
    desc: 'Deep 7-step pore extraction & botanical antioxidant boost',
    ctaText: 'Explore',
    tag: 'Elite Exclusive',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBKOZvsFacJMzTEx78j1kJJGV9xWdwRp3-fNcdJELVxA84BL49qmSzZQFwfF_DwDPSujw7BeLRcD36407W6shCprJc3SSww_wPfLk-c9i22zEkrsXoLx12PYtglXJKNFcLoUe4fTw5sx5jls1407Q8MD3OFTg_bFRv_-WLEWbUHkDje49n770wAyt2dzq-gAFGTR9XgwR3mBKrdOwU3d91eojLJ6B5YQGtJnz0tQ8gtpjEm672xqwnp-w',
    serviceId: 'srv-4',
    salonId: 'sal-1'
  },
  {
    id: 'b-3',
    subtitle: 'Luxury Aromatherapy',
    title: 'Pure Restorative\nRelaxation Spa',
    desc: 'Full body restorative massage with warm essential oils',
    ctaText: 'View Offers',
    tag: '40% Flat OFF',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCI1eXwjP7Q3TbNQwdRp5_XXuFTWcdTW-WZ6OkgsDHGazFAJAGPRuJl_ovbxK3IbzoF0fEbYyuZ_RF0DTJTbX8jRKlJDmIPJFNJprZS1TNyuBjeshScz6lsao4So_cuWvyS292wBNtldqs5q1e6bv-SgQcT5cH3ojThS7lx53dZ1Jz3WOLyx3xgtVnMgs40TwubWvVuU2fnqWo5EzUsM7FKUBZmRjzthtn-RktNjNrH3hJW5V8OSPZ6_Q',
    serviceId: 'srv-5',
    salonId: 'sal-3'
  }
];

// ---------------------------------------------------------------------------
// Salons — merged from customer mockSalons + salon SalonContext.salonProfile.
// Working hours are now structured per-weekday (Phase 2 §7.4 fix) instead of
// one free-text string; `openHoursLegacy` is kept only for display fallback.
// ---------------------------------------------------------------------------
const defaultWeeklyHours = (openClock, closeClock) => ({
  Sunday: { open: openClock, close: closeClock, closed: false },
  Monday: { open: openClock, close: closeClock, closed: false },
  Tuesday: { open: openClock, close: closeClock, closed: false },
  Wednesday: { open: openClock, close: closeClock, closed: false },
  Thursday: { open: openClock, close: closeClock, closed: false },
  Friday: { open: openClock, close: closeClock, closed: false },
  Saturday: { open: openClock, close: closeClock, closed: false }
});

export const SALONS = [
  {
    id: 'sal-1',
    name: 'Luxe Glow Salon & Spa',
    ownerName: 'Shalini Verma',
    mobile: '+91 98765 43210',
    email: 'contact@luxeglow.in',
    tagline: 'Premium Korean Aesthetics & Luxury Wellness',
    category: 'Unisex',
    rating: 4.8,
    reviewsCount: 320,
    lat: 22.7204,
    lng: 75.8721,
    distanceKm: 0.8,
    area: 'South Tukoganj',
    locationCity: 'Indore',
    startingPrice: 299,
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80'
    ],
    offer: '20% OFF on all Korean rituals',
    hasInstantBooking: true,
    isInstantBookingEnabled: true,
    instantWaitMinutes: 15,
    isVerified: true,
    verificationStatus: 'Live',
    isStoreOpen: true,
    openHoursLegacy: '09:30 AM - 08:30 PM',
    weeklyHours: defaultWeeklyHours('09:30 AM', '08:30 PM'),
    breaks: [{ id: 'brk-1-1', day: 'All', label: 'Housekeeping', start: '01:30 PM', end: '02:00 PM' }],
    holidays: [],
    address: 'Plot 14, Opposite Treasure Island, South Tukoganj, Indore, MP',
    phone: '+91 98765 43210',
    amenities: ['AC & Ambient Music', 'Sanitized Kits', 'Beverage Service', 'Valet Parking', 'Card/UPI Accepted'],
    totalChairs: 5,
    occupiedChairs: 2,
    partnerLoginId: 'luxeglow@instaatrim.com',
    partnerPassword: 'demo1234'
  },
  {
    id: 'sal-2',
    name: 'Enrich Glamour Studio',
    ownerName: 'Ritu Chawla',
    mobile: '+91 97555 44321',
    email: 'contact@enrichglamour.in',
    tagline: 'Hair Transformations & Celebrity Styling',
    category: 'Unisex',
    rating: 4.9,
    reviewsCount: 512,
    lat: 22.7278,
    lng: 75.8877,
    distanceKm: 1.4,
    area: 'New Palasia',
    locationCity: 'Indore',
    startingPrice: 499,
    coverImage: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80'
    ],
    offer: 'Flat ₹150 OFF with code ENRICH150',
    hasInstantBooking: true,
    isInstantBookingEnabled: true,
    instantWaitMinutes: 20,
    isVerified: true,
    verificationStatus: 'Live',
    isStoreOpen: true,
    openHoursLegacy: '10:00 AM - 09:00 PM',
    weeklyHours: defaultWeeklyHours('10:00 AM', '09:00 PM'),
    breaks: [],
    holidays: [],
    address: 'Building 7, Near Industry House, New Palasia, Indore',
    phone: '+91 97555 44321',
    amenities: ['Private Cabins', 'Free High-speed Wi-Fi', 'Complimentary Herbal Tea', 'Hygienic Disposable Towels'],
    totalChairs: 3,
    occupiedChairs: 1,
    partnerLoginId: 'enrich@instaatrim.com',
    partnerPassword: 'demo1234'
  },
  {
    id: 'sal-3',
    name: 'Aura Wellness & Spa',
    ownerName: 'Meera Nair',
    mobile: '+91 94250 88990',
    email: 'contact@aurawellness.in',
    tagline: 'Holistic Ayurvedic & Aroma Body Therapies',
    category: 'Unisex',
    rating: 4.7,
    reviewsCount: 240,
    lat: 22.7089,
    lng: 75.8801,
    distanceKm: 2.1,
    area: 'Geeta Bhawan',
    locationCity: 'Indore',
    startingPrice: 399,
    coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'],
    offer: 'Free Scalp Massage on Bookings > ₹1200',
    hasInstantBooking: true,
    isInstantBookingEnabled: false,
    instantWaitMinutes: 15,
    isVerified: true,
    verificationStatus: 'Live',
    isStoreOpen: true,
    openHoursLegacy: '09:00 AM - 08:00 PM',
    weeklyHours: defaultWeeklyHours('09:00 AM', '08:00 PM'),
    breaks: [],
    holidays: [],
    address: 'Near Geeta Bhawan Mandir, AB Road, Indore',
    phone: '+91 94250 88990',
    amenities: ['Steam Room', 'Scented Aromas', 'Ayurvedic Formulations', 'Card / UPI Accepted'],
    totalChairs: 2,
    occupiedChairs: 0,
    partnerLoginId: 'aura@instaatrim.com',
    partnerPassword: 'demo1234'
  },
  {
    id: 'sal-4',
    name: 'The Glam Bar & Nail Studio',
    ownerName: 'Priyanka Oswal',
    mobile: '+91 98930 77123',
    email: 'contact@glambar.in',
    tagline: 'Makeup, Nail Artistry & Men\'s Grooming Studio',
    category: 'Unisex',
    rating: 4.9,
    reviewsCount: 420,
    lat: 22.7515,
    lng: 75.8931,
    distanceKm: 2.8,
    area: 'Vijay Nagar',
    locationCity: 'Indore',
    startingPrice: 599,
    coverImage: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80'],
    offer: 'Flat 20% OFF for Students',
    hasInstantBooking: false,
    isInstantBookingEnabled: false,
    instantWaitMinutes: 15,
    isVerified: true,
    verificationStatus: 'Live',
    isStoreOpen: true,
    openHoursLegacy: '10:30 AM - 09:30 PM',
    weeklyHours: defaultWeeklyHours('10:30 AM', '09:30 PM'),
    breaks: [],
    holidays: [],
    address: 'Malhar Mega Mall Road, Scheme 54, Vijay Nagar, Indore',
    phone: '+91 98930 77123',
    amenities: ['Gel Nail Bar', 'Grooming Lounge', 'Air Conditioned', 'Free Wi-Fi'],
    totalChairs: 3,
    occupiedChairs: 0,
    partnerLoginId: 'glambar@instaatrim.com',
    partnerPassword: 'demo1234'
  },
  {
    id: 'sal-5',
    name: 'Bella Rose Aesthetic Lounge',
    ownerName: 'Kavita Deshmukh',
    mobile: '+91 98260 11223',
    email: 'kavita@bellarose.in',
    tagline: 'Organic Facials, Nail Couture & Botanical Spa',
    category: 'Women Only',
    rating: 5.0,
    reviewsCount: 0,
    lat: 22.7301,
    lng: 75.8904,
    distanceKm: 1.8,
    area: 'Old Palasia',
    locationCity: 'Indore',
    startingPrice: 349,
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'],
    offer: '10% Welcome Partner Offer',
    hasInstantBooking: true,
    isInstantBookingEnabled: true,
    instantWaitMinutes: 15,
    isVerified: false,
    verificationStatus: 'Pending',
    isStoreOpen: false,
    openHoursLegacy: '10:00 AM - 08:30 PM',
    weeklyHours: defaultWeeklyHours('10:00 AM', '08:30 PM'),
    breaks: [],
    holidays: [],
    address: 'Shop 12, Velocity III, Old Palasia, Indore',
    phone: '+91 98260 11223',
    amenities: ['AC & Ambient Music', 'Sanitized Tools', 'Card / UPI Accepted'],
    totalChairs: 3,
    occupiedChairs: 0,
    gstin: '23AABCU9603R1ZM',
    shopActLicense: 'IND-MP-2026-9041',
    bankName: 'HDFC Bank',
    accountNumber: '••••9124',
    ifscCode: 'HDFC0001032',
    commissionRate: '12% Flat',
    partnerLoginId: 'bellarose@instaatrim.com',
    partnerPassword: 'demo1234'
  }
];

// ---------------------------------------------------------------------------
// Staff & Stations — previously only existed as literal strings inside
// booking rows ("Chair 1 (Pooja)"). Now real records so the availability
// engine (Phase 1) and the partner staff/capacity screens (Phase 2) have
// something to schedule against.
// ---------------------------------------------------------------------------
export const STAFF = [
  { id: 'stf-1', salonId: 'sal-1', name: 'Pooja', role: 'Senior Therapist', serviceCategories: ['Waxing', 'Body Polishing'], weeklyHours: defaultWeeklyHours('09:30 AM', '08:30 PM'), leaves: [] },
  { id: 'stf-2', salonId: 'sal-1', name: 'Kavita', role: 'Beautician', serviceCategories: ['Waxing', 'Facial'], weeklyHours: defaultWeeklyHours('09:30 AM', '08:30 PM'), leaves: [] },
  { id: 'stf-3', salonId: 'sal-1', name: 'Meena', role: 'Spa Specialist', serviceCategories: ['Body Polishing', 'Spa'], weeklyHours: defaultWeeklyHours('09:30 AM', '08:30 PM'), leaves: [] },
  { id: 'stf-4', salonId: 'sal-1', name: 'Anjali', role: 'Facial Expert', serviceCategories: ['Facial'], weeklyHours: defaultWeeklyHours('09:30 AM', '08:30 PM'), leaves: [] },
  // Staff rosters were entirely female across every salon — no barber or
  // male grooming specialist anywhere — which read as strongly as the
  // women-only categories did. One added per salon below.
  { id: 'stf-9', salonId: 'sal-1', name: 'Arjun Rathore', role: 'Grooming Specialist', serviceCategories: ['Beard'], weeklyHours: defaultWeeklyHours('09:30 AM', '08:30 PM'), leaves: [] },

  { id: 'stf-5', salonId: 'sal-2', name: 'Ritika', role: 'Hair Stylist', serviceCategories: ['Hair Studio', 'Waxing'], weeklyHours: defaultWeeklyHours('10:00 AM', '09:00 PM'), leaves: [] },
  { id: 'stf-6', salonId: 'sal-2', name: 'Simran', role: 'Nail Technician', serviceCategories: ['Mani-Pedi'], weeklyHours: defaultWeeklyHours('10:00 AM', '09:00 PM'), leaves: [] },
  { id: 'stf-10', salonId: 'sal-2', name: 'Karan Bhatt', role: 'Barber', serviceCategories: ['Grooming'], weeklyHours: defaultWeeklyHours('10:00 AM', '09:00 PM'), leaves: [] },

  { id: 'stf-7', salonId: 'sal-3', name: 'Kajal', role: 'Massage Therapist', serviceCategories: ['Spa'], weeklyHours: defaultWeeklyHours('09:00 AM', '08:00 PM'), leaves: [] },
  { id: 'stf-12', salonId: 'sal-3', name: 'Aditya Verma', role: 'Massage Therapist', serviceCategories: ['Spa'], weeklyHours: defaultWeeklyHours('09:00 AM', '08:00 PM'), leaves: [] },

  { id: 'stf-8', salonId: 'sal-4', name: 'Divya', role: 'Makeup Artist', serviceCategories: ['Makeup', 'Facial'], weeklyHours: defaultWeeklyHours('10:30 AM', '09:30 PM'), leaves: [] },
  { id: 'stf-11', salonId: 'sal-4', name: 'Rohan Kapoor', role: 'Grooming Specialist', serviceCategories: ['Grooming'], weeklyHours: defaultWeeklyHours('10:30 AM', '09:30 PM'), leaves: [] }
];

export const STATIONS = [
  { id: 'stn-1a', salonId: 'sal-1', name: 'Chair 1', staffId: 'stf-1' },
  { id: 'stn-1b', salonId: 'sal-1', name: 'Chair 2', staffId: 'stf-2' },
  { id: 'stn-1c', salonId: 'sal-1', name: 'Chair 3', staffId: 'stf-3' },
  { id: 'stn-1d', salonId: 'sal-1', name: 'Chair 4', staffId: 'stf-4' },
  { id: 'stn-1e', salonId: 'sal-1', name: 'Chair 5', staffId: 'stf-9' },

  { id: 'stn-2a', salonId: 'sal-2', name: 'Chair 1', staffId: 'stf-5' },
  { id: 'stn-2b', salonId: 'sal-2', name: 'Chair 2', staffId: 'stf-6' },
  { id: 'stn-2c', salonId: 'sal-2', name: 'Chair 3', staffId: 'stf-10' },

  { id: 'stn-3a', salonId: 'sal-3', name: 'Chair 1', staffId: 'stf-7' },
  { id: 'stn-3b', salonId: 'sal-3', name: 'Chair 2', staffId: 'stf-12' },

  { id: 'stn-4a', salonId: 'sal-4', name: 'Chair 1', staffId: 'stf-8' },
  { id: 'stn-4b', salonId: 'sal-4', name: 'Chair 2', staffId: 'stf-11' },
  { id: 'stn-4c', salonId: 'sal-4', name: 'Chair 3', staffId: null }
];

// ---------------------------------------------------------------------------
// Services — merged customer per-salon service catalogues with the salon
// panel's initialSalonServices (they overlapped for sal-1; this keeps the
// richer, operationally-flagged version for every salon).
// ---------------------------------------------------------------------------
const svc = (partial) => ({
  isActive: true,
  isInstantEligible: true,
  type: 'service',
  ...partial,
  durationMinutes: parseDurationToMinutes(partial.duration)
});

export const SERVICES = [
  svc({
    id: 'srv-1',
    salonId: 'sal-1',
    name: 'Full Arms + Legs + Underarms Waxing',
    category: 'Waxing',
    description: 'Painless hair removal using soothing Italian RICA formulation.',
    duration: '1 hr 15 mins',
    price: 899,
    originalPrice: 1699,
    image: 'https://images.unsplash.com/photo-1512290900672-1f02e6584285?auto=format&fit=crop&w=400&q=80'
  }),
  svc({
    id: 'srv-2',
    salonId: 'sal-1',
    name: 'Full Body Gentle Exfoliation & RICA Wax',
    category: 'Waxing',
    description: 'Colophony-free Italian Rica wax enriched with soothing aloe vera.',
    duration: '1 hr 5 mins',
    price: 949,
    originalPrice: 1599,
    image: 'https://images.unsplash.com/photo-1512290900672-1f02e6584285?auto=format&fit=crop&w=400&q=80'
  }),
  svc({
    id: 'srv-4',
    salonId: 'sal-1',
    name: 'HydraGlo Pore Extraction & Glow Facial',
    category: 'Facial',
    description: 'Vacuum extraction of impurities followed by deep hyaluronic acid infusion.',
    duration: '1 hr 20 mins',
    price: 1299,
    originalPrice: 2200,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80'
  }),
  svc({
    id: 'srv-7',
    salonId: 'sal-1',
    name: 'Korean Rice Towel Body Glow Polish',
    category: 'Body Polishing',
    description: 'Complete body gentle scrub, dead skin renewal, and cocoa butter nourish.',
    duration: '1 hr 30 mins',
    price: 1599,
    originalPrice: 2799,
    isInstantEligible: false,
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80'
  }),

  svc({
    id: 'srv-3',
    salonId: 'sal-2',
    name: 'Full Arms + Legs Honey Waxing',
    category: 'Waxing',
    description: 'Classic soothing honey wax suitable for sensitive and dry skin.',
    duration: '1 hr 5 mins',
    price: 569,
    originalPrice: 899,
    image: 'https://images.unsplash.com/photo-1512290900672-1f02e6584285?auto=format&fit=crop&w=400&q=80'
  }),
  svc({
    id: 'srv-6',
    salonId: 'sal-2',
    name: 'Deluxe Rose Infusion Manicure & Pedicure',
    category: 'Mani-Pedi',
    description: 'Rose petal foot soak, exfoliating salt rub, cuticle care, and massage.',
    duration: '1 hr 10 mins',
    price: 799,
    originalPrice: 1299,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80'
  }),
  svc({
    id: 'srv-8',
    salonId: 'sal-2',
    name: 'Keratin Hair Spa & Deep Moisture Mask',
    category: 'Hair Studio',
    description: 'Restores dry, frizzy strands with botanical keratin serum and steam.',
    duration: '1 hr',
    price: 899,
    originalPrice: 1499,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'
  }),

  svc({
    id: 'srv-5',
    salonId: 'sal-3',
    name: 'Aromatherapy Relaxing Spa & Head Massage',
    category: 'Spa',
    description: 'Lavender and bergamot essential oils with Swedish therapy strokes.',
    duration: '1 hr 30 mins',
    price: 1499,
    originalPrice: 2499,
    isInstantEligible: false,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80'
  }),

  svc({
    id: 'srv-9',
    salonId: 'sal-4',
    name: 'O3+ Instant Brightening & D-Tan Facial',
    category: 'Facial',
    description: 'Removes stubborn sun tan with botanical lactic acid & milk enzymes.',
    duration: '45 mins',
    price: 649,
    originalPrice: 1099,
    isInstantEligible: false,
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80'
  }),

  // Men's Specific Services
  svc({
    id: 'srv-10',
    salonId: 'sal-1',
    name: 'Classic Beard Trim & Hot Towel Shave',
    category: 'Beard',
    description: 'Precision beard shaping, straight-razor edge work and a hot towel finish.',
    duration: '35 mins',
    price: 349,
    originalPrice: 549,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80'
  }),
  svc({
    id: 'srv-11',
    salonId: 'sal-2',
    name: "Men's Fade Haircut & Beard Sculpting",
    category: 'Grooming',
    description: 'Scissor-and-clipper haircut paired with beard line-up and finishing balm.',
    duration: '50 mins',
    price: 499,
    originalPrice: 799,
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=400&q=80'
  }),
  svc({
    id: 'srv-12',
    salonId: 'sal-4',
    name: "Men's Charcoal Detox & Skin Cleanup",
    category: 'Grooming',
    description: 'Deep-cleanse facial formulated for coarser skin, paired with a beard detox scrub.',
    duration: '40 mins',
    price: 449,
    originalPrice: 749,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=400&q=80'
  }),
  svc({
    id: 'srv-13',
    salonId: 'sal-1',
    name: "Men's Executive Haircut & Styling",
    category: 'Hair Studio',
    description: 'Precision scissor cut, neck taper, and styling with premium matte clay.',
    duration: '45 mins',
    price: 399,
    originalPrice: 650,
    image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=400&q=80'
  }),
  svc({
    id: 'srv-14',
    salonId: 'sal-3',
    name: "Men's Deep Tissue Stress Relief Spa",
    category: 'Spa',
    description: 'Therapeutic acupressure back, neck and shoulder decompression.',
    duration: '60 mins',
    price: 1199,
    originalPrice: 1899,
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80'
  })
];

// ---------------------------------------------------------------------------
// Coupons (platform-level) & Offers (salon-level, non-peak yield deals)
// ---------------------------------------------------------------------------
export const COUPONS = [
  { code: 'ELITE10', discountPercent: 10, maxDiscount: 250, description: '10% OFF for Elite Club Members on all salon services', minOrder: 499, scope: 'platform' },
  { code: 'INSTA50', flatDiscount: 50, description: 'Flat ₹50 OFF on your first booking with InstaaTrim', minOrder: 399, scope: 'platform', firstBookingOnly: true },
  { code: 'KOREAN20', discountPercent: 20, maxDiscount: 400, description: '20% OFF on all Korean Skincare & Waxing treatments', minOrder: 799, scope: 'platform' }
];

export const OFFERS = [
  {
    id: 'off-1',
    salonId: 'sal-1',
    title: 'Happy Hours Non-Peak Special',
    description: 'Fill empty afternoon slots between 1 PM - 4 PM on weekdays.',
    discount: '25% OFF',
    discountType: 'percentage',
    discountValue: 25,
    applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    timeWindow: '01:00 PM - 04:00 PM',
    minOrderValue: 799,
    serviceIds: [],
    customerSegment: 'all',
    validFrom: null,
    validTo: null,
    isActive: true,
    approvalStatus: 'approved',
    redeemedCount: 14
  },
  {
    id: 'off-2',
    salonId: 'sal-1',
    title: 'Weekend Morning Kickoff',
    description: 'Early bird discount for morning appointments before 11:30 AM.',
    discount: '₹150 Flat OFF',
    discountType: 'flat',
    discountValue: 150,
    applicableDays: ['Saturday', 'Sunday'],
    timeWindow: '09:30 AM - 11:30 AM',
    minOrderValue: 999,
    serviceIds: [],
    customerSegment: 'all',
    validFrom: null,
    validTo: null,
    isActive: true,
    approvalStatus: 'approved',
    redeemedCount: 8
  }
];

// ---------------------------------------------------------------------------
// Reviews — previously rendered only inside the salon partner's own profile
// page (customers could write a review but never read one; see SRS §6.5 /
// §10.4 gap). Now a shared collection keyed by salon.
// ---------------------------------------------------------------------------
export const REVIEWS = [
  {
    id: 'rev-1',
    salonId: 'sal-1',
    customerName: 'Ananya Sharma',
    rating: 5,
    date: '2 days ago',
    comment: 'Best hydra facial in South Tukoganj! Extremely hygienic salon and courteous staff.',
    service: 'HydraGlo Pore Extraction Facial',
    reply: 'Thank you Ananya! We are thrilled you enjoyed the Korean glass skin treatment!',
    verifiedBooking: true,
    bookingId: null
  },
  {
    id: 'rev-2',
    salonId: 'sal-1',
    customerName: 'Kritika Roy',
    rating: 5,
    date: '1 week ago',
    comment: 'Super fast instant booking. Arrived in 15 mins and chair was already prepared.',
    service: 'Rica Tin Waxing',
    reply: null,
    verifiedBooking: true,
    bookingId: null
  },
  {
    id: 'rev-3',
    salonId: 'sal-2',
    customerName: 'Rohit Malhotra',
    rating: 4,
    date: '3 days ago',
    comment: 'Loved the keratin spa, hair feels so smooth. Salon could use better parking.',
    service: 'Keratin Hair Spa',
    reply: 'Thanks Rohit, noting the parking feedback for our next partner review!',
    verifiedBooking: true,
    bookingId: null
  },
  {
    id: 'rev-4',
    salonId: 'sal-2',
    customerName: 'Vikram Nair',
    rating: 5,
    date: '5 days ago',
    comment: 'Best beard styling I\'ve had in Indore. Karan really knows his shape-ups.',
    service: 'Men\'s Signature Haircut & Beard Styling',
    reply: 'Thank you Vikram! Karan will be glad to hear that.',
    verifiedBooking: true,
    bookingId: null
  }
];

// ---------------------------------------------------------------------------
// Saved customer addresses
// ---------------------------------------------------------------------------
export const LOCATIONS = [
  {
    id: 'loc-1',
    userId: 'cust-1',
    area: 'South Tukoganj',
    address: 'South Tukoganj, Indore, Madhya Pradesh, 452001, India',
    landmark: 'Corporate House',
    city: 'Indore',
    pincode: '452001',
    lat: 22.7196,
    lng: 75.8577,
    isCurrent: true
  },
  {
    id: 'loc-2',
    userId: 'cust-1',
    area: 'Vijay Nagar',
    address: 'Scheme 54, PU-4, Vijay Nagar, Indore, Madhya Pradesh, 452010',
    landmark: 'Near C21 Mall',
    city: 'Indore',
    pincode: '452010',
    lat: 22.7515,
    lng: 75.8931,
    isCurrent: false
  },
  {
    id: 'loc-3',
    userId: 'cust-1',
    area: 'New Palasia',
    address: '5/1 New Palasia, Janjeerwala Square, Indore, Madhya Pradesh, 452001',
    landmark: 'Industry House',
    city: 'Indore',
    pincode: '452001',
    lat: 22.7278,
    lng: 75.8877,
    isCurrent: false
  }
];

// ---------------------------------------------------------------------------
// Bookings — unified under IT-##### ids and the canonical status vocabulary.
// This merges what were previously two disjoint arrays: the customer app's
// two seed bookings and the salon panel's six seed bookings.
// ---------------------------------------------------------------------------
export const BOOKINGS = [
  {
    id: 'IT-70821',
    customerId: 'cust-1',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 70007 92773',
    salonId: 'sal-1',
    salonName: 'Luxe Glow Salon & Spa',
    address: 'South Tukoganj, Indore',
    bookingMode: 'Scheduled',
    status: BOOKING_STATUS.CONFIRMED,
    dateKey: null, // filled at runtime relative to "today"
    dayOffset: 1,
    time: '11:00 AM',
    stationId: null,
    staffId: null,
    services: [{ id: 'srv-1', name: 'Full Arms + Full Legs + Underarms Korean Wax', price: 899, duration: '1 hr 15 mins' }],
    totalAmount: 899,
    discountAmount: 90,
    finalPaid: 809,
    couponApplied: 'ELITE10',
    paymentMethod: 'UPI (Google Pay)',
    paymentStatus: 'Successful',
    transactionId: 'TXN-88213041',
    createdAt: '2026-09-11 10:15 AM',
    notes: ''
  },
  {
    id: 'IT-41928',
    customerId: 'cust-1',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 70007 92773',
    salonId: 'sal-2',
    salonName: 'Enrich Glamour Studio',
    address: 'New Palasia, Indore',
    bookingMode: 'Instant',
    status: BOOKING_STATUS.COMPLETED,
    dateKey: null,
    dayOffset: -4,
    time: '03:30 PM',
    stationId: 'stn-2a',
    staffId: 'stf-5',
    services: [{ id: 'srv-4', name: 'HydraGlo Pore Extraction & Vitamin C Facial', price: 1299, duration: '1 hr 20 mins' }],
    totalAmount: 1299,
    discountAmount: 50,
    finalPaid: 1249,
    couponApplied: 'INSTA50',
    paymentMethod: 'Pay at Salon',
    paymentStatus: 'Successful',
    transactionId: 'TXN-71029384',
    createdAt: '2026-09-08 03:00 PM',
    notes: '',
    rating: 5,
    review: 'Super relaxing service! Loved the glow after the HydraGlo treatment.'
  },
  {
    id: 'IT-55931',
    customerId: 'cust-1',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 70007 92773',
    salonId: 'sal-4',
    salonName: 'The Glam Bar & Nail Studio',
    address: 'Vijay Nagar, Indore',
    bookingMode: 'Scheduled',
    status: BOOKING_STATUS.PENDING,
    dateKey: null,
    dayOffset: 3,
    time: '4:00 PM',
    stationId: null,
    staffId: null,
    services: [{ id: 'srv-9', name: 'O3+ Instant Brightening & D-Tan Glow Pack', price: 649, duration: '45 mins' }],
    totalAmount: 649,
    discountAmount: 0,
    finalPaid: 649,
    couponApplied: null,
    paymentMethod: 'Pay at Salon',
    paymentStatus: 'Pending',
    transactionId: null,
    createdAt: '2026-09-12 09:40 AM',
    notes: ''
  },
  {
    id: 'IT-30187',
    customerId: 'cust-1',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 70007 92773',
    salonId: 'sal-3',
    salonName: 'Aura Wellness & Spa',
    address: 'Geeta Bhawan, Indore',
    bookingMode: 'Scheduled',
    status: BOOKING_STATUS.CANCELLED,
    dateKey: null,
    dayOffset: -8,
    time: '5:30 PM',
    stationId: null,
    staffId: null,
    services: [{ id: 'srv-5', name: 'Full Body Aromatherapy Spa & Deep Scalp Massage', price: 1499, duration: '1 hr 30 mins' }],
    totalAmount: 1499,
    discountAmount: 0,
    finalPaid: 0,
    couponApplied: null,
    paymentMethod: 'UPI (Google Pay / PhonePe)',
    paymentStatus: 'Refunded',
    transactionId: 'TXN-60129485',
    createdAt: '2026-09-04 06:15 PM',
    notes: '',
    cancelReason: 'Customer requested cancellation'
  },
  {
    id: 'IT-10822',
    customerId: 'cust-2',
    customerName: 'Priya Mehta',
    customerPhone: '+91 98261 44552',
    salonId: 'sal-1',
    salonName: 'Luxe Glow Salon & Spa',
    address: 'South Tukoganj, Indore',
    bookingMode: 'Instant',
    status: BOOKING_STATUS.SERVICE_STARTED,
    dateKey: null,
    dayOffset: 0,
    time: '02:30 PM',
    stationId: 'stn-1a',
    staffId: 'stf-1',
    services: [{ id: 'srv-4', name: 'HydraGlo Pore Extraction & Vitamin C Facial', price: 1299, duration: '1 hr 20 mins' }],
    totalAmount: 1299,
    discountAmount: 0,
    finalPaid: 1299,
    couponApplied: null,
    paymentMethod: 'UPI (Prepaid)',
    paymentStatus: 'Successful',
    transactionId: 'TXN-55291032',
    createdAt: '15 mins ago',
    notes: 'Sensitive skin near cheekbones'
  },
  {
    id: 'IT-10833',
    customerId: 'cust-3',
    customerName: 'Aman Khanna',
    customerPhone: '+91 94250 88912',
    salonId: 'sal-1',
    salonName: 'Luxe Glow Salon & Spa',
    address: 'South Tukoganj, Indore',
    bookingMode: 'Instant',
    status: BOOKING_STATUS.CONFIRMED,
    dateKey: null,
    dayOffset: 0,
    time: '04:15 PM',
    stationId: 'stn-1e',
    staffId: 'stf-9',
    services: [{ id: 'srv-10', name: 'Classic Beard Trim & Hot Towel Shave', price: 349, duration: '35 mins' }],
    totalAmount: 349,
    discountAmount: 0,
    finalPaid: 349,
    couponApplied: null,
    paymentMethod: 'UPI (Prepaid)',
    paymentStatus: 'Successful',
    transactionId: 'TXN-99201847',
    createdAt: '10 mins ago',
    notes: 'Arriving in 15 mins via auto'
  },
  {
    id: 'IT-10844',
    customerId: 'cust-4',
    customerName: 'Rhea Sen',
    customerPhone: '+91 98110 33491',
    salonId: 'sal-1',
    salonName: 'Luxe Glow Salon & Spa',
    address: 'South Tukoganj, Indore',
    bookingMode: 'Scheduled',
    status: BOOKING_STATUS.CONFIRMED,
    dateKey: null,
    dayOffset: 0,
    time: '05:00 PM',
    stationId: 'stn-1c',
    staffId: 'stf-3',
    services: [{ id: 'srv-7', name: 'Organic Body Glow Polish with Italy Towel', price: 1599, duration: '1 hr 30 mins' }],
    totalAmount: 1599,
    discountAmount: 0,
    finalPaid: 1599,
    couponApplied: null,
    paymentMethod: 'Credit Card (Online)',
    paymentStatus: 'Successful',
    transactionId: 'TXN-11238475',
    createdAt: '3 hours ago',
    notes: 'Requested quiet ambience'
  },
  {
    id: 'IT-10755',
    customerId: 'cust-5',
    customerName: 'Rahul Kapoor',
    customerPhone: '+91 91112 55431',
    salonId: 'sal-1',
    salonName: 'Luxe Glow Salon & Spa',
    address: 'South Tukoganj, Indore',
    bookingMode: 'Scheduled',
    status: BOOKING_STATUS.COMPLETED,
    dateKey: null,
    dayOffset: -1,
    time: '11:30 AM',
    stationId: 'stn-1a',
    staffId: 'stf-1',
    services: [{ id: 'srv-1', name: 'Full Arms + Full Legs Korean Wax', price: 899, duration: '1 hr 15 mins' }],
    totalAmount: 899,
    discountAmount: 0,
    finalPaid: 899,
    couponApplied: null,
    paymentMethod: 'UPI (Prepaid)',
    paymentStatus: 'Successful',
    transactionId: 'TXN-30294857',
    createdAt: 'Yesterday',
    notes: '',
    rating: 5,
    review: 'Super clean hygiene kits and gentle wax!'
  },
  {
    id: 'IT-10766',
    customerId: 'cust-6',
    customerName: 'Divya Agarwal',
    customerPhone: '+91 97550 22199',
    salonId: 'sal-1',
    salonName: 'Luxe Glow Salon & Spa',
    address: 'South Tukoganj, Indore',
    bookingMode: 'Scheduled',
    status: BOOKING_STATUS.COMPLETED,
    dateKey: null,
    dayOffset: -1,
    time: '01:00 PM',
    stationId: 'stn-1b',
    staffId: 'stf-2',
    services: [{ id: 'srv-4', name: 'HydraGlo Pore Extraction Facial', price: 1299, duration: '1 hr 20 mins' }],
    totalAmount: 1299,
    discountAmount: 0,
    finalPaid: 1299,
    couponApplied: null,
    paymentMethod: 'Pay at Salon (Cash)',
    paymentStatus: 'Successful',
    transactionId: 'TXN-30294901',
    createdAt: 'Yesterday',
    notes: '',
    rating: 5,
    review: 'Skin feels glowing right after the treatment.'
  }
];

// Demo default kept logged-in with the original prototype's identity so
// Phase 0 introduces no visible regression — Phase 3 replaces this with a
// real multi-account auth flow (email/Google/Apple login, route guards,
// editable profile) per SRS §6.1.
export const DEFAULT_CUSTOMER = {
  id: 'cust-1',
  isLoggedIn: true,
  name: 'Ananya Sharma',
  phone: '7000792773',
  email: 'ananya.sharma@example.com',
  gender: null,
  dob: null,
  isElite: true,
  referralCode: 'ANANYA50',
  favoriteSalonIds: ['sal-1'],
  notificationPrefs: { push: true, sms: true, email: true, whatsapp: false, marketing: false },
  authProvider: 'otp'
};

// Super-admin credentials for the admin dashboard panel
export const ADMIN_CREDENTIALS = {
  email: 'admin@instaatrim.com',
  password: 'admin2025',
  name: 'InstaaTrim Super Admin',
  role: 'super_admin'
};

