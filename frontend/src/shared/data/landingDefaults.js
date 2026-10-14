// Default copy for the public landing page (/). Admins override any part of
// this from Admin → Landing Page; saved content is deep-merged over these
// defaults (objects merge, arrays replace), so new fields always have a value.

export const LANDING_DEFAULTS = {
  seo: {
    title: 'DrimStyle — Book salons near you. Save money, save time.',
    description:
      'Book verified salons, spas and grooming studios near you with instant walk-in seats or scheduled slots. Salon owners: list your services and fill every chair with DrimStyle.'
  },

  nav: {
    customerCta: 'Book a salon',
    salonCta: 'Partner login'
  },

  hero: {
    enabled: true,
    customer: {
      eyebrow: 'Salon & grooming bookings',
      title: 'Your next look,',
      highlight: 'booked in seconds.',
      subtitle:
        'Find verified salons near you, grab an instant walk-in seat or schedule a slot that suits you, and save on every visit.',
      primaryLabel: 'Book a salon',
      primaryLink: '/customer',
      secondaryLabel: 'See how it works',
      secondaryLink: '#how-it-works'
    },
    salon: {
      eyebrow: 'For salon & spa owners',
      title: 'Fill every chair,',
      highlight: 'run your salon smarter.',
      subtitle:
        'List your services, accept instant and scheduled bookings, manage your live queue and get paid on time — all from one partner console.',
      primaryLabel: 'Become a partner',
      primaryLink: '/salon/register',
      secondaryLabel: 'Partner login',
      secondaryLink: '/salon/login'
    },
    customerChips: [
      { icon: 'zap', title: 'Seat ready', value: 'in 15 min' },
      { icon: 'shield', title: 'Verified salon', value: 'KYC checked' },
      { icon: 'tag', title: 'You saved', value: '₹400 with offers' },
      { icon: 'calendar', title: 'Booking confirmed', value: 'Today, 6:30 PM' }
    ],
    salonChips: [
      { icon: 'users', title: 'Live queue', value: '3 checked-in' },
      { icon: 'wallet', title: 'Next payout', value: 'Daily (T+1)' },
      { icon: 'trending', title: 'Flash deal live', value: 'Filling 2–4 PM' },
      { icon: 'star', title: 'New review', value: '5.0 rating' }
    ],
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80'
  },

  highlights: {
    enabled: true,
    items: [
      { icon: 'shield', title: 'Verified partner salons', text: 'Every salon is KYC-checked before going live' },
      { icon: 'zap', title: 'Instant walk-in seats', text: 'Live wait times straight from the salon' },
      { icon: 'card', title: 'Secure online payment', text: 'Pay at checkout with UPI, cards & more' },
      { icon: 'refresh', title: 'Free cancellation', text: 'Up to 1 hour before your slot' }
    ]
  },

  categories: {
    enabled: true,
    eyebrow: 'Services',
    title: 'Everything you book a salon for',
    subtitle: 'Hair, skin, spa, nails, grooming and more — from top-rated salons near you.',
    ctaLabel: 'Explore all services',
    ctaLink: '/customer/salons'
  },

  customers: {
    enabled: true,
    eyebrow: 'For customers',
    title: 'How booking works',
    subtitle: 'From search to salon chair in four simple steps.',
    steps: [
      {
        title: 'Discover',
        text: 'Search a service or salon, filter by category, Men / Women, rating and instant availability.'
      },
      {
        title: 'Pick your time',
        text: 'Take an instant walk-in seat ready in minutes, or schedule a date and slot. Your slot is held while you check out.'
      },
      {
        title: 'Pay & save',
        text: 'Apply coupons, partner deals or Elite savings and pay securely online at checkout.'
      },
      {
        title: 'Walk in & relax',
        text: 'Check in at the salon, enjoy your service, then rate your visit to help others choose.'
      }
    ],
    features: [
      { icon: 'shield', title: 'Only verified salons', text: 'Partners are reviewed by our team before they can accept bookings.' },
      { icon: 'zap', title: 'Instant seats', text: 'See which salons can seat you right now and how long you will wait.' },
      { icon: 'tag', title: 'Upfront prices & offers', text: 'Service prices, discounts and fees are shown before you pay.' },
      { icon: 'calendar', title: 'Manage bookings', text: 'Track upcoming visits, reschedule or cancel from My Bookings.' },
      { icon: 'gift', title: 'Refer & earn', text: 'Invite friends and earn rewards on their first booking.' },
      { icon: 'star', title: 'Real reviews', text: 'Ratings come from customers with verified bookings.' }
    ],
    ctaLabel: 'Start booking',
    ctaLink: '/customer'
  },

  salons: {
    enabled: true,
    eyebrow: 'For salon owners',
    title: 'Your salon, fully booked.',
    subtitle:
      'DrimStyle brings nearby customers to your door and gives you one console to run the day — queue, walk-ins, services, staff and payouts.',
    steps: [
      { title: 'Create your profile', text: 'Salon name, category and owner details.' },
      { title: 'Pin your location', text: 'So nearby customers can find you.' },
      { title: 'Upload KYC documents', text: 'GSTIN and Shop Act licence for verification.' },
      { title: 'Add payout details', text: 'Choose daily (T+1) or weekly settlements.' },
      { title: 'Go live', text: 'Once approved, start accepting bookings.' }
    ],
    features: [
      { icon: 'users', title: 'Live appointment queue', text: 'Check customers in, start services and free up stations in real time.' },
      { icon: 'zap', title: 'Instant walk-in control', text: 'Switch instant booking on or off and set your current wait time.' },
      { icon: 'scissors', title: 'Service catalogue', text: 'Set prices, durations and which services are instant-eligible.' },
      { icon: 'trending', title: 'Flash deals for slow hours', text: 'Launch dynamic discounts to fill empty chairs at quiet times.' },
      { icon: 'chart', title: 'Analytics & payouts', text: 'Track revenue, repeat clients and settlements in one place.' },
      { icon: 'star', title: 'Reviews & replies', text: 'Respond to customer feedback and build your reputation.' }
    ],
    primaryLabel: 'Register your salon',
    primaryLink: '/salon/register',
    secondaryLabel: 'Partner login',
    secondaryLink: '/salon/login'
  },

  elite: {
    enabled: true,
    eyebrow: 'Membership',
    title: 'DrimStyle Elite',
    subtitle: 'For regulars who want more from every visit.',
    perks: [
      '10% extra discount on bookings across salons',
      'Zero platform convenience fee',
      'Priority slot access',
      'Free sanitised safety kit on every visit'
    ],
    ctaLabel: 'Get Elite in the app',
    ctaLink: '/customer'
  },

  testimonials: {
    enabled: false,
    eyebrow: 'Loved by customers & partners',
    title: 'What people say',
    items: [
      { quote: 'Add a real customer quote here from Admin → Landing Page.', name: 'Customer name', role: 'City' },
      { quote: 'Add a real salon partner quote here from Admin → Landing Page.', name: 'Salon owner', role: 'Salon name' }
    ]
  },

  faq: {
    enabled: true,
    eyebrow: 'FAQ',
    title: 'Questions, answered',
    items: [
      {
        audience: 'customer',
        question: 'What is an instant walk-in seat?',
        answer: 'Salons with instant booking switched on show a live wait time. Book an instant seat and head over — your chair will be ready when you arrive.'
      },
      {
        audience: 'customer',
        question: 'Can I cancel or reschedule?',
        answer: 'Yes. Manage bookings from My Bookings. Cancellations are free up to 1 hour before your slot.'
      },
      {
        audience: 'customer',
        question: 'Is there a booking fee?',
        answer: 'Browsing is free. A small platform fee may apply at checkout and is waived for Elite members. All charges are shown before you pay.'
      },
      {
        audience: 'salon',
        question: 'How do I join as a partner?',
        answer: 'Register your salon, upload your KYC documents and add payout details. Our team verifies your application and you can go live once approved.'
      },
      {
        audience: 'salon',
        question: 'When do I get paid?',
        answer: 'Choose daily (T+1) or weekly settlements during registration. Track every payout from the partner console.'
      },
      {
        audience: 'salon',
        question: 'Can I control when I take walk-ins?',
        answer: 'Yes. Toggle instant walk-ins on or off at any time and set your current wait time from the top bar of your console.'
      }
    ]
  },

  finalCta: {
    enabled: true,
    customerTitle: 'Ready for your next appointment?',
    customerText: 'Find a verified salon near you and book in seconds.',
    customerLabel: 'Book a salon',
    customerLink: '/customer',
    salonTitle: 'Own a salon or spa?',
    salonText: 'Join DrimStyle and start filling empty chairs.',
    salonLabel: 'Become a partner',
    salonLink: '/salon/register'
  },

  // Empty phone/email fall back to the support contacts in Platform Settings.
  footer: {
    tagline: 'Save money, save time.',
    phone: '',
    email: '',
    address: ''
  }
};

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

// Objects merge recursively; arrays and primitives from `saved` replace the default.
export const mergeLandingContent = (defaults, saved) => {
  if (!isPlainObject(saved)) return defaults;
  const out = { ...defaults };
  for (const [key, value] of Object.entries(saved)) {
    out[key] = isPlainObject(value) && isPlainObject(defaults[key]) ? mergeLandingContent(defaults[key], value) : value;
  }
  return out;
};
