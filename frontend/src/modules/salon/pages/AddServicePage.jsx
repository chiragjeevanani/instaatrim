import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { CategoryRequestPanel } from '../components/CategoryRequestPanel';
import { api } from '../../../shared/services/api';
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

  // ── Categories: 100% from DB (admin-defined). Salon's own onboarding category first. ──
  const salonIdStr = String(salonProfile?.id || salonProfile?._id || '');
  const salonCategoryName = String(salonProfile?.categoryName || salonProfile?.category || '').trim();
  const salonSubcategories = Array.isArray(salonProfile?.subcategories) ? salonProfile.subcategories : [];

  const dbCategoryList = useMemo(() => {
    const own = salonCategoryName.toLowerCase();
    const visible = (dynamicCategories || []).filter((c) => {
      if (!c?.name) return false;
      // Global categories + categories admin assigned to this salon
      const cs = c.salonId ? String(c.salonId._id || c.salonId.id || c.salonId) : '';
      return !cs || cs === 'all' || cs === salonIdStr;
    });
    return [...visible].sort(
      (a, b) => Number(b.name.trim().toLowerCase() === own) - Number(a.name.trim().toLowerCase() === own)
    );
  }, [dynamicCategories, salonCategoryName, salonIdStr]);

  const availableCategories = dbCategoryList.map((c) => c.name);
  const findDbCategory = (catName) =>
    dbCategoryList.find((c) => c.name.trim().toLowerCase() === String(catName || '').trim().toLowerCase());

  // ── Auto-fill suggestions: built from DB (category tags + this salon's onboarding services) ──
  const DYNAMIC_TEMPLATES = useMemo(() => {
    const list = [];
    const seen = new Set();
    const push = (tag, cat, isOwn) => {
      const key = `${String(tag).trim().toLowerCase()}|${cat.name.toLowerCase()}`;
      if (!String(tag).trim() || seen.has(key)) return;
      seen.add(key);
      list.push({ name: String(tag).trim(), category: cat.name, description: cat.description || '', isOwn });
    };

    const ownCat = findDbCategory(salonCategoryName);
    const ownTagsLower = salonSubcategories.map((s) => String(s).toLowerCase());

    // 1) Services the salon selected at onboarding
    salonSubcategories.forEach((sub) => {
      const cat =
        dbCategoryList.find((c) => (c.serviceCategories || []).some((t) => String(t).toLowerCase() === String(sub).toLowerCase())) ||
        ownCat;
      if (cat) push(sub, cat, true);
    });
    // 2) Every admin category's sub-services (salon's own category first — list is pre-sorted)
    dbCategoryList.forEach((cat) => {
      (Array.isArray(cat.serviceCategories) ? cat.serviceCategories : []).forEach((tag) =>
        push(tag, cat, ownTagsLower.includes(String(tag).toLowerCase()))
      );
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbCategoryList, salonCategoryName, salonSubcategories.join('|')]);

  // ── Duration helpers (backend stores minutes) ──
  const formatDuration = (mins) => {
    const m = Number(mins);
    if (!m || isNaN(m)) return '';
    const h = Math.floor(m / 60);
    const r = m % 60;
    const hPart = h ? `${h} ${h === 1 ? 'hr' : 'hrs'}` : '';
    const mPart = r ? `${r} mins` : '';
    return [hPart, mPart].filter(Boolean).join(' ');
  };
  const BASE_DURATIONS = [15, 20, 30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240, 300, 360].map(formatDuration);
  const normalizeDuration = (d) => (typeof d === 'number' ? formatDuration(d) : d || '');

  const [name, setName] = useState('');
  const [category, setCategory] = useState(availableCategories[0] || '');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('45 mins');
  const [price, setPrice] = useState('');
  const [isInstantEligible, setIsInstantEligible] = useState(true);
  const [image, setImage] = useState(null);
  const [showAutofillSuggestions, setShowAutofillSuggestions] = useState(false);

  const durations = BASE_DURATIONS.includes(duration) || !duration ? BASE_DURATIONS : [...BASE_DURATIONS, duration];

  useEffect(() => {
    if (existingService) {
      setName(existingService.name || existingService.title || '');
      setCategory(existingService.category || availableCategories[0] || '');
      setSubcategory(existingService.subcategory || '');
      setDescription(existingService.description || '');
      setDuration(normalizeDuration(existingService.duration) || '45 mins');
      setPrice(existingService.price || '');
      setIsInstantEligible(existingService.isInstantEligible ?? true);
      setImage(existingService.image || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingService?.id]);

  // Always pull the latest admin categories from DB when the page opens
  useEffect(() => {
    api.categories.list().catch(() => {});
  }, []);

  // DB categories load async — default to the salon's own category once they arrive
  useEffect(() => {
    if (!existingService && !category && availableCategories.length > 0) {
      setCategory(availableCategories[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableCategories.join('|')]);

  // Sub-services of the selected category (DB) — used for manual entry chips
  const selectedCategoryTags = findDbCategory(category)?.serviceCategories || [];

  // Track currently applied template if any
  const [appliedTemplateName, setAppliedTemplateName] = useState('');

  // Auto-fill: title + category + sub-category (+ category description if empty).
  // Price, duration & photo are the salon's own — never auto-filled.
  const handleApplyTemplate = (tmpl) => {
    setName(tmpl.name);
    setAppliedTemplateName(tmpl.name);
    setCategory(tmpl.category);
    setSubcategory(tmpl.name);
    if (!description.trim() && tmpl.description) setDescription(tmpl.description);
    setShowAutofillSuggestions(false);
    showToast(`Autofilled "${tmpl.name}" — now add your price & duration`);
  };

  // Manual: pick a sub-service chip of the chosen category
  const handlePickSubcategory = (tag) => {
    if (subcategory === tag) {
      setSubcategory('');
      return;
    }
    setSubcategory(tag);
    if (!name.trim()) setName(tag);
  };

  // Clear / remove applied template details
  const handleClearTemplate = () => {
    setName('');
    setAppliedTemplateName('');
    setCategory(availableCategories[0] || '');
    setSubcategory('');
    setDescription('');
    setDuration('45 mins');
    setPrice('');
    setImage(null);
    setShowAutofillSuggestions(false);
    showToast('Form reset.');
  };

  // Filter suggestions matching current input (title, category, or word match)
  const matchingTemplates = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return DYNAMIC_TEMPLATES;
    const tokens = q.split(/[\s,/&+-]+/).filter((t) => t.length > 1);
    return DYNAMIC_TEMPLATES.filter((t) => {
      const n = t.name.toLowerCase();
      const c = t.category.toLowerCase();
      return n.includes(q) || c.includes(q) || tokens.some((tok) => n.includes(tok) || c.includes(tok));
    });
  }, [name, DYNAMIC_TEMPLATES]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isApproved) {
      showToast('Admin approval required before listing services', 'error');
      return;
    }
    if (!name.trim() || !price) return;
    if (!category) {
      showToast('Please select a category', 'error');
      return;
    }

    const basePrice = Number(price);

    const servicePayload = {
      name: name.trim(),
      category,
      subcategory: subcategory || '',
      description: description.trim(),
      duration,
      price: basePrice,
      originalPrice: basePrice,
      isInstantEligible,
      // Salon's own photo only — no stock image fallback
      image: image || existingService?.image || ''
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
                  placeholder="Pick from catalog or type your own service name..."
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
                      <Sparkles className="w-3 h-3 text-rose-900" /> Auto-fill from DrimStyle Catalog
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
                    {matchingTemplates.length === 0 && (
                      <p className="text-[10.5px] text-stone-500 px-1 py-2 leading-snug">
                        {DYNAMIC_TEMPLATES.length === 0
                          ? 'No catalog services yet — type your service title manually.'
                          : `No catalog match for "${name}". Continue typing to add it manually.`}
                      </p>
                    )}
                    {matchingTemplates.map((tmpl, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="w-full text-left p-2 rounded-xl hover:bg-purple-100/60 active:scale-[0.99] transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-stone-900 group-hover:text-rose-950 truncate">
                              {tmpl.name}
                            </p>
                            <p className="text-[9.5px] text-stone-500 truncate">
                              {tmpl.category}
                              {tmpl.isOwn && <span className="text-emerald-700 font-semibold"> • Your menu</span>}
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
              {availableCategories.length === 0 ? (
                <p className="text-[10.5px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  No categories available yet. Please ask DrimStyle admin to add service categories.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {availableCategories.map((cat) => {
                    const isSelected = category === cat;
                    const isOwn = cat.trim().toLowerCase() === salonCategoryName.toLowerCase();
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => {
                          if (cat !== category) setSubcategory('');
                          setCategory(cat);
                        }}
                        className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${isSelected
                          ? 'bg-rose-900 text-white border-rose-900 shadow-2xs scale-[1.02]'
                          : 'bg-[#faf7fc] text-stone-600 border-purple-100 hover:bg-stone-100'
                          }`}
                      >
                        {cat}
                        {isOwn && <span className={isSelected ? 'text-rose-200' : 'text-emerald-700'}> ★</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sub-service chips of the selected category (DB) — optional */}
            {selectedCategoryTags.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider">
                    Sub-category <span className="text-stone-400 normal-case font-medium">(optional)</span>
                  </label>
                  {subcategory && <span className="text-[10px] font-semibold text-rose-900">{subcategory}</span>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCategoryTags.map((tag) => {
                    const isSelected = subcategory === tag;
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handlePickSubcategory(tag)}
                        className={`text-[10.5px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${isSelected
                          ? 'bg-purple-700 text-white border-purple-700'
                          : 'bg-white text-stone-600 border-purple-100 hover:border-purple-300'
                          }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Missing category / sub-category → request admin (DB, real-time status) */}
            <CategoryRequestPanel
              categories={dbCategoryList}
              currentCategory={category}
              suggestedName={!appliedTemplateName && matchingTemplates.length === 0 ? name.trim() : ''}
              showToast={showToast}
            />

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

          {/* Card 2: Pricing */}
          <div className="bg-white rounded-2xl p-3.5 border border-purple-100/80 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider block">
                Salon Pricing
              </span>
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
                <label className="text-[10px] font-semibold text-stone-700 block mb-1">
                  Customer Display Price (₹)
                </label>
                <div className="flex items-center bg-stone-100/80 rounded-xl border border-stone-200/70 px-2.5 py-2 cursor-not-allowed">
                  <IndianRupee className="w-3.5 h-3.5 text-stone-400 mr-1 shrink-0" />
                  <input
                    type="number"
                    readOnly
                    disabled
                    value={price || ''}
                    className="w-full bg-transparent text-xs text-stone-700 outline-none font-bold cursor-not-allowed"
                    placeholder="Same as your price"
                  />
                </div>
                <p className="text-[9.5px] text-stone-400 mt-1 leading-tight">
                  Display price customers will see directly for this service.
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
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isInstantEligible ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-400'
                  }`}
              >
                <Zap
                  className={`w-4 h-4 stroke-[2] ${isInstantEligible ? 'fill-amber-500 text-amber-500' : ''
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
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative shrink-0 shadow-inner ${isInstantEligible ? 'bg-rose-900' : 'bg-stone-300'
                }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${isInstantEligible ? 'translate-x-4' : 'translate-x-0'
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
