import React, { useState } from 'react';
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
  BadgePercent
} from 'lucide-react';
import { api } from '../../../shared/services/api';

const CATEGORY_OPTIONS = [
  { id: 'Unisex', label: 'Unisex Salon & Spa', desc: 'Hair, beauty & spa for all genders', icon: '✨' },
  { id: 'Women Only', label: 'Women Only Salon', desc: 'Exclusive hair, waxing & bridal', icon: '💇‍♀️' },
  { id: 'Men Only', label: "Men's Grooming Lounge", desc: 'Haircut, beard styling & spa', icon: '💈' },
  { id: 'Luxury Spa', label: 'Luxury Wellness Spa', desc: 'Aromatherapy, massage & rituals', icon: '💆' }
];

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

const POPULAR_CITIES = ['Indore', 'Bhopal', 'Mumbai', 'Pune', 'Delhi NCR', 'Bangalore'];

export const SalonRegistrationPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Unisex',
    ownerName: '',
    mobile: '',
    email: '',
    password: '',
    city: 'Indore',
    area: '',
    address: '',
    openTime: '09:30 AM',
    closeTime: '08:30 PM',
    totalChairs: 4,
    amenities: ['AC & Ambient Music', 'Sanitized Kits & Tools', 'Card/UPI/Contactless'],
    businessType: 'Sole Proprietorship',
    gstin: '',
    shopActLicense: '',
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    accountHolderName: '',
    bankName: 'HDFC Bank',
    accountNumber: '',
    ifscCode: '',
    payoutCycle: 'Daily Automated',
    agreeTerms: true
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
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
    formData.ownerName.trim().length >= 2 &&
    formData.mobile.replace(/\D/g, '').length === 10 &&
    formData.email.includes('@') &&
    formData.password.length >= 6;

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

  const handleNext = () => {
    if (!canProceed()) {
      if (step === 1) setError('Please fill all required partner contact details (10-digit mobile & 6+ char password).');
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
        city: formData.city,
        area: formData.area.trim(),
        address: formData.address.trim(),
        openTime: formData.openTime,
        closeTime: formData.closeTime,
        totalChairs: Number(formData.totalChairs) || 4,
        amenities: formData.amenities,
        coverImage: formData.coverImage,
        gstin: formData.gstin.trim() || '23AABCU9603R1ZM',
        shopActLicense: formData.shopActLicense.trim() || 'IND-MP-2025-9921',
        bankName: formData.bankName,
        accountNumber: formData.accountNumber || '4892789123',
        ifscCode: formData.ifscCode.toUpperCase() || 'HDFC0001032'
      });

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#881337', '#e11d48', '#fb7185', '#d97706', '#9333ea']
      });

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
      <main className="w-full max-w-[480px] min-w-0 min-h-screen flex flex-col justify-between px-4 pt-3 pb-8 relative border-x border-purple-200/50 box-border">
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
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-2xs ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-brand-maroon text-white ring-2 ring-rose-300 scale-105 shadow-sm'
                        : 'bg-white/80 text-stone-400 border border-stone-200'
                    }`}
                  >
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className={`text-[9.5px] font-medium tracking-tight ${
                      isCurrent ? 'text-brand-maroon font-bold' : isDone ? 'text-stone-700' : 'text-stone-400'
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
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      Salon / Studio Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aura Beauty Lounge & Spa"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 font-medium text-xs transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1.5">
                      Business Category <span className="text-rose-600">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORY_OPTIONS.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => updateField('category', cat.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            formData.category === cat.id
                              ? 'border-brand-maroon bg-rose-50/70 ring-1 ring-brand-maroon'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <span className="text-sm block mb-0.5">{cat.icon}</span>
                          <span className="text-xs font-bold text-stone-900 block leading-tight">{cat.label}</span>
                          <span className="text-[9.5px] text-stone-500 font-normal leading-snug mt-0.5 block">
                            {cat.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

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

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      Business Email Address <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="yoursalon@instaatrim.com"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 font-medium text-xs transition-all outline-none"
                    />
                  </div>

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
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">City</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {POPULAR_CITIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateField('city', c)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            formData.city === c
                              ? 'bg-brand-maroon text-white shadow-2xs'
                              : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

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

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1.5">Amenities Offered</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {AMENITY_LIST.map((amenity) => {
                        const isChecked = formData.amenities.includes(amenity);
                        return (
                          <button
                            key={amenity}
                            type="button"
                            onClick={() => toggleAmenity(amenity)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-medium text-left border flex items-center gap-1.5 transition-all ${
                              isChecked
                                ? 'bg-rose-50 border-brand-maroon text-brand-maroon font-bold'
                                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${
                                isChecked ? 'bg-brand-maroon text-white' : 'border border-stone-300'
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

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1.5">
                      Salon Storefront &amp; Ambience Photo
                    </label>
                    <div className="relative rounded-2xl overflow-hidden border border-stone-300 bg-stone-900 group">
                      <img
                        src={formData.coverImage}
                        alt="Salon Cover Preview"
                        className="w-full h-32 object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex items-end justify-between p-3">
                        <span className="text-white text-xs font-bold drop-shadow">
                          {formData.name || 'Your Salon Front'}
                        </span>
                        <span className="text-[10px] bg-white/20 backdrop-blur-md text-white font-medium px-2 py-0.5 rounded-full border border-white/30">
                          Cover Photo Active
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[
                        {
                          label: 'Luxury Salon',
                          url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'
                        },
                        {
                          label: 'Modern Studio',
                          url: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80'
                        },
                        {
                          label: 'Wellness Spa',
                          url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
                        }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => updateField('coverImage', preset.url)}
                          className={`flex-1 py-1 px-1.5 text-[10px] font-semibold rounded-lg border transition-all truncate ${
                            formData.coverImage === preset.url
                              ? 'bg-rose-100 text-brand-maroon border-brand-maroon'
                              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

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
                      <p className="text-xs font-semibold">{formData.bankName} ••••4892</p>
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
                    <input
                      type="password"
                      placeholder="Enter 9-18 digit account number"
                      value={formData.accountNumber}
                      onChange={(e) => updateField('accountNumber', e.target.value)}
                      className="w-full border border-stone-300 focus:border-brand-maroon focus:ring-1 focus:ring-brand-maroon bg-white/95 rounded-xl px-3.5 py-2.5 text-stone-900 placeholder-stone-400 font-medium text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">Payout Frequency</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Daily Automated (T+1)', 'Weekly Batch Settlement'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => updateField('payoutCycle', p)}
                          className={`p-2 rounded-xl text-left border text-xs font-semibold transition-all ${
                            formData.payoutCycle.startsWith(p.slice(0, 5))
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
                        <span className="text-[8.5px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          VERIFIED
                        </span>
                      </div>
                      <p className="text-[10.5px] text-stone-500 mt-0.5 truncate">
                        {formData.area}, {formData.city} • {formData.category}
                      </p>
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
                      <span className="text-xs font-bold text-emerald-700">12% Flat</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3 space-y-1.5 text-stone-800">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-maroon">
                    <BadgePercent className="w-4 h-4" />
                    <span>Transparent Partner Commercials</span>
                  </div>
                  <ul className="text-[10.5px] text-stone-600 space-y-1 leading-snug pl-4 list-disc">
                    <li>Zero upfront registration or setup fees.</li>
                    <li>Flat 12% commission per completed online &amp; instant booking.</li>
                    <li>Daily automated settlement to your {formData.bankName} account.</li>
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
              className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                isSubmitting
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
    </motion.div>
  );
};
