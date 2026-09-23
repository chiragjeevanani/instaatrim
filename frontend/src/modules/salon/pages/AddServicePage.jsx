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
  AlertCircle
} from 'lucide-react';

export const AddServicePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addService, updateService, services, salonProfile, categories: dynamicCategories, showToast } = useSalon();

  const isApproved = Boolean(salonProfile?.isVerified && salonProfile?.verificationStatus === 'Live');
  const isRejected = salonProfile?.verificationStatus === 'Rejected';

  const editingServiceId = location.state?.serviceId;
  const existingService = services.find((s) => s.id === editingServiceId);

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

  const [name, setName] = useState('');
  const [category, setCategory] = useState(availableCategories[0] || 'Waxing');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('45 mins');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [isInstantEligible, setIsInstantEligible] = useState(true);

  useEffect(() => {
    if (existingService) {
      setName(existingService.name || '');
      setCategory(existingService.category || availableCategories[0] || 'Waxing');
      setDescription(existingService.description || '');
      setDuration(existingService.duration || '45 mins');
      setPrice(existingService.price || '');
      setOriginalPrice(existingService.originalPrice || '');
      setIsInstantEligible(existingService.isInstantEligible ?? true);
    } else if (availableCategories.length > 0 && !category) {
      setCategory(availableCategories[0]);
    }
  }, [existingService, availableCategories]);

  const durations = [
    '20 mins',
    '30 mins',
    '45 mins',
    '1 hr',
    '1 hr 15 mins',
    '1 hr 30 mins',
    '2 hrs'
  ];

  const calculatedDiscount =
    price && originalPrice && Number(originalPrice) > Number(price)
      ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
      : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isApproved) {
      showToast('Admin approval required before listing services', 'error');
      return;
    }
    if (!name.trim() || !price) return;

    const servicePayload = {
      name: name.trim(),
      category,
      description: description.trim(),
      duration,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Math.round(Number(price) * 1.3),
      isInstantEligible,
      image:
        existingService?.image ||
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
    };

    if (existingService) {
      updateService(existingService.id, servicePayload);
    } else {
      addService(servicePayload);
    }
    navigate('/salon/services');
  };

  if (!isApproved) {
    return (
      <div className="w-full max-w-[480px] min-w-0 bg-transparent font-sans text-stone-900 antialiased min-h-screen flex flex-col justify-between mx-auto box-border">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#f8f4fb]/95 backdrop-blur-md px-4 py-2.5 border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/salon/services')}
              className="w-8 h-8 rounded-full bg-white hover:bg-stone-50 active:scale-95 text-stone-700 border border-purple-200/60 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
            <div>
              <h1 className="text-[14px] font-bold text-stone-900 tracking-tight leading-none">
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

        <main className="p-4 flex-1 flex flex-col items-center justify-center text-center">
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
    <div className="w-full max-w-[480px] min-w-0 bg-transparent font-sans text-stone-900 antialiased min-h-screen flex flex-col justify-between mx-auto box-border">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#f8f4fb]/95 backdrop-blur-md px-4 py-2.5 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/salon/services')}
            className="w-8 h-8 rounded-full bg-white hover:bg-stone-50 active:scale-95 text-stone-700 border border-purple-200/60 flex items-center justify-center transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-[14px] font-bold text-stone-900 tracking-tight leading-none">
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
      <main className="p-3.5 pb-28 flex-1 space-y-3">
        <form id="service-form" onSubmit={handleSubmit} className="space-y-3">
          {/* Card 1: Title & Category */}
          <div className="bg-white rounded-2xl p-3.5 border border-purple-100/80 shadow-xs space-y-3">
            <div>
              <label className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                Service Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lotus Crystal Radiance Facial"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#faf7fc] text-xs text-stone-900 placeholder:text-stone-400 rounded-xl border border-purple-100 px-3 py-2.5 outline-none focus:bg-white focus:border-rose-900 focus:ring-1 focus:ring-rose-900/30 transition-all font-medium"
              />
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

          {/* Card 2: Pricing & Yield */}
          <div className="bg-white rounded-2xl p-3.5 border border-purple-100/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider block">
                Pricing &amp; Margins
              </span>
              {calculatedDiscount !== null && calculatedDiscount > 0 && (
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <Sparkles className="w-2.5 h-2.5 stroke-[2]" />
                  <span>{calculatedDiscount}% client discount</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-semibold text-stone-500 block mb-1">
                  Selling Price (₹) <span className="text-rose-600">*</span>
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
              </div>

              <div>
                <label className="text-[10px] font-semibold text-stone-500 block mb-1">
                  Original Price (₹)
                </label>
                <div className="flex items-center bg-[#faf7fc] rounded-xl border border-purple-100 px-2.5 py-2 focus-within:bg-white focus-within:border-rose-900 focus-within:ring-1 focus-within:ring-rose-900/30 transition-all">
                  <IndianRupee className="w-3.5 h-3.5 text-stone-400 mr-1 shrink-0" />
                  <input
                    type="number"
                    placeholder="1299"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full bg-transparent text-xs text-stone-600 outline-none font-semibold"
                  />
                </div>
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
      <footer className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-purple-100/80 shadow-lg">
        <div className="max-w-[480px] mx-auto flex items-center gap-2.5">
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
