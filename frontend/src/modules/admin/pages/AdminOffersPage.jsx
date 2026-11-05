import React, { useState, useMemo } from 'react';
import { Tag, CheckCircle2, XCircle, Clock, Search, AlertCircle, Percent, Plus, Sparkles, Store, X, Layers, Calendar, ChevronDown, Check, Edit3, Trash2 } from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';
import { api } from '../../../shared/services/api';


export const AdminOffersPage = () => {
  const { offers = [], salons = [], categories = [], approveOffer, rejectOffer, createOffer, updateOffer, deleteOffer } = useAdmin();

  const [tab, setTab] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [search, setSearch] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingOfferId, setRejectingOfferId] = useState(null);

  // Modal State for "+ Add Offer"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showCatSuggestions, setShowCatSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customSubInput, setCustomSubInput] = useState('');

  const initialFormState = {
    title: '',
    category: '',
    subcategories: [], // Multi-select array
    salonId: 'all',
    salonName: 'All Salons (Global Offer)',
    discount: '25', // Discount % applied on each matching service's own price
    maxDiscount: '', // optional cap in ₹
    description: '',
    applicableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    validTill: '' // '' = no expiry (admin can pick a date)
  };

  const [formData, setFormData] = useState(initialFormState);

  // Make sure the latest DB categories are loaded even if admin opens this page directly
  React.useEffect(() => {
    api.categories.list().catch(() => {});
  }, []);

  // Categories & sub-categories from DB (admin-defined). Global ones + ones assigned to the chosen salon.
  const CATEGORY_CATALOG = useMemo(() => {
    const sel = String(formData.salonId || 'all');
    return (categories || [])
      .filter((c) => c && c.name && c.isActive !== false)
      .filter((c) => {
        const cs = c.salonId ? String(c.salonId._id || c.salonId.id || c.salonId) : '';
        return !cs || cs === 'all' || cs === sel;
      })
      .map((c) => ({ name: c.name, subcategories: Array.isArray(c.serviceCategories) ? c.serviceCategories : [] }));
  }, [categories, formData.salonId]);

  // Autocomplete category filter
  const catSuggestions = useMemo(() => {
    const q = (formData.category || '').toLowerCase().trim();
    if (!q) return CATEGORY_CATALOG;
    return CATEGORY_CATALOG.filter((c) => c.name.toLowerCase().includes(q));
  }, [formData.category, CATEGORY_CATALOG]);

  // Dynamic available subcategories for currently selected category
  const availableSubcategories = useMemo(() => {
    const found = CATEGORY_CATALOG.find(
      (c) => c.name.toLowerCase() === (formData.category || '').toLowerCase()
    );
    return found ? found.subcategories : [];
  }, [formData.category, CATEGORY_CATALOG]);

  const handleSelectCategory = (cat) => {
    setFormData((prev) => ({
      ...prev,
      category: cat.name,
      subcategories: [] // none selected = offer applies to the whole category
    }));
    setShowCatSuggestions(false);
  };

  const toggleSubcategory = (sub) => {
    setFormData((prev) => {
      const exists = prev.subcategories.includes(sub);
      return {
        ...prev,
        subcategories: exists
          ? prev.subcategories.filter((s) => s !== sub)
          : [...prev.subcategories, sub]
      };
    });
  };

  const handleSelectAllSubcategories = () => {
    setFormData((prev) => ({
      ...prev,
      subcategories: [...availableSubcategories]
    }));
  };

  const handleAddCustomSubcategory = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = customSubInput.replace(/,/g, '').trim();
      if (val && !formData.subcategories.includes(val)) {
        setFormData((prev) => ({
          ...prev,
          subcategories: [...prev.subcategories, val]
        }));
        setCustomSubInput('');
      }
    }
  };

  const handleAddCustomSubcategoryClick = () => {
    const val = customSubInput.trim();
    if (val && !formData.subcategories.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        subcategories: [...prev.subcategories, val]
      }));
      setCustomSubInput('');
    }
  };

  const removeSubcategoryTag = (subToRemove) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((s) => s !== subToRemove)
    }));
  };

  const handleDiscountChange = (val) => {
    setFormData((prev) => ({ ...prev, discount: val }));
  };

  const handleOpenCreate = () => {
    setEditingOfferId(null);
    setFormData(initialFormState);
    setCustomSubInput("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer) => {
    setEditingOfferId(offer.id || offer._id);
    let subArr = [];
    if (Array.isArray(offer.subcategories) && offer.subcategories.length > 0) {
      subArr = offer.subcategories;
    } else if (offer.subcategory) {
      subArr = offer.subcategory.split(",").map((s) => s.trim()).filter(Boolean);
    }
    const discVal = offer.discountPercent || (parseFloat(offer.discount) || 25);
    setFormData({
      title: offer.title || "",
      category: offer.category || "",
      subcategories: subArr,
      salonId: offer.salonId || "all",
      salonName: offer.salonName || "All Salons (Global Offer)",
      discount: discVal || "25",
      maxDiscount: offer.maxDiscount || "",
      description: offer.description || "",
      applicableDays: offer.applicableDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      validTill: offer.validTill || ""
    });
    setCustomSubInput("");
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const offerId = deleteConfirm.id || deleteConfirm._id;
      if (typeof deleteOffer === "function") {
        await deleteOffer(offerId);
      }
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete offer: " + (err.message || "Server error"));
    }
  };

  const handleCreateOfferSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert('Please enter an offer name');
    if (!formData.category.trim()) return alert('Please select or enter a category');

    setIsSubmitting(true);
    try {
      const pendingTag = customSubInput.trim();
      const subs = pendingTag && !formData.subcategories.includes(pendingTag) ? [...formData.subcategories, pendingTag] : formData.subcategories;
      const scopeText = subs.length > 0 ? subs.join(', ') : formData.category.trim();
      const pct = Number(formData.discount) || 0;
      if (pct < 1 || pct > 90) {
        alert('Discount must be between 1% and 90%');
        setIsSubmitting(false);
        return;
      }

      const offerPayload = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        subcategories: subs, // [] = whole category
        salonId: formData.salonId,
        salonName: formData.salonName,
        discountPercent: pct,
        maxDiscount: Number(formData.maxDiscount) || 0,
        description: formData.description.trim() || `Flat ${pct}% off on ${scopeText}`,
        applicableDays: formData.applicableDays,
        validTill: formData.validTill,
        isActive: true
      };

      if (editingOfferId) {
        if (typeof updateOffer === 'function') {
          await updateOffer(editingOfferId, offerPayload);
        }
      } else {
        if (typeof createOffer === 'function') {
          await createOffer(offerPayload);
        }
      }

      setIsModalOpen(false);
      setFormData(initialFormState);
      setCustomSubInput('');
    } catch (err) {
      console.error('Failed to create offer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOffers = offers.filter((o) => {
    const salon = salons.find((s) => s.id === o.salonId || s._id === o.salonId);
    const matchesSearch =
      (o.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.subcategory || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (salon?.name || o.salonName || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (tab === 'pending') return o.approvalStatus === 'pending';
    if (tab === 'approved') return o.approvalStatus === 'approved';
    if (tab === 'rejected') return o.approvalStatus === 'rejected';
    return true;
  });

  const handleOpenReject = (offerId) => {
    setRejectingOfferId(offerId);
    setRejectReason('');
  };

  const handleConfirmReject = () => {
    if (rejectingOfferId) {
      rejectOffer(rejectingOfferId, rejectReason || 'Discount threshold violates platform pricing policy');
      setRejectingOfferId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      <AdminTopBar
        title="Salon Offers & Yield Promotions"
        subtitle="Create global or salon-specific deals, approve or manage promotional discounts for customer marketplace"
      />

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {/* Navigation / Filters + Create Button */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search offers, salons, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#14141e] border border-[#262638] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-[#14141e] border border-[#262638] rounded-xl text-xs">
              {[
                { id: 'all', label: 'All Deals' },
                { id: 'approved', label: 'Approved Live' },
                { id: 'pending', label: 'Pending' },
                { id: 'rejected', label: 'Declined' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    tab === t.id ? 'bg-purple-600 text-white' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* "+ Create Offer" Action Button */}
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Offer Deal</span>
            </button>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffers.map((offer) => {
            const salon = salons.find((s) => s.id === offer.salonId || s._id === offer.salonId);
            const isPending = offer.approvalStatus === 'pending';
            const isApproved = offer.approvalStatus === 'approved';
            const isRejected = offer.approvalStatus === 'rejected';
            const isGlobal = offer.salonId === 'all' || !offer.salonId || (offer.salonName && offer.salonName.toLowerCase().includes('all salon'));

            return (
              <div
                key={offer.id || offer._id}
                className="bg-[#14141e] border border-[#262638] rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/40 transition-all shadow-md group relative overflow-hidden"
              >
                <div>
                  {/* Top tag & salon assignment */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                        {isGlobal ? (
                          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <Store className="w-3 h-3" />
                            All Salons (Global)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 truncate">
                            <Store className="w-3 h-3 shrink-0" />
                            {salon?.name || offer.salonName || 'Specific Salon'}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mt-1.5 truncate">{offer.title}</h3>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        isApproved
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : isPending
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-red-500/15 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {offer.approvalStatus || 'approved'}
                    </span>
                  </div>

                  {/* Category & Subcategory tags */}
                  {(offer.category || offer.subcategory) && (
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                      {offer.category && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1f1f30] text-purple-300 border border-purple-500/20">
                          {offer.category}
                        </span>
                      )}
                      {offer.subcategory && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#181824] text-stone-300 border border-[#2a2a3e]">
                          {offer.subcategory}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-stone-300 mb-4 line-clamp-2 leading-relaxed">{offer.description}</p>

                  {/* Pricing and Details Box */}
                  <div className="bg-[#1b1b26] border border-[#242433] rounded-xl p-3 space-y-2 text-xs mb-4">
                    <div className="flex justify-between items-center pb-1.5 border-b border-[#26263a] gap-2">
                      <span className="text-stone-400 shrink-0">Applies on</span>
                      <span className="text-stone-200 font-semibold text-right truncate">
                        {(offer.subcategories || []).filter((x) => x && x !== offer.category).join(', ') || offer.category || 'All services'}
                      </span>
                    </div>
                    {Number(offer.maxDiscount) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-stone-400">Max discount</span>
                        <span className="text-stone-200 font-semibold">₹{offer.maxDiscount}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Discount Offered</span>
                      <span className="text-white font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                        {offer.discount || `${offer.discountPercent || 20}% OFF`}
                      </span>
                    </div>

                    {offer.applicableDays && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">Applicable Days</span>
                        <span className="text-stone-200">
                          {Array.isArray(offer.applicableDays) ? offer.applicableDays.join(', ') : offer.applicableDays}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-stone-400">Valid Till</span>
                      <span className="text-stone-200">{offer.validTill || 'No expiry'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-stone-400">Redeemed Count</span>
                      <span className="text-emerald-400 font-semibold">{offer.redeemedCount || 0} times</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#232333] flex items-center justify-between">
                  <span className="text-[10px] text-stone-500">
                    {isGlobal ? '🌐 Active for All Salons' : `📍 ${salon?.locationCity || salon?.city || 'Local'}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(offer)}
                      title="Edit Offer"
                      className="px-2.5 py-1.5 bg-[#1f1f2e] hover:bg-purple-600/30 text-stone-300 hover:text-purple-300 border border-[#2e2e42] hover:border-purple-500/40 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(offer)}
                      title="Delete Offer Permanently"
                      className="px-2.5 py-1.5 bg-red-950/20 hover:bg-red-950/60 text-red-400 hover:text-red-300 border border-red-900/30 hover:border-red-800/50 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                    {isPending && (
                      <>
                        <button
                          onClick={() => approveOffer(offer.id || offer._id)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Approve Live
                        </button>
                        <button
                          onClick={() => handleOpenReject(offer.id || offer._id)}
                          className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {isApproved && (
                      <button
                        onClick={() => handleOpenReject(offer.id || offer._id)}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        Deactivate
                      </button>
                    )}
                    {(isRejected || offer.approvalStatus === 'rejected' || !offer.isActive) && (
                      <button
                        onClick={() => approveOffer(offer.id || offer._id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-md"
                      >
                        Activate Live
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-16 bg-[#14141e] border border-[#262638] rounded-2xl p-8">
            <Tag className="w-10 h-10 text-stone-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No offers found</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto mb-5">
              Create a new promotional deal across all salons or for a specific salon partner.
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create First Offer Deal</span>
            </button>
          </div>
        )}
      </div>

      {/* CREATE OFFER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Mobile: bottom sheet (full width) · Desktop: centered card. Header & buttons stay visible, form scrolls. */}
          <div className="bg-[#14141e] border border-[#2d2d42] rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[100dvh] sm:max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-7 pt-4 sm:pt-6 pb-3 border-b border-[#252538] shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">{editingOfferId ? "Edit Promotional Offer Deal" : "Create Promotional Offer Deal"}</h3>
                  <p className="text-[11px] text-stone-400 line-clamp-2 sm:line-clamp-none">Launch dynamic discounts for categories, subcategories &amp; partner salons</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 shrink-0 rounded-full bg-[#1e1e2d] text-stone-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOfferSubmit} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-7 pt-4 space-y-4">
              
              {/* 1. Offer Name */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Offer Deal Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Festive Glow Deal, 30% Off Hair Spa..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              {/* 2. Category (Smart Autocomplete + Manual Input) */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[10px] text-purple-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Smart Autocomplete &amp; Manual
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hair, Nails, Facial, Spa..."
                  value={formData.category}
                  onFocus={() => setShowCatSuggestions(true)}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    setShowCatSuggestions(true);
                  }}
                  className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-purple-500 font-medium"
                />

                {/* Autocomplete Dropdown */}
                {showCatSuggestions && catSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#161622] border border-[#2f2f45] rounded-xl shadow-2xl overflow-hidden divide-y divide-[#232336] max-h-52 overflow-y-auto">
                    {catSuggestions.map((cat) => (
                      <div
                        key={cat.name}
                        onClick={() => handleSelectCategory(cat)}
                        className="p-2.5 hover:bg-purple-900/30 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-purple-400" />
                          <span className="text-xs font-semibold text-white">{cat.name}</span>
                        </div>
                        <span className="text-[10px] text-stone-400">{cat.subcategories.length} subcategories</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Subcategories (Multi-Select Chips + Manual Tags) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                    Subcategories / Service Tags (Multi-Select)
                  </label>
                  {availableSubcategories.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllSubcategories}
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
                    >
                      + Select All
                    </button>
                  )}
                </div>

                {/* Clickable Multi-Select Chips */}
                {availableSubcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5 max-h-32 overflow-y-auto p-1 bg-[#101018] rounded-xl border border-[#232336]">
                    {availableSubcategories.map((sub) => {
                      const isSelected = formData.subcategories.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => toggleSubcategory(sub)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                              : 'bg-[#181824] text-stone-300 border-[#2b2b3e] hover:border-purple-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                          <span>{sub}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Selected Tags Display */}
                {formData.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-[10px] text-stone-500 self-center mr-1">Selected ({formData.subcategories.length}):</span>
                    {formData.subcategories.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      >
                        {sub}
                        <button
                          type="button"
                          onClick={() => removeSubcategoryTag(sub)}
                          className="hover:text-red-400 cursor-pointer ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Manual Tag Input */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Type custom subcategory and press Enter or click Add..."
                    value={customSubInput}
                    onChange={(e) => setCustomSubInput(e.target.value)}
                    onKeyDown={handleAddCustomSubcategory}
                    className="flex-1 bg-[#101018] border border-[#2d2d42] rounded-xl px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-purple-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubcategoryClick}
                    className="px-3 py-2 bg-[#1f1f2e] hover:bg-purple-600 hover:text-white text-stone-300 border border-[#2d2d42] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>
              </div>

              {/* 4. Assign to Salon (Dynamic DB) */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Assign to Salon (Dynamic DB)</span>
                  <span className="text-[10px] text-purple-400 font-normal">Apply globally or pick salon</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={formData.salonId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      if (selId === 'all') {
                        setFormData({ ...formData, salonId: 'all', salonName: 'All Salons (Global Offer)' });
                      } else {
                        const s = salons.find((item) => (item.id || item._id) === selId);
                        setFormData({
                          ...formData,
                          salonId: selId,
                          salonName: s ? s.name : 'Specific Salon'
                        });
                      }
                    }}
                    className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer font-medium"
                  >
                    <option value="all">🌐 All Salons (Global Deal - Apply to all partner salons in DB)</option>
                    {salons.map((s) => {
                      const sId = s.id || s._id;
                      const sLoc = s.locationCity || s.city || s.area || '';
                      return (
                        <option key={sId} value={sId}>
                          🏪 {s.name}{sLoc ? ` (${sLoc})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  {formData.salonId === 'all'
                    ? '✨ This offer will be automatically applied to these Subcategories across all salons.'
                    : `✨ This offer will be assigned exclusively to ${formData.salonName}.`}
                </p>
              </div>

              {/* 5. Discount rule — applied on each matching service's OWN price in the salon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#101018] border border-[#232336]">
                <div>
                  <label className="block text-[10.5px] font-bold text-stone-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Discount (%) *</span>
                    {Number(formData.discount) > 0 && (
                      <span className="text-[9.5px] text-emerald-400 font-bold">{formData.discount}% OFF</span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={formData.discount}
                    onChange={(e) => handleDiscountChange(e.target.value)}
                    className="w-full bg-[#141420] border border-purple-500/40 rounded-xl px-3 py-2 text-purple-300 placeholder-stone-600 focus:outline-none focus:border-purple-500 text-xs font-semibold"
                  />
                  <p className="text-[9.5px] text-stone-500 mt-0.5">1–90%, cut from each salon's own service price</p>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-stone-300 uppercase tracking-wider mb-1">
                    Max Discount (₹) — optional
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="No limit"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxDiscount: e.target.value }))}
                    className="w-full bg-[#141420] border border-[#2d2d42] rounded-xl px-3 py-2 text-white placeholder-stone-600 focus:outline-none focus:border-purple-500 text-xs font-semibold"
                  />
                  <p className="text-[9.5px] text-stone-500 mt-0.5">e.g. 20% off, up to ₹200</p>
                </div>

                <p className="sm:col-span-2 text-[10.5px] text-emerald-300/90 bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-2.5 py-1.5">
                  Example: a ₹1,000 service →{' '}
                  <b>
                    ₹
                    {(() => {
                      const pct = Math.min(90, Math.max(0, Number(formData.discount) || 0));
                      let off = Math.round((1000 * pct) / 100);
                      if (Number(formData.maxDiscount) > 0) off = Math.min(off, Number(formData.maxDiscount));
                      return 1000 - off;
                    })()}
                  </b>{' '}
                  for the customer. Applies on{' '}
                  {formData.subcategories.length > 0 ? formData.subcategories.join(', ') : formData.category || 'the selected category'}
                  {formData.salonId && formData.salonId !== 'all' ? ` at ${formData.salonName}` : ' in all salons'}.
                </p>
              </div>

              {/* Validity — optional end date */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Valid Till (optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={formData.validTill || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, validTill: e.target.value }))}
                    className="flex-1 bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-purple-500 text-xs [color-scheme:dark]"
                  />
                  {formData.validTill && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, validTill: '' }))}
                      className="text-[11px] font-semibold text-stone-400 hover:text-white px-2.5 py-2 rounded-lg border border-[#2d2d42]"
                    >
                      No expiry
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  {formData.validTill
                    ? `Offer stops automatically after ${formData.validTill}.`
                    : 'No end date — offer runs until you deactivate it.'}
                </p>
              </div>

              {/* 6. Description / Tagline */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Offer Highlights / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Includes deep conditioning steam spa, wash, and styling..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-purple-500 resize-none font-medium"
                />
              </div>

              {/* Buttons */}
              <div className="sticky bottom-0 -mx-4 sm:-mx-7 px-4 sm:px-7 py-3 bg-[#14141e] flex items-center justify-end gap-3 border-t border-[#232338] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{isSubmitting ? 'Creating...' : 'Launch Live Offer'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingOfferId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141e] border border-[#262638] rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Decline Salon Offer</h3>
            <p className="text-xs text-stone-400">
              Provide feedback to the salon partner explaining why this promotional offer was declined.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Non-peak discount too aggressive or conflicts with platform event..."
              className="w-full bg-[#0d0d14] border border-[#2d2d42] rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingOfferId(null)}
                className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Decline Offer
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ---------------- DELETE CONFIRMATION POPUP MODAL ---------------- */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#14141e] border border-red-800/60 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Delete Offer "{deleteConfirm.title}"?
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Are you sure you want to remove this offer permanently from the database? Customers and salons will no longer see this promotional deal.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#2d2d42] text-stone-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-bold text-xs transition-all shadow-md shadow-red-950/40 cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
