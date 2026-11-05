import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Building2,
  MapPin,
  FileCheck2,
  Landmark,
  Sparkles,
  Check,
  ChevronRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  BadgePercent,
  Camera,
  Upload,
  Search,
  CheckCircle2,
  Tag,
  X
} from 'lucide-react';
import { api } from '../../../shared/services/api';
import { requestCurrentPosition, reverseGeocode, searchPlaces } from '../../../shared/lib/geo';
import { requestFirebaseToken } from '../../../shared/lib/firebase';
import { AuthBrandPanel } from '../../../shared/components/AuthBrandPanel';
import { getCategorySuggestions, findCategoryByName } from '../../../shared/data/categoryCatalog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CATEGORY_OPTIONS = [];

const AMENITY_LIST = [
  'AC & Ambient Music',
  'Sanitized Kits & Tools',
  'Beverage & Coffee Bar',
  'Valet & Free Parking',
  'Card/UPI/Contactless',
  'High-Speed Wi-Fi',
  'Bridal Changing Room',
  'Express Fast-Lane'
];


export const SalonRegistrationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(() => {
    const saved = sessionStorage.getItem('instaatrim_salon_reg_step');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [dbCategories, setDbCategories] = useState([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

  // Form State
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('instaatrim_salon_reg_form');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return {
      name: '',
      category: '',
      subcategories: [],
      ownerName: '',
      mobile: '',
      email: '',
      password: '',
      city: '',
      pincode: '',
      lat: null,
      lng: null,
      area: '',
      address: '',
      openTime: '09:30 AM',
      closeTime: '08:30 PM',
      totalChairs: 4,
      amenities: ['AC & Ambient Music', 'Sanitized Kits & Tools', 'Card/UPI/Contactless'],
      businessType: 'Sole Proprietorship',
      gstin: '',
      shopActLicense: '',
      coverImage: '',
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      payoutCycle: 'Daily Automated',
      agreeTerms: true
    };
  });

  // Smart autocomplete — exactly the same source & matching as Admin → Categories
  // (shared catalog + live DB categories; DB wins when names match)
  const categorySuggestions = useMemo(
    () => getCategorySuggestions(formData.category, dbCategories),
    [formData.category, dbCategories]
  );

  // Category (catalog or DB) whose name / short name / slug exactly matches the typed text
  const selectedCategoryObj = useMemo(
    () => findCategoryByName(formData.category, dbCategories),
    [formData.category, dbCategories]
  );

  // Subcategory chips = tags of the matched category + any custom ones the partner added
  const availableSubcategories = useMemo(() => {
    const base = selectedCategoryObj?.tags || [];
    const custom = (formData.subcategories || []).filter((s) => !base.includes(s));
    return [...base, ...custom];
  }, [selectedCategoryObj, formData.subcategories]);

  const [customSubInput, setCustomSubInput] = useState('');

  // Click a suggestion → auto-fill category + all its subcategories (same as admin "Apply")
  const selectCategorySuggestion = (sug) => {
    setFormData((prev) => ({
      ...prev,
      category: sug.name,
      subcategories: [...(sug.tags || [])]
    }));
    setShowCategorySuggestions(false);
    if (error) setError(null);
  };

  // Typing = manual entry. If text exactly matches a known category, its subcategories auto-load;
  // if the text is changed away / cleared, those subcategories go away too.
  const handleCategoryChange = (value) => {
    setShowCategorySuggestions(true);
    const match = findCategoryByName(value, dbCategories);
    setFormData((prev) => {
      if (!value.trim()) return { ...prev, category: value, subcategories: [] };
      const prevMatch = findCategoryByName(prev.category, dbCategories);
      let subs = prev.subcategories || [];
      if (match && match.name !== prevMatch?.name) subs = [...(match.tags || [])];
      else if (!match && prevMatch) subs = subs.filter((s) => !(prevMatch.tags || []).includes(s));
      return { ...prev, category: value, subcategories: subs };
    });
    if (error) setError(null);
  };

  const addCustomSubcategories = () => {
    const parts = customSubInput.split(',').map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    setFormData((prev) => {
      const current = prev.subcategories || [];
      const lower = current.map((s) => s.toLowerCase());
      const fresh = parts.filter((p) => !lower.includes(p.toLowerCase()));
      return { ...prev, subcategories: [...current, ...fresh] };
    });
    setCustomSubInput('');
  };

  useEffect(() => {
    api.categories.list({ onlyActive: true }).then((res) => {
      // Only global categories (not ones assigned to a specific salon) are offered at onboarding
      const cats = (res || []).filter((c) => !c.salonId || c.salonId === 'all');
      setDbCategories(cats);
      setFormData((prev) => {
        // Drop the old hardcoded 'Unisex' default
        if (prev.category === 'Unisex') return { ...prev, category: '', subcategories: [] };
        const match = findCategoryByName(prev.category, cats);
        if (match && !(prev.subcategories || []).length) {
          return { ...prev, category: match.name, subcategories: [...(match.tags || [])] };
        }
        return prev;
      });
    });
  }, []);

  useEffect(() => {
    sessionStorage.setItem('instaatrim_salon_reg_step', step.toString());
  }, [step]);

  useEffect(() => {
    sessionStorage.setItem('instaatrim_salon_reg_form', JSON.stringify(formData));
  }, [formData]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const toggleSubcategory = (sub) => {
    setFormData((prev) => {
      const current = prev.subcategories || [];
      const exists = current.includes(sub);
      return {
        ...prev,
        subcategories: exists ? current.filter((s) => s !== sub) : [...current, sub]
      };
    });
  };

  const toggleAmenity = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const isStep1Valid =
    formData.name.trim().length >= 3 &&
    (formData.category || '').trim().length > 0 &&
    formData.ownerName.trim().length >= 2 &&
    formData.mobile.replace(/\D/g, '').length === 10 &&
    formData.email.includes('@') &&
    formData.password.length >= 6;

  // ── Live location (same geo helpers as the customer app) ──
  const [locateState, setLocateState] = useState('idle'); // idle | locating | error
  const [locateError, setLocateError] = useState(null);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  const applyPickedLocation = (loc) => {
    // Picked a whole city (e.g. "Agra")? Its name is not an area — let the partner type the area.
    const isCityLevel = loc.placeType === 'city' || loc.placeType === 'state';
    setFormData((prev) => ({
      ...prev,
      city: loc.city || prev.city,
      area: isCityLevel ? '' : loc.area || prev.area,
      address: loc.address || prev.address,
      pincode: loc.pincode || prev.pincode || '',
      lat: typeof loc.lat === 'number' && !isNaN(loc.lat) ? loc.lat : prev.lat,
      lng: typeof loc.lng === 'number' && !isNaN(loc.lng) ? loc.lng : prev.lng
    }));
    if (error) setError(null);
  };

  const handleUseCurrentLocation = async () => {
    setLocateState('locating');
    setLocateError(null);
    try {
      const { lat, lng } = await requestCurrentPosition();
      const detected = await reverseGeocode(lat, lng);
      applyPickedLocation({ ...detected, lat, lng });
      setLocateState('idle');
    } catch (err) {
      setLocateState('error');
      setLocateError(err?.message || 'Could not fetch your location. Please search or type it manually.');
    }
  };

  // Debounced place search (Photon / OSM — same as customer location page)
  useEffect(() => {
    if (!placeQuery || placeQuery.trim().length < 2) {
      setPlaceResults([]);
      setIsSearchingPlaces(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        setPlaceResults(await searchPlaces(placeQuery));
      } catch {
        setPlaceResults([]);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [placeQuery]);

  const hasPinnedLocation = typeof formData.lat === 'number' && typeof formData.lng === 'number';

  const isStep2Valid =
    formData.city.trim().length > 0 &&
    formData.area.trim().length >= 2 &&
    formData.address.trim().length >= 5 &&
    formData.totalChairs > 0;

  const isStep3Valid = formData.businessType.trim().length > 0;

  const isStep4Valid =
    formData.bankName.trim().length > 0 &&
    (formData.accountNumber.length === 0 || formData.accountNumber.length >= 8);

  const canProceed = () => {
    if (step === 1) return isStep1Valid;
    if (step === 2) return isStep2Valid;
    if (step === 3) return isStep3Valid;
    if (step === 4) return isStep4Valid;
    return formData.agreeTerms;
  };

  const handleNext = async () => {
    // Typed the address manually without pinning? Try to geocode it so the salon gets real coordinates
    if (step === 2 && isStep2Valid && !hasPinnedLocation) {
      try {
        const hits = await searchPlaces([formData.area, formData.city].filter(Boolean).join(', '));
        const hit = hits.find((h) => typeof h.lat === 'number' && !isNaN(h.lat));
        if (hit) setFormData((prev) => ({ ...prev, lat: hit.lat, lng: hit.lng, pincode: prev.pincode || hit.pincode || '' }));
      } catch {
        /* non-blocking */
      }
    }
    if (!canProceed()) {
      if (step === 1) {
        setError(
          !(formData.category || '').trim()
            ? 'Please select or enter your business category.'
            : 'Please fill all required partner contact details (10-digit mobile & 6+ char password).'
        );
      }
      if (step === 2) setError('Please provide your salon address and location details.');
      return;
    }
    setError(null);
    if (step < 5) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      navigate('/salon/login');
    }
  };

  const handleSubmit = async () => {
    if (!formData.agreeTerms) {
      setError('Please agree to partner terms and platform commission to continue.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      await api.salons.register({
        name: formData.name.trim(),
        ownerName: formData.ownerName.trim(),
        mobile: `+91 ${formData.mobile.replace(/\D/g, '')}`,
        email: formData.email.trim(),
        password: formData.password,
        category: formData.category,
        subcategories: formData.subcategories || [],
        city: formData.city,
        area: formData.area.trim(),
        address: formData.address.trim(),
        openTime: formData.openTime,
        closeTime: formData.closeTime,
        totalChairs: Number(formData.totalChairs) || 4,
        amenities: formData.amenities,
        coverImage: formData.coverImage,
        gstin: formData.gstin.trim(),
        shopActLicense: formData.shopActLicense.trim(),
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode.toUpperCase(),
        payoutCycle: formData.payoutCycle,
        pincode: formData.pincode || '',
        lat: typeof formData.lat === 'number' ? formData.lat : undefined,
        lng: typeof formData.lng === 'number' ? formData.lng : undefined,
        organizationType: formData.organizationType || 'Independent Salon',
        parentBrandName: formData.parentBrandName || '',
        branchName: formData.branchName || ''
      });

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#881337', '#e11d48', '#fb7185', '#d97706', '#9333ea']
      });

      sessionStorage.removeItem('instaatrim_salon_reg_step');
      sessionStorage.removeItem('instaatrim_salon_reg_form');

      setTimeout(() => {
        navigate('/salon');
      }, 700);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    { num: 1, label: 'Profile', icon: Building2 },
    { num: 2, label: 'Location', icon: MapPin },
    { num: 3, label: 'KYC Docs', icon: FileCheck2 },
    { num: 4, label: 'Payouts', icon: Landmark },
    { num: 5, label: 'Launch', icon: Sparkles }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full min-h-screen bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] text-stone-900 flex justify-center antialiased select-none overflow-x-hidden"
    >
      <AuthBrandPanel
        eyebrow="Become a DrimStyle partner"
        title="Grow your salon with DrimStyle."
        subtitle="List your services, accept instant and scheduled bookings, and get paid on time."
        points={['Reach customers searching nearby, right now', 'Zero-hassle onboarding with KYC verification', 'Daily (T+1) or weekly settlements to your bank']}
        image="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80"
      />
      <div className="flex-1 min-w-0 flex justify-center lg:items-center lg:px-10 lg:py-10">
        <main className="w-full max-w-[480px] lg:max-w-[560px] min-w-0 min-h-screen lg:min-h-0 flex flex-col justify-between px-4 lg:px-9 pt-3 lg:pt-7 pb-8 relative border-x lg:border border-purple-200/50 lg:bg-white lg:rounded-3xl lg:shadow-xl lg:shadow-purple-900/5 box-border">
          {/* Top Header */}
          <header className="w-full flex items-center justify-between min-h-[38px] pb-2">
            <button
              aria-label="Back"
              onClick={handleBack}
              className="p-1 -ml-1 rounded-full text-stone-700 hover:text-black active:scale-95 transition-all"
              type="button"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2]" />
            </button>
            <div className="flex items-center gap-1.5 bg-rose-900/10 border border-rose-900/20 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-maroon" />
              <span className="text-[10px] font-bold text-brand-maroon uppercase tracking-wider">
                Partner Registration
              </span>
            </div>
            <button
              onClick={() => navigate('/salon/login')}
              className="text-[11px] font-bold text-stone-500 hover:text-brand-maroon transition-colors"
              type="button"
            >
              Log In
            </button>
          </header>

          {/* Progress Stepper */}
          <div className="my-3 px-1">
            <div className="flex items-center justify-between mb-2">
              {stepTitles.map((s) => {
                const Icon = s.icon;
                const isDone = step > s.num;
                const isCurrent = step === s.num;
                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => s.num < step && setStep(s.num)}
                    disabled={s.num > step}
                    className="flex flex-col items-center gap-1 group focus:outline-none"
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                          ? 'bg-brand-maroon text-white ring-2 ring-rose-300 scale-105 shadow-sm'
                          : 'bg-white/80 text-stone-400 border border-stone-200'
                        }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <span
                      className={`text-[9.5px] font-medium tracking-tight ${isCurrent ? 'text-brand-maroon font-bold' : isDone ? 'text-stone-700' : 'text-stone-400'
                        }`}
                    >
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="w-full bg-stone-200/80 h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-maroon via-rose-600 to-emerald-500 rounded-full"
                initial={{ width: '20%' }}
                animate={{ width: `${(step / 5) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Form Body */}
          <div className="flex-1 flex flex-col justify-start pt-1 pb-4">
            <AnimatePresence mode="wait">

              {/* ── STEP 1: Salon Profile & Contact ── */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div>
                    <h2 className="text-base font-bold text-stone-900 font-serif">Salon Profile &amp; Contact</h2>
                    <p className="text-[11px] text-stone-500">Create your official salon identity and partner account</p>
                  </div>

                  <div className="space-y-2.5">
                    {/* Salon Name */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Salon / Studio Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Looks Salon / Apple Hair Studio / Aura Lounge"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 font-medium text-xs transition-all outline-none"
                      />
                    </div>

                    {/* Business Model */}
                    <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-200/80 space-y-2">
                      <label className="text-[11px] font-bold text-stone-700 block">
                        Salon Business Model
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { label: 'Independent', val: 'Independent Salon' },
                          { label: 'Franchise', val: 'Franchise Branch' },
                          { label: 'Brand Chain', val: 'Chain Outlet' }
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => updateField('organizationType', item.val)}
                            className={`py-1.5 px-2 rounded-xl text-[10.5px] font-bold border transition-all text-center cursor-pointer ${(formData.organizationType || 'Independent Salon') === item.val
                              ? 'bg-brand-maroon text-white border-brand-maroon shadow-xs'
                              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                              }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      {(formData.organizationType === 'Franchise Branch' || formData.organizationType === 'Chain Outlet') && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Parent Brand / Chain</label>
                            <input
                              type="text"
                              placeholder="e.g. Looks, Apple, Enrich"
                              value={formData.parentBrandName || ''}
                              onChange={(e) => updateField('parentBrandName', e.target.value)}
                              className="w-full border border-stone-300 bg-white rounded-xl px-2.5 py-1.5 text-stone-900 text-[11px] outline-none focus:border-brand-maroon"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Branch / Outlet Name</label>
                            <input
                              type="text"
                              placeholder="e.g. MG Road Branch, Sector 18"
                              value={formData.branchName || ''}
                              onChange={(e) => updateField('branchName', e.target.value)}
                              className="w-full border border-stone-300 bg-white rounded-xl px-2.5 py-1.5 text-stone-900 text-[11px] outline-none focus:border-brand-maroon"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Business Category — Smart Autocomplete (same as Admin → Categories) */}
                    <div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-bold text-stone-700">
                            Business Category <span className="text-rose-600">*</span>
                          </label>
                          <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            <Sparkles className="w-2.5 h-2.5 text-purple-600" /> Smart Autocomplete
                          </span>
                        </div>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            placeholder="e.g. Hair, Nails, Facial, Spa..."
                            value={formData.category || ''}
                            onFocus={() => setShowCategorySuggestions(true)}
                            onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                setShowCategorySuggestions(false);
                              }
                            }}
                            className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl pl-3.5 pr-8 py-2.5 text-stone-900 placeholder-stone-400 font-medium text-xs transition-all outline-none"
                          />
                          {formData.category && (
                            <button
                              type="button"
                              onClick={() => handleCategoryChange('')}
                              className="absolute right-2.5 text-stone-400 hover:text-stone-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Autocomplete Suggestions Dropdown */}
                        {showCategorySuggestions && categorySuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden divide-y divide-stone-100 max-h-60 overflow-y-auto">
                            <div className="px-3 py-1.5 bg-stone-50 text-[10px] uppercase tracking-wider font-bold text-purple-700 flex items-center justify-between">
                              <span>Related Suggestions</span>
                              <span className="text-stone-400 font-normal">Click to auto-fill</span>
                            </div>
                            {categorySuggestions.map((sug, i) => (
                              <div
                                key={`${sug.slug || sug.name}-${i}`}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectCategorySuggestion(sug);
                                }}
                                className="w-full text-left p-2.5 hover:bg-purple-50/70 transition-colors flex items-center justify-between group cursor-pointer"
                              >
                                <div className="min-w-0">
                                  <div className="font-bold text-stone-900 group-hover:text-brand-maroon text-[12px] flex items-center gap-1.5">
                                    <span className="truncate">{sug.name}</span>
                                    {sug.slug && (
                                      <span className="text-[9px] px-1.5 rounded-md bg-stone-100 text-stone-500 font-mono shrink-0">
                                        /{sug.slug}
                                      </span>
                                    )}
                                  </div>
                                  {sug.tags?.length > 0 && (
                                    <p className="text-[10.5px] text-stone-500 mt-0.5 line-clamp-1">
                                      {sug.tags.slice(0, 4).join(', ')}
                                    </p>
                                  )}
                                </div>
                                <span className="text-[10px] text-purple-700 opacity-0 group-hover:opacity-100 font-medium px-2 py-0.5 rounded bg-purple-100 transition-all shrink-0 ml-2">
                                  Apply
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Subcategories: auto-filled from the selected category + custom additions */}
                      {(formData.category || '').trim() && (
                        <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-200/70 space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-purple-900 flex items-center gap-1">
                              <Tag className="w-2.5 h-2.5 text-purple-600" />
                              Subcategories / Treatments Offered
                            </span>
                            {availableSubcategories.length > 0 && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateField('subcategories', [...availableSubcategories])}
                                  className="text-[9px] text-brand-maroon hover:underline font-bold"
                                >
                                  Select All
                                </button>
                                <span className="text-stone-300">|</span>
                                <button
                                  type="button"
                                  onClick={() => updateField('subcategories', [])}
                                  className="text-[9px] text-stone-500 hover:underline font-medium"
                                >
                                  Clear
                                </button>
                              </div>
                            )}
                          </div>

                          {availableSubcategories.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {availableSubcategories.map((sub) => {
                                const isChecked = (formData.subcategories || []).includes(sub);
                                return (
                                  <button
                                    key={sub}
                                    type="button"
                                    onClick={() => toggleSubcategory(sub)}
                                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${isChecked
                                      ? 'bg-brand-maroon text-white shadow-xs font-bold ring-1 ring-brand-maroon'
                                      : 'bg-white text-stone-700 border border-purple-200/80 hover:border-purple-400'
                                      }`}
                                  >
                                    <div
                                      className={`w-3 h-3 rounded flex items-center justify-center text-[8px] ${isChecked ? 'bg-white text-brand-maroon' : 'border border-stone-300'
                                        }`}
                                    >
                                      {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                    <span>{sub}</span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[10px] text-stone-500">New category — add the treatments you offer below.</p>
                          )}

                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              placeholder="Add more (comma separated), e.g. Hair Spa, Keratin"
                              value={customSubInput}
                              onChange={(e) => setCustomSubInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addCustomSubcategories();
                                }
                              }}
                              className="flex-1 min-w-0 border border-purple-200 focus:border-brand-maroon bg-white rounded-lg px-2.5 py-1.5 text-stone-900 text-[10.5px] placeholder-stone-400 outline-none"
                            />
                            <button
                              type="button"
                              onClick={addCustomSubcategories}
                              disabled={!customSubInput.trim()}
                              className="px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold bg-brand-maroon text-white disabled:opacity-40 shrink-0"
                            >
                              Add
                            </button>
                          </div>

                          <p className="text-[9px] text-stone-400">
                            Selected: {(formData.subcategories || []).length} of {availableSubcategories.length} subcategories
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Owner + Mobile */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          Owner / Manager Name <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={formData.ownerName}
                          onChange={(e) => updateField('ownerName', e.target.value)}
                          className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 font-medium text-xs transition-all outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">
                          Mobile Number <span className="text-rose-600">*</span>
                        </label>
                        <div className="flex items-center border border-stone-300 focus-within:border-brand-maroon focus-within:ring-1 focus-within:ring-brand-maroon bg-white/95 rounded-xl px-3 py-2.5 transition-all">
                          <span className="text-stone-700 font-bold text-xs pr-1.5 select-none">+91</span>
                          <input
                            type="tel"
                            maxLength={10}
                            placeholder="10 Digits"
                            value={formData.mobile}
                            onChange={(e) => updateField('mobile', e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-transparent border-0 p-0 text-stone-900 placeholder-stone-400 font-medium text-xs focus:ring-0 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Business Email Address <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="yoursalon@drimstyle.com"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 font-medium text-xs transition-all outline-none"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Create Partner Password <span className="text-rose-600">*</span>
                      </label>
                      <div className="flex items-center border border-stone-300 focus-within:border-brand-maroon focus-within:ring-1 focus-within:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2.5 transition-all">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="At least 6 characters"
                          value={formData.password}
                          onChange={(e) => updateField('password', e.target.value)}
                          className="w-full bg-transparent border-0 p-0 text-stone-900 placeholder-stone-400 font-medium text-xs focus:ring-0 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="text-stone-400 hover:text-stone-700 shrink-0"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: Location & Facilities ── */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div>
                    <h2 className="text-base font-bold text-stone-900 font-serif">Location &amp; Facilities</h2>
                    <p className="text-[11px] text-stone-500">Help customers find and book services at your studio</p>
                  </div>

                  <div className="space-y-2.5">
                    {/* Live GPS location (same as customer app) */}
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={locateState === 'locating'}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-brand-maroon bg-rose-50/70 text-brand-maroon text-xs font-bold hover:bg-rose-100/70 transition-all disabled:opacity-60 disabled:cursor-wait"
                    >
                      {locateState === 'locating' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Fetching your current location...</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4" />
                          <span>Use Current Location (GPS)</span>
                        </>
                      )}
                    </button>
                    {locateError && (
                      <p className="text-[10.5px] text-red-600 flex items-start gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{locateError}</span>
                      </p>
                    )}

                    {/* Search salon location */}
                    <div className="relative">
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Or Search Your Salon Location
                      </label>
                      <div className="relative flex items-center">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search area, landmark or city (e.g. Vijay Nagar Indore)"
                          value={placeQuery}
                          onChange={(e) => setPlaceQuery(e.target.value)}
                          className="w-full pl-8 pr-8 py-2.5 border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white rounded-xl text-stone-900 text-xs placeholder-stone-400 outline-none transition-all"
                        />
                        {isSearchingPlaces ? (
                          <Loader2 className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 animate-spin" />
                        ) : placeQuery ? (
                          <button
                            type="button"
                            onClick={() => setPlaceQuery('')}
                            className="absolute right-2.5 text-stone-400 hover:text-stone-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </div>
                      {placeResults.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden divide-y divide-stone-100 max-h-60 overflow-y-auto">
                          <div className="px-3 py-1.5 bg-stone-50 text-[10px] uppercase tracking-wider font-bold text-stone-500">
                            Matching Places
                          </div>
                          {placeResults.map((p, i) => (
                            <button
                              key={`${p.lat}-${p.lng}-${i}`}
                              type="button"
                              onClick={() => {
                                applyPickedLocation(p);
                                setPlaceQuery('');
                                setPlaceResults([]);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-purple-50/60 flex items-start gap-2"
                            >
                              <MapPin className="w-3.5 h-3.5 text-brand-maroon shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="text-xs font-bold text-stone-900 block truncate">{p.area}</span>
                                <span className="text-[10px] text-stone-500 block truncate">{p.address}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {hasPinnedLocation && (
                      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                        <span className="text-[10.5px] text-emerald-800 font-semibold flex items-center gap-1.5 min-w-0">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            Location pinned ({formData.lat.toFixed(5)}, {formData.lng.toFixed(5)})
                            {formData.pincode ? ` · PIN ${formData.pincode}` : ''}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, lat: null, lng: null }))}
                          className="text-[10px] text-stone-500 hover:text-red-600 underline shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {/* City */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        City <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Indore, Bhopal, Patna..."
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 font-medium text-xs transition-all outline-none"
                      />
                    </div>

                    {/* Area */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Area / Neighborhood <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. South Tukoganj, Vijay Nagar, Palasia"
                        value={formData.area}
                        onChange={(e) => updateField('area', e.target.value)}
                        className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 font-medium text-xs transition-all outline-none"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Complete Street Address &amp; Landmark <span className="text-rose-600">*</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Plot 14, Opposite Treasure Island Mall, MG Road"
                        value={formData.address}
                        onChange={(e) => updateField('address', e.target.value)}
                        className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2 text-stone-900 placeholder-stone-400 font-medium text-xs transition-all outline-none resize-none"
                      />
                    </div>

                    {/* Open / Close Time */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">Opening Time</label>
                        <input
                          type="text"
                          placeholder="09:30 AM"
                          value={formData.openTime}
                          onChange={(e) => updateField('openTime', e.target.value)}
                          className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3 py-2 text-stone-900 font-medium text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">Closing Time</label>
                        <input
                          type="text"
                          placeholder="08:30 PM"
                          value={formData.closeTime}
                          onChange={(e) => updateField('closeTime', e.target.value)}
                          className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3 py-2 text-stone-900 font-medium text-xs outline-none"
                        />
                      </div>
                    </div>

                    {/* Total Chairs */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-bold text-stone-700">Total Styling Chairs / Stations</label>
                        <span className="text-xs font-bold text-brand-maroon">{formData.totalChairs} Chairs</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={15}
                        value={formData.totalChairs}
                        onChange={(e) => updateField('totalChairs', Number(e.target.value))}
                        className="w-full accent-brand-maroon cursor-pointer"
                      />
                    </div>

                    {/* Amenities */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1.5">
                        Amenities Offered
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {AMENITY_LIST.map((amenity) => {
                          const isChecked = formData.amenities.includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => toggleAmenity(amenity)}
                              className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-medium text-left border flex items-center gap-1.5 transition-all ${isChecked
                                ? 'bg-rose-50 border-brand-maroon text-brand-maroon font-bold'
                                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                                }`}
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${isChecked ? 'bg-brand-maroon text-white' : 'border border-stone-300'
                                  }`}
                              >
                                {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="truncate">{amenity}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: KYC Docs ── */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div>
                    <h2 className="text-base font-bold text-stone-900 font-serif">Business KYC &amp; Verification</h2>
                    <p className="text-[11px] text-stone-500">Fast-track verification badge for customer trust</p>
                  </div>

                  <div className="space-y-2.5">
                    {/* Business Structure */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">Business Structure</label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => updateField('businessType', e.target.value)}
                        className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2.5 text-stone-900 font-medium text-xs outline-none"
                      >
                        <option value="Sole Proprietorship">Sole Proprietorship / Individual</option>
                        <option value="Partnership Firm">Partnership Firm</option>
                        <option value="Private Limited Company">Private Limited Company (Pvt Ltd)</option>
                        <option value="LLP">Limited Liability Partnership (LLP)</option>
                      </select>
                    </div>

                    {/* GSTIN */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        GSTIN (Optional / Tax ID)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 23AABCU9603R1ZM"
                        value={formData.gstin}
                        onChange={(e) => updateField('gstin', e.target.value.toUpperCase())}
                        className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 font-mono text-xs outline-none"
                      />
                    </div>

                    {/* Shop Act License */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Shop &amp; Establishment License / Trade ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. IND-MP-2025-9921"
                        value={formData.shopActLicense}
                        onChange={(e) => updateField('shopActLicense', e.target.value.toUpperCase())}
                        className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 font-mono text-xs outline-none"
                      />
                    </div>

                    {/* Salon Cover Photo */}
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1.5">
                        Salon Storefront &amp; Ambience Photo
                      </label>
                      <div className="relative rounded-2xl overflow-hidden border border-stone-300 bg-stone-900 group h-32 flex items-center justify-center">
                        {formData.coverImage ? (
                          <>
                            <img
                              src={formData.coverImage}
                              alt="Salon Cover Preview"
                              className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                              <span className="text-white text-xs font-bold drop-shadow">
                                {formData.name || 'Your Salon Front'}
                              </span>
                              <span className="text-[10px] bg-white/20 backdrop-blur-md text-white font-medium px-2 py-0.5 rounded-full border border-white/30">
                                Cover Photo Active
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-stone-500">
                            <Camera className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs font-medium">No Image Selected</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
                                const result = await window.flutter_inappwebview.callHandler('openCamera');
                                if (result && result.success) {
                                  updateField('coverImage', `data:${result.mimeType};base64,${result.base64}`);
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
                                    reader.onload = (ev) => updateField('coverImage', ev.target.result);
                                    reader.readAsDataURL(file);
                                  }
                                };
                                input.click();
                              }
                            } catch (err) {
                              console.error('Camera error:', err);
                            }
                          }}
                          className="flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg border border-brand-maroon bg-brand-maroon text-white flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          Take Photo
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
                                reader.onload = (ev) => updateField('coverImage', ev.target.result);
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}
                          className="flex-1 py-1.5 px-2 text-[11px] font-semibold rounded-lg border border-stone-300 bg-white text-stone-700 flex items-center justify-center gap-1.5 hover:bg-stone-50 transition-all"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload from Gallery
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 4: Bank / Payouts ── */}
              {step === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div>
                    <h2 className="text-base font-bold text-stone-900 font-serif">Direct Bank Settlements</h2>
                    <p className="text-[11px] text-stone-500">Automated payouts for walk-ins &amp; online bookings</p>
                  </div>

                  <div className="bg-gradient-to-tr from-rose-900 to-stone-900 text-white rounded-2xl p-3.5 shadow-xs relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-rose-200 font-bold uppercase tracking-wider block">
                          Direct Payout Account
                        </span>
                        <h4 className="text-sm font-bold mt-0.5">{formData.name || 'Salon Partner'}</h4>
                      </div>
                      <Landmark className="w-5 h-5 text-amber-300" />
                    </div>
                    <div className="mt-3.5 flex justify-between items-end">
                      <div>
                        <span className="text-[9px] text-rose-200/80 uppercase">Settlement Bank</span>
                        <p className="text-xs font-semibold">
                          {formData.bankName ? `${formData.bankName} ` : 'No Bank Selected'}
                          {formData.accountNumber ? `••••${formData.accountNumber.slice(-4)}` : ''}
                        </p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                        Verified UPI / IMPS
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Account Beneficiary Name
                      </label>
                      <input
                        type="text"
                        placeholder={formData.ownerName || 'Account Holder Name'}
                        value={formData.accountHolderName}
                        onChange={(e) => updateField('accountHolderName', e.target.value)}
                        className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 font-medium text-xs outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">Bank Name</label>
                        <select
                          value={formData.bankName}
                          onChange={(e) => updateField('bankName', e.target.value)}
                          className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3 py-2 text-stone-900 font-medium text-xs outline-none"
                        >
                          <option value="">Select Bank</option>
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="State Bank of India">State Bank of India</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">IFSC Code</label>
                        <input
                          type="text"
                          placeholder="HDFC0001032"
                          value={formData.ifscCode}
                          onChange={(e) => updateField('ifscCode', e.target.value.toUpperCase())}
                          className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3 py-2 text-stone-900 font-mono text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Bank Account Number
                      </label>
                      <div className="flex items-center border border-stone-300 focus-within:border-brand-maroon focus-within:ring-1 focus-within:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2.5 transition-all">
                        <input
                          type={showAccount ? 'text' : 'password'}
                          placeholder="Enter 9-18 digit account number"
                          value={formData.accountNumber}
                          onChange={(e) => updateField('accountNumber', e.target.value)}
                          className="w-full bg-transparent border-0 p-0 text-stone-900 placeholder-stone-400 font-medium text-xs focus:ring-0 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAccount((v) => !v)}
                          className="text-stone-400 hover:text-stone-700 shrink-0"
                        >
                          {showAccount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">Payout Frequency</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Daily Automated (T+1)', 'Weekly Batch Settlement'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => updateField('payoutCycle', p)}
                            className={`p-2 rounded-xl text-left border text-xs font-semibold transition-all ${formData.payoutCycle.startsWith(p.slice(0, 5))
                              ? 'bg-rose-50 border-brand-maroon text-brand-maroon ring-1 ring-brand-maroon'
                              : 'bg-white border-stone-200 text-stone-700'
                              }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 5: Review & Launch ── */}
              {step === 5 && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div>
                    <h2 className="text-base font-bold text-stone-900 font-serif">Review &amp; Go Live</h2>
                    <p className="text-[11px] text-stone-500">Your partner account is ready to activate and receive bookings</p>
                  </div>

                  <div className="bg-white rounded-2xl p-3.5 border border-purple-200 shadow-2xs space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={formData.coverImage}
                        alt="Salon"
                        className="w-14 h-14 rounded-xl object-cover border border-stone-200 shadow-2xs shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-stone-900 truncate">
                            {formData.name || 'Aura Salon'}
                          </span>
                          <span className="text-[8.5px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full shrink-0 border border-amber-300/60">
                            PENDING APPROVAL
                          </span>
                        </div>
                        <p className="text-[10.5px] text-stone-500 mt-0.5 truncate">
                          {formData.area}, {formData.city} • {formData.category}
                        </p>
                        {formData.subcategories && formData.subcategories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {formData.subcategories.slice(0, 3).map((sub, sIdx) => (
                              <span key={sIdx} className="text-[8.5px] bg-purple-50 text-purple-700 font-semibold px-1.5 py-0.2 rounded border border-purple-200">
                                {sub}
                              </span>
                            ))}
                            {formData.subcategories.length > 3 && (
                              <span className="text-[8.5px] text-stone-400">+{formData.subcategories.length - 3} more</span>
                            )}
                          </div>
                        )}
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5 truncate">
                          Owner: {formData.ownerName} ({formData.mobile ? `+91 ${formData.mobile}` : '+91 9876543210'})
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-stone-100 pt-2.5 grid grid-cols-3 gap-2 text-center text-stone-800">
                      <div className="bg-stone-50 rounded-lg p-1.5">
                        <span className="text-[9px] text-stone-400 block">Chairs</span>
                        <span className="text-xs font-bold text-brand-maroon">{formData.totalChairs} Styling</span>
                      </div>
                      <div className="bg-stone-50 rounded-lg p-1.5">
                        <span className="text-[9px] text-stone-400 block">Hours</span>
                        <span className="text-[10.5px] font-bold text-stone-700 truncate block">
                          {formData.openTime.slice(0, 5)} - {formData.closeTime.slice(0, 5)}
                        </span>
                      </div>
                      <div className="bg-stone-50 rounded-lg p-1.5">
                        <span className="text-[9px] text-stone-400 block">Commission</span>
                        <span className="text-[9px] font-bold text-amber-600">Pending Admin</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3 space-y-1.5 text-stone-800">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-brand-maroon">
                      <BadgePercent className="w-4 h-4" />
                      <span>Onboarding &amp; Admin Approval Process</span>
                    </div>
                    <ul className="text-[10.5px] text-stone-600 space-y-1 leading-snug pl-4 list-disc">
                      <li>Upon submission, your salon application is reviewed by the DrimStyle Admin team.</li>
                      <li>First approval from the admin is required before your salon can list treatments.</li>
                      <li>Commission rate will be decided by Admin upon approval.</li>
                    </ul>
                  </div>

                  <label className="flex items-start gap-2.5 p-2 rounded-xl bg-white/70 border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => updateField('agreeTerms', e.target.checked)}
                      className="mt-0.5 accent-brand-maroon rounded"
                    />
                    <span className="text-[10.5px] text-stone-600 leading-snug">
                      I agree to the <span className="font-bold text-brand-maroon">Partner Agreement</span>, platform service standards, and confirm that all submitted salon credentials are accurate.
                    </span>
                  </label>
                </motion.div>
              )}

            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-2.5"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-700 leading-snug">{error}</p>
              </motion.div>
            )}

            <div className="mt-4 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleNext}
                className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${isSubmitting
                  ? 'bg-stone-400 text-white cursor-wait'
                  : 'bg-gradient-to-r from-brand-maroon via-[#981438] to-brand-darkMaroon hover:from-[#721528] hover:to-[#55101f] text-white active:scale-98 cursor-pointer'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Activating Partner Account...</span>
                  </>
                ) : step === 5 ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit &amp; Launch Salon Dashboard</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          <footer className="w-full text-center text-[10px] text-stone-400 leading-relaxed px-2 pt-2">
            Need partner support? Call our onboarding desk at{' '}
            <a className="text-brand-maroon font-bold hover:underline" href="tel:18001239999">
              1800-123-9999
            </a>
          </footer>
        </main>
      </div>
    </motion.div>
  );
};
