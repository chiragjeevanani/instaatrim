import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import {
  ArrowLeft,
  Scissors,
  Zap,
  Check,
  IndianRupee,
  Clock,
  Sparkles,
  Layers,
  ChevronDown,
  Lock,
  ShieldAlert,
  AlertCircle,
  Camera,
  Upload
} from 'lucide-react';

export const AddServicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addService, updateService, services, salonProfile, categories: dynamicCategories, showToast } = useSalon();

  const isApproved = Boolean(salonProfile?.isVerified && salonProfile?.verificationStatus === 'Live');
  const isRejected = salonProfile?.verificationStatus === 'Rejected';

  const editingServiceId = location.state?.serviceId;
  const existingService = services.find((s) => (s.id && s.id === editingServiceId) || (s._id && s._id === editingServiceId));

  // Available categories defined by admin
  const availableCategories = (dynamicCategories && dynamicCategories.length > 0)
    ? dynamicCategories.map((c) => c.name || c.shortName)
    : [
        'Waxing',
        'Facial',
        'Spa',
        'Body Polishing',
        'Mani-Pedi',
        'Hair Studio',
        'Beard',
        'Grooming',
        'Makeup',
        'Mehandi',
        'Cleanup',
        'Bleach & D-Tan'
      ];

  // Preset standard services catalog covering ~95% of all salon services for instant onboarding
  const STANDARD_TEMPLATES = [
    // --- 1. Hair: Haircut & Styling ---
    {
      name: "Men's Haircut",
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '30 mins',
      suggestedPrice: 300,
      description: 'Precision scissor and clipper cut tailored to facial structure with wash and style.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: "Women's Haircut",
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '45 mins',
      suggestedPrice: 600,
      description: 'Customized haircut, layers or bob cut with hair wash, conditioning, and blow-dry finish.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: "Kids' Haircut",
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '30 mins',
      suggestedPrice: 250,
      description: 'Gentle, patient haircut for boys and girls with gentle grooming.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Fringe / Trim',
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '15 mins',
      suggestedPrice: 150,
      description: 'Quick bang / fringe trim and split ends touchup.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
    },
    // --- Hair Color ---
    {
      name: 'Root Touch-up',
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '1 hr',
      suggestedPrice: 1200,
      description: 'Seamless grey coverage root application with ammonia-free permanent color.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Global Color',
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '2 hrs',
      suggestedPrice: 3000,
      description: 'All-over rich uniform hair coloring from root to tip with gloss finish.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Highlights (per streak/section)',
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '1 hr 30 mins',
      suggestedPrice: 2500,
      description: 'Foil highlights or babylights to add multidimensional contrast and movement.',
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Balayage / Ombre',
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '3 hrs',
      suggestedPrice: 6000,
      description: 'Freehand painted seamless gradient color transition for a sun-kissed, natural look.',
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80'
    },
    // --- Hair Treatments ---
    {
      name: 'Hair Spa',
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '1 hr',
      suggestedPrice: 1200,
      description: 'Nourishing botanical hair spa, scalp detox massage, and ozone steam conditioning.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Keratin Treatment',
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '3 hrs',
      suggestedPrice: 6000,
      description: 'Professional protein infusion smoothing treatment for frizz-free, shiny hair up to 4 months.',
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Smoothening / Rebonding',
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '4 hrs',
      suggestedPrice: 7000,
      description: 'Permanent straight and sleek hair rebonding / smoothening with intense gloss seal.',
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Scalp Treatment',
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '45 mins',
      suggestedPrice: 1000,
      description: 'Anti-dandruff and follicle purifying scalp treatment with therapeutic essential oils.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
    },
    // --- Styling ---
    {
      name: 'Blow-dry',
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '30 mins',
      suggestedPrice: 400,
      description: 'Straight, outward, or inward professional volume blow-dry styling.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Hair Wash + Blow-dry',
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '40 mins',
      suggestedPrice: 500,
      description: 'Deep cleansing shampoo, scalp massage, hydrating conditioner, and signature blow-dry.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Curls / Straightening',
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '45 mins',
      suggestedPrice: 700,
      description: 'Ceramic tong curling or flat iron pin-straight heat styling with heat protectant.',
      image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Party Hairstyle',
      category: 'Hair Styling',
      fallbackCategory: 'Hair Studio',
      duration: '1 hr',
      suggestedPrice: 1500,
      description: 'Intricate braids, messy buns, or red-carpet updo hairstyles for special occasions.',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
    },

    // --- 2. Men\'s Grooming ---
    {
      name: 'Beard Trim',
      category: 'Beard',
      fallbackCategory: 'Men\'s Hair & Grooming',
      duration: '20 mins',
      suggestedPrice: 200,
      description: 'Clipper beard trimming, length balancing, and cheek line definition.',
      image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Beard Styling / Shaping',
      category: 'Beard',
      fallbackCategory: 'Men\'s Hair & Grooming',
      duration: '30 mins',
      suggestedPrice: 300,
      description: 'Hot towel steam, razor boundary shaping, fade blend, and beard butter massage.',
      image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Clean Shave',
      category: 'Beard',
      fallbackCategory: 'Men\'s Hair & Grooming',
      duration: '20 mins',
      suggestedPrice: 200,
      description: 'Traditional close straight-razor shave with warm shaving foam and cooling aftershave balm.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Haircut + Beard Combo',
      category: 'Men\'s Hair & Grooming',
      fallbackCategory: 'Grooming',
      duration: '50 mins',
      suggestedPrice: 450,
      description: 'Complete men haircut, wash, razor beard styling and refreshing face mist.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Haircut + Head Massage',
      category: 'Men\'s Hair & Grooming',
      fallbackCategory: 'Grooming',
      duration: '45 mins',
      suggestedPrice: 450,
      description: 'Styling haircut paired with a relaxing 15-minute Ayurvedic cooling oil head massage.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: "Men's Cleanup",
      category: 'Facial',
      fallbackCategory: 'Men\'s Hair & Grooming',
      duration: '30 mins',
      suggestedPrice: 600,
      description: 'Deep pore scrub, blackhead unclogging, and oil-control hydration mask for men.',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: "Men's Facial",
      category: 'Facial',
      fallbackCategory: 'Men\'s Hair & Grooming',
      duration: '45 mins',
      suggestedPrice: 1000,
      description: 'Brightening antioxidant facial formulated for rugged skin exposure and pollution defense.',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'De-tan (Men)',
      category: 'Facial',
      fallbackCategory: 'Men\'s Hair & Grooming',
      duration: '30 mins',
      suggestedPrice: 700,
      description: 'Kojic and milk protein de-tan pack to remove active sun tan and restore even tone.',
      image: 'https://images.unsplash.com/photo-1512290900672-1f02e6584285?auto=format&fit=crop&w=600&q=80'
    },

    // --- 3. Skin & Facial ---
    {
      name: 'Basic Cleanup',
      category: 'Facial',
      fallbackCategory: 'Facials & Skin Care',
      duration: '30 mins',
      suggestedPrice: 600,
      description: 'Gentle facial cleanse, scrub exfoliation, blackhead extraction and soothing pack.',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Fruit / Hydrating Facial',
      category: 'Facial',
      fallbackCategory: 'Facials & Skin Care',
      duration: '1 hr',
      suggestedPrice: 1200,
      description: 'Natural fruit enzyme peel, active vitamin hydration, and lymphatic face massage.',
      image: 'https://images.unsplash.com/photo-1512290900672-1f02e6584285?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Anti-Acne Facial',
      category: 'Facial',
      fallbackCategory: 'Facials & Skin Care',
      duration: '1 hr',
      suggestedPrice: 1800,
      description: 'Salicylic acid and tea tree clarifying treatment to purify breakouts and regulate sebum.',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Anti-Ageing / Gold Facial',
      category: 'Facial',
      fallbackCategory: 'Facials & Skin Care',
      duration: '1 hr 15 mins',
      suggestedPrice: 2500,
      description: '24K gold dust radiance, collagen tightening booster, and youthful glow therapy.',
      image: 'https://images.unsplash.com/photo-1512290900672-1f02e6584285?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'De-tan (face/body)',
      category: 'Facial',
      fallbackCategory: 'Facials & Skin Care',
      duration: '30 mins',
      suggestedPrice: 800,
      description: 'Intense tan removal treatment with brightening fruit acids and licorice extract.',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Bleach',
      category: 'Facial',
      fallbackCategory: 'Facials & Skin Care',
      duration: '30 mins',
      suggestedPrice: 500,
      description: 'Oxy-glow facial bleach to camouflage facial hair and illuminate complexion.',
      image: 'https://images.unsplash.com/photo-1512290900672-1f02e6584285?auto=format&fit=crop&w=600&q=80'
    },

    // --- 4. Waxing & Threading ---
    {
      name: 'Full Arms Waxing',
      category: 'Waxing',
      fallbackCategory: 'Waxing & RICA',
      duration: '30 mins',
      suggestedPrice: 400,
      description: 'Hygienic warm liposoluble waxing for silky smooth arms with soothing post-wax oil.',
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Full Legs Waxing',
      category: 'Waxing',
      fallbackCategory: 'Waxing & RICA',
      duration: '40 mins',
      suggestedPrice: 600,
      description: 'Thorough hair removal from thigh to toes leaving skin flawlessly touchable.',
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Underarms Waxing',
      category: 'Waxing',
      fallbackCategory: 'Waxing & RICA',
      duration: '15 mins',
      suggestedPrice: 150,
      description: 'Gentle, pain-minimized strip or peel-off wax for sensitive underarm skin.',
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Full Body Waxing',
      category: 'Waxing',
      fallbackCategory: 'Waxing & RICA',
      duration: '1 hr 30 mins',
      suggestedPrice: 2000,
      description: 'Complete full body hair removal (arms, legs, back, front, and underarms) with RICA/Honey wax.',
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Eyebrows Threading',
      category: 'Waxing',
      fallbackCategory: 'Waxing & RICA',
      duration: '10 mins',
      suggestedPrice: 60,
      description: 'Precision cotton thread shaping and arch definition with aloe gel cooling.',
      image: 'https://images.unsplash.com/photo-1512290900672-1f02e6584285?auto=format&fit=crop&w=600&q=80'
    },

    // --- 5. Nails ---
    {
      name: 'Classic Manicure',
      category: 'Nails, Art & Extensions',
      fallbackCategory: 'Mani-Pedi',
      duration: '40 mins',
      suggestedPrice: 600,
      description: 'Nail shaping, cuticle soak & care, exfoliating hand scrub, relaxing hand massage and high-gloss polish.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Classic Pedicure',
      category: 'Nails, Art & Extensions',
      fallbackCategory: 'Mani-Pedi',
      duration: '50 mins',
      suggestedPrice: 800,
      description: 'Aromatherapy foot soak, heel callus buffing, dead skin scrub, invigorating foot massage and salon polish.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Spa Manicure + Pedicure',
      category: 'Nails, Art & Extensions',
      fallbackCategory: 'Mani-Pedi',
      duration: '1 hr 30 mins',
      suggestedPrice: 1800,
      description: 'Deluxe dual hands and feet spa treatment with crystal scrub, paraffin hydration pack and deep acupressure massage.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Gel Polish',
      category: 'Nails, Art & Extensions',
      fallbackCategory: 'Mani-Pedi',
      duration: '45 mins',
      suggestedPrice: 900,
      description: 'Chip-resistant UV/LED cured high-shine gel nail polish lasting up to 3 weeks.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Nail Extensions',
      category: 'Nails, Art & Extensions',
      fallbackCategory: 'Mani-Pedi',
      duration: '1 hr 30 mins',
      suggestedPrice: 2500,
      description: 'Full set acrylic or hard gel extensions with length extension, shape sculpting and base color.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Nail Art (per nail / full set)',
      category: 'Nails, Art & Extensions',
      fallbackCategory: 'Mani-Pedi',
      duration: '30 mins',
      suggestedPrice: 500,
      description: 'Creative custom nail art, chrome mirror finish, ombré glitter or 3D embellishments.',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80'
    },

    // --- 6. Makeup ---
    {
      name: 'Party Makeup',
      category: 'Makeup',
      fallbackCategory: 'Hair Studio',
      duration: '1 hr',
      suggestedPrice: 3000,
      description: 'Glamorous event makeup with HD foundation, contouring, dramatic eye makeup and false eyelashes.',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Saree Draping',
      category: 'Makeup',
      fallbackCategory: 'Hair Studio',
      duration: '30 mins',
      suggestedPrice: 800,
      description: 'Professional precision saree draping in traditional, modern, or can-can mermaid styles.',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Bridal Makeup',
      category: 'Makeup',
      fallbackCategory: 'Hair Studio',
      duration: '2 hrs 30 mins',
      suggestedPrice: 15000,
      description: 'Luxury airbrush / HD bridal makeup, jewellery setting, dupatta styling, lash extension and premium touchup kit.',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Engagement / Reception Makeup',
      category: 'Makeup',
      fallbackCategory: 'Hair Studio',
      duration: '2 hrs',
      suggestedPrice: 8000,
      description: 'Radiant celebration makeup tailored to ring ceremony, sangeet or evening wedding reception.',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Pre-bridal Package',
      category: 'Makeup',
      fallbackCategory: 'Spa',
      duration: '2 hrs',
      suggestedPrice: 12000,
      description: 'Multi-session head-to-toe beauty ritual: gold facial, full body polish, Rica wax, spa mani-pedi & hair spa.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
    },

    // --- 7. Spa & Massage ---
    {
      name: 'Head Massage',
      category: 'Spa',
      fallbackCategory: 'Spa & Body Massage',
      duration: '20 mins',
      suggestedPrice: 300,
      description: 'Traditional warm Ayurvedic oil champi, pressure point neck and shoulder stress relief.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Foot Reflexology',
      category: 'Spa',
      fallbackCategory: 'Spa & Body Massage',
      duration: '30 mins',
      suggestedPrice: 600,
      description: 'Targeted pressure point sole and calf massage to boost circulation and relieve fatigue.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Full Body Massage (Swedish / Deep Tissue)',
      category: 'Spa',
      fallbackCategory: 'Spa & Body Massage',
      duration: '1 hr',
      suggestedPrice: 2000,
      description: 'Full body tension dissolving massage with warm organic aromatherapy oils and steam shower.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Body Polishing',
      category: 'Spa',
      fallbackCategory: 'Body Polishing',
      duration: '1 hr',
      suggestedPrice: 2500,
      description: 'Full body botanical scrub exfoliation, dead cell removal, hydrating butter wrap and luminous glow finish.',
      image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=600&q=80'
    },

    // --- 8. Packages (DrimStyle-curated combos) ---
    {
      name: 'Groom Package',
      category: 'Men\'s Hair & Grooming',
      fallbackCategory: 'Grooming',
      duration: '1 hr 30 mins',
      suggestedPrice: 1999,
      description: 'Complete groom prep: Styling haircut, luxury beard craft, anti-pollution cleanup and relaxing head massage.',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Bridal Glow Package',
      category: 'Makeup',
      fallbackCategory: 'Facial',
      duration: '2 hrs',
      suggestedPrice: 4999,
      description: '24K gold facial, full arms & legs waxing, spa mani-pedi and hair spa with keratin gloss.',
      image: 'https://images.unsplash.com/photo-1512290900672-1f02e6584285?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Monthly Grooming Pass',
      category: 'Men\'s Hair & Grooming',
      fallbackCategory: 'Grooming',
      duration: '1 hr',
      suggestedPrice: 999,
      description: 'Essential monthly hygiene pack: Haircut, beard shape, D-tan cleanup and quick scalp massage.',
      image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Pamper Day Combo',
      category: 'Spa',
      fallbackCategory: 'Facial',
      duration: '2 hrs',
      suggestedPrice: 2799,
      description: 'Full body restorative massage, hydrating organic facial and deluxe foot reflexology.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
    }
  ];

  // Merge Admin Database Categories + Sub-services with Standard Templates dynamically
  const DYNAMIC_TEMPLATES = React.useMemo(() => {
    const list = [...STANDARD_TEMPLATES];

    // If Admin added categories in DB with sub-service tags, dynamically turn them into autofill templates
    if (dynamicCategories && dynamicCategories.length > 0) {
      dynamicCategories.forEach((cat) => {
        const catName = cat.name || cat.shortName;
        const subList = Array.isArray(cat.serviceCategories) ? cat.serviceCategories : [];
        subList.forEach((subName) => {
          if (!list.some((item) => item.name.toLowerCase() === subName.toLowerCase())) {
            list.push({
              name: subName,
              category: catName,
              fallbackCategory: catName,
              duration: '45 mins',
              suggestedPrice: cat.price || 499,
              description: cat.description || `Professional ${subName} treatment tailored to perfection.`,
              image: cat.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
            });
          }
        });
      });
    }

    return list;
  }, [dynamicCategories]);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(availableCategories[0] || 'Waxing');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('45 mins');
  const [price, setPrice] = useState('');
  const [isInstantEligible, setIsInstantEligible] = useState(true);
  const [image, setImage] = useState(null);
  const [showAutofillSuggestions, setShowAutofillSuggestions] = useState(false);

  // Platform controlled discount markup (e.g. 30% display discount on customer end)
  const PLATFORM_DISCOUNT_PERCENT = 30;
  
  // Salon enters ONE price (their payout/selling rate).
  // Platform automatically computes and locks the Original Price (MSRP)
  const computedOriginalPrice = price && Number(price) > 0
    ? Math.round(Number(price) / (1 - PLATFORM_DISCOUNT_PERCENT / 100))
    : 0;

  useEffect(() => {
    if (existingService) {
      setName(existingService.name || '');
      setCategory(existingService.category || availableCategories[0] || 'Waxing');
      setDescription(existingService.description || '');
      setDuration(existingService.duration || '45 mins');
      setPrice(existingService.price || '');
      setIsInstantEligible(existingService.isInstantEligible ?? true);
      setImage(existingService.image || null);
    } else if (availableCategories.length > 0 && !category) {
      setCategory(availableCategories[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingService?.id]);

  const durations = [
    '20 mins',
    '30 mins',
    '45 mins',
    '1 hr',
    '1 hr 15 mins',
    '1 hr 30 mins',
    '2 hrs'
  ];

  // Track currently applied template if any
  const [appliedTemplateName, setAppliedTemplateName] = useState('');

  // Auto-fill selected template handler
  const handleApplyTemplate = (tmpl) => {
    setName(tmpl.name);
    setAppliedTemplateName(tmpl.name);
    // Find matching category from availableCategories
    const matchedCategory = availableCategories.find(
      (c) => c.toLowerCase() === tmpl.category.toLowerCase() || c.toLowerCase() === tmpl.fallbackCategory?.toLowerCase()
    );
    if (matchedCategory) {
      setCategory(matchedCategory);
    }
    setDuration(tmpl.duration || '45 mins');
    setDescription(tmpl.description || '');
    if (!price || price === '') {
      setPrice(tmpl.suggestedPrice || '');
    }
    if (tmpl.image) {
      setImage(tmpl.image);
    }
    setShowAutofillSuggestions(false);
    showToast(`Autofilled details for "${tmpl.name}"`);
  };

  // Clear / remove applied template details
  const handleClearTemplate = () => {
    setName('');
    setAppliedTemplateName('');
    setCategory(availableCategories[0] || 'Waxing');
    setDuration('45 mins');
    setDescription('');
    setPrice('');
    setImage(null);
    setShowAutofillSuggestions(false);
    showToast('Template cleared. Form reset.');
  };

  // Filter templates matching current input query
  const matchingTemplates = DYNAMIC_TEMPLATES.filter((t) => {
    const q = name.trim().toLowerCase();
    if (!q) return false;
    return t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isApproved) {
      showToast('Admin approval required before listing services', 'error');
      return;
    }
    if (!name.trim() || !price) return;

    const basePrice = Number(price);
    const finalOriginalPrice = computedOriginalPrice || Math.round(basePrice * 1.3);

    const servicePayload = {
      name: name.trim(),
      category,
      description: description.trim(),
      duration,
      price: basePrice,
      originalPrice: finalOriginalPrice,
      isInstantEligible,
      image:
        image ||
        existingService?.image ||
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
    };

    if (existingService) {
      updateService(existingService.id || existingService._id, servicePayload);
    } else {
      addService(servicePayload);
    }
    navigate('/salon/services');
  };

  if (!isApproved) {
    return (
      <div className="w-full max-w-[480px] lg:max-w-3xl min-w-0 bg-transparent font-sans text-stone-900 antialiased min-h-screen flex flex-col justify-between mx-auto box-border">
        {/* Top Header */}
        <header className="sticky top-0 lg:static z-30 bg-[#f8f4fb]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none px-4 lg:px-8 py-2.5 lg:pt-8 lg:pb-0 border-b lg:border-0 border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/salon/services')}
              className="w-8 h-8 rounded-full bg-white hover:bg-stone-50 active:scale-95 text-stone-700 border border-purple-200/60 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
            <div>
              <h1 className="text-[14px] lg:text-2xl font-bold text-stone-900 tracking-tight leading-none">
                Add New Service
              </h1>
              <p className="text-[10px] text-stone-500 font-normal mt-0.5">
                Service Catalog Access
              </p>
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
        </header>

        <main className="p-4 lg:p-8 flex-1 flex flex-col items-center justify-center text-center">
          <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm max-w-[360px] space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
              <ShieldAlert className="w-7 h-7 stroke-[2]" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-block bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full mb-1">
                {salonProfile?.verificationStatus || 'Pending Approval'}
              </div>
              <h2 className="text-base font-bold text-stone-900 tracking-tight">
                Admin Approval Required
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                For salon owner, after onboarding, first approval from the admin is needed and only after that salon can list their services.
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/70 text-left space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-stone-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>Onboarding Profile Submitted</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span>Admin Review &amp; KYC Verification in Progress</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <span className="w-2 h-2 rounded-full bg-stone-300 shrink-0" />
                <span>Service Catalogue &amp; Booking Live</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('/salon/onboarding')}
                className="w-full py-2.5 bg-rose-900 hover:bg-rose-950 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                View Verification Dossier
              </button>
              <button
                type="button"
                onClick={() => navigate('/salon/services')}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Back to Services
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[480px] lg:max-w-3xl min-w-0 bg-transparent font-sans text-stone-900 antialiased min-h-screen flex flex-col justify-between mx-auto box-border">
      {/* Top Header */}
      <header className="sticky top-0 lg:static z-30 bg-[#f8f4fb]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none px-4 lg:px-8 py-2.5 lg:pt-8 lg:pb-0 border-b lg:border-0 border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/salon/services')}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-50 active:scale-95 text-stone-700 border border-purple-200/60 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-[14px] lg:text-2xl font-bold text-stone-900 tracking-tight leading-none">
              {existingService ? 'Edit Treatment' : 'Add New Service'}
            </h1>
            <p className="text-[10px] text-stone-500 font-normal mt-0.5">
              Manage catalog pricing &amp; express availability
            </p>
          </div>
        </div>

        <div className="w-7 h-7 rounded-lg bg-purple-100/70 text-rose-900 flex items-center justify-center">
          <Scissors className="w-3.5 h-3.5 stroke-[2]" />
        </div>
      </header>

      {/* Main Form Body */}
      <main className="p-3.5 lg:p-8 pb-44 lg:pb-48 flex-1 space-y-3 overflow-y-visible">
        <form id="service-form" onSubmit={handleSubmit} className="space-y-3">
          {/* Card 1: Image & Title & Category */}
          <div className="bg-white rounded-2xl p-3.5 border border-purple-100/80 shadow-xs space-y-3">
            {/* Image Upload Area */}
            <div>
              <label className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                Service Image
              </label>
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-stone-100 border-2 border-dashed border-stone-200 group">
                {image ? (
                  <>
                    <img
                      src={image}
                      alt="Service Preview"
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setImage(null)}
                        className="text-xs font-semibold px-3 py-1 bg-white text-stone-800 rounded-full"
                      >
                        Change Image
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-stone-500">
                    <Camera className="w-6 h-6 mb-2 opacity-50" />
                    <span className="text-[10px] font-medium mb-2">No Image Selected</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
                              const result = await window.flutter_inappwebview.callHandler('openCamera');
                              if (result && result.success) {
                                setImage(`data:${result.mimeType};base64,${result.base64}`);
                              }
                            } else {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.capture = 'environment';
                              input.onchange = (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => setImage(ev.target.result);
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }
                          } catch (err) {
                            console.error("Camera error:", err);
                          }
                        }}
                        className="px-2 py-1 bg-stone-200 text-stone-700 text-[10px] font-semibold rounded-md flex items-center gap-1 hover:bg-stone-300"
                      >
                        <Camera className="w-3 h-3" /> Camera
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => setImage(ev.target.result);
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                        className="px-2 py-1 bg-stone-200 text-stone-700 text-[10px] font-semibold rounded-md flex items-center gap-1 hover:bg-stone-300"
                      >
                        <Upload className="w-3 h-3" /> Gallery
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider block">
                  Service Title <span className="text-rose-600">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {(name || appliedTemplateName) && (
                    <button
                      type="button"
                      onClick={handleClearTemplate}
                      className="text-[10px] font-bold text-stone-500 hover:text-red-700 bg-stone-100 hover:bg-red-50 border border-stone-200 hover:border-red-200 px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                      title="Clear applied template & reset form"
                    >
                      <AlertCircle className="w-2.5 h-2.5 text-stone-400 hover:text-red-600" />
                      <span>Clear / Reset</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAutofillSuggestions((v) => !v)}
                    className="text-[10px] font-semibold text-rose-900 hover:text-rose-950 flex items-center gap-1 cursor-pointer bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-full transition-colors"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-rose-900" />
                    <span>{showAutofillSuggestions ? 'Hide Templates' : '⚡ Auto-fill Templates'}</span>
                  </button>
                </div>
              </div>

              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  placeholder="e.g. Lotus Crystal Radiance Facial or start typing..."
                  value={name}
                  onFocus={() => setShowAutofillSuggestions(true)}
                  onChange={(e) => {
                    setName(e.target.value);
                    setShowAutofillSuggestions(true);
                  }}
                  className="w-full bg-[#faf7fc] text-xs text-stone-900 placeholder:text-stone-400 rounded-xl border border-purple-100 pl-3 pr-8 py-2.5 outline-none focus:bg-white focus:border-rose-900 focus:ring-1 focus:ring-rose-900/30 transition-all font-medium"
                />
                {name && (
                  <button
                    type="button"
                    onClick={handleClearTemplate}
                    className="absolute right-2.5 text-stone-400 hover:text-stone-700 p-0.5 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
                    title="Clear title"
                  >
                    <AlertCircle className="w-3.5 h-3.5 rotate-45" />
                  </button>
                )}
              </div>

              {/* Auto-fill Dropdown / Recommendation Chips */}
              {showAutofillSuggestions && (
                <div className="mt-2 bg-gradient-to-b from-purple-50/60 to-white border border-purple-200/80 rounded-2xl p-2.5 shadow-sm space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-rose-950 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-rose-900" /> Auto-fill from Catalog Template
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAutofillSuggestions(false)}
                      className="text-[10px] text-stone-400 hover:text-stone-700"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1 divide-y divide-purple-100/50">
                    {(matchingTemplates.length > 0 ? matchingTemplates : DYNAMIC_TEMPLATES).map((tmpl, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="w-full text-left p-2 rounded-xl hover:bg-purple-100/60 active:scale-[0.99] transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {tmpl.image && (
                            <img
                              src={tmpl.image}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-purple-100"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-stone-900 group-hover:text-rose-950 truncate">
                              {tmpl.name}
                            </p>
                            <p className="text-[9.5px] text-stone-500 truncate">
                              {tmpl.category} • {tmpl.duration}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-2">
                          <span className="text-[10px] font-bold text-rose-900 bg-white border border-rose-200 px-2 py-0.5 rounded-md shadow-2xs group-hover:bg-rose-900 group-hover:text-white transition-colors">
                            Apply
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category Pills Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider">
                  Category <span className="text-rose-600">*</span>
                </label>
                <span className="text-[10px] font-semibold text-rose-900">{category}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableCategories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-rose-900 text-white border-rose-900 shadow-2xs scale-[1.02]'
                          : 'bg-[#faf7fc] text-stone-600 border-purple-100 hover:bg-stone-100'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                Estimated Duration
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Clock className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#faf7fc] text-xs text-stone-900 rounded-xl border border-purple-100 pl-8 pr-8 py-2.5 outline-none focus:bg-white focus:border-rose-900 font-medium appearance-none cursor-pointer"
                >
                  {durations.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-stone-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Pricing & Platform Controlled Yield */}
          <div className="bg-white rounded-2xl p-3.5 border border-purple-100/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider block">
                Salon Pricing
              </span>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-900 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
                <Lock className="w-2.5 h-2.5 stroke-[2]" />
                <span>Discounts &amp; Offers controlled by Platform</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
              <div>
                <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                  Your Service Price (₹) <span className="text-rose-600">*</span>
                </label>
                <div className="flex items-center bg-[#faf7fc] rounded-xl border border-purple-100 px-2.5 py-2 focus-within:bg-white focus-within:border-rose-900 focus-within:ring-1 focus-within:ring-rose-900/30 transition-all">
                  <IndianRupee className="w-3.5 h-3.5 text-stone-400 mr-1 shrink-0" />
                  <input
                    type="number"
                    required
                    min="50"
                    placeholder="799"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-transparent text-xs text-stone-900 outline-none font-bold"
                  />
                </div>
                <p className="text-[9.5px] text-stone-500 mt-1 leading-tight">
                  This is the base price your salon receives for this service.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-stone-500 block mb-1 flex items-center justify-between">
                  <span>Customer Display MSRP (₹)</span>
                  <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                    {PLATFORM_DISCOUNT_PERCENT}% Platform Deal
                  </span>
                </label>
                <div className="flex items-center bg-stone-100/80 rounded-xl border border-stone-200/70 px-2.5 py-2 cursor-not-allowed">
                  <IndianRupee className="w-3.5 h-3.5 text-stone-400 mr-1 shrink-0" />
                  <input
                    type="number"
                    readOnly
                    disabled
                    value={computedOriginalPrice || (price ? Math.round(Number(price) * 1.3) : '')}
                    className="w-full bg-transparent text-xs text-stone-500 outline-none font-semibold cursor-not-allowed"
                    placeholder="Auto-calculated"
                  />
                  <Lock className="w-3 h-3 text-stone-400 shrink-0 ml-1" />
                </div>
                <p className="text-[9.5px] text-stone-400 mt-1 leading-tight">
                  Auto-formatted with standard consumer discount for maximum conversions.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Description */}
          <div className="bg-white rounded-2xl p-3.5 border border-purple-100/80 shadow-xs space-y-1.5">
            <label className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider block">
              Description &amp; Inclusions
            </label>
            <textarea
              rows={3}
              placeholder="Product formulations, benefits, steps included, aftercare advice..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#faf7fc] text-xs text-stone-900 placeholder:text-stone-400 rounded-xl border border-purple-100 p-3 outline-none focus:bg-white focus:border-rose-900 focus:ring-1 focus:ring-rose-900/30 resize-none font-normal transition-all"
            />
          </div>

          {/* Card 4: Instant Walk-In Toggle */}
          <div className="bg-white rounded-2xl p-3.5 border border-purple-100/80 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isInstantEligible ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-400'
                }`}
              >
                <Zap
                  className={`w-4 h-4 stroke-[2] ${
                    isInstantEligible ? 'fill-amber-500 text-amber-500' : ''
                  }`}
                />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-900 block leading-tight">
                  Instant Booking Eligible
                </span>
                <p className="text-[10px] text-stone-500 leading-tight mt-0.5">
                  Show in "Ready Now in 15 mins" express bookings
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsInstantEligible(!isInstantEligible)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative shrink-0 shadow-inner ${
                isInstantEligible ? 'bg-rose-900' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                  isInstantEligible ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </form>
      </main>

      {/* Floating Bottom Sticky Bar for Actions */}
      <footer className="fixed bottom-0 left-0 lg:left-64 right-0 z-40 p-3 lg:py-4 bg-white/95 backdrop-blur-md border-t border-purple-100/80 shadow-lg">
        <div className="max-w-[480px] lg:max-w-3xl lg:px-8 mx-auto flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/salon/services')}
            className="w-1/3 py-2.5 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 font-bold text-xs rounded-xl transition-all text-center cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="service-form"
            className="flex-1 py-2.5 bg-rose-900 hover:bg-rose-950 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{existingService ? 'Save Changes' : 'Add Service'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
