import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Layers,
  Award,
  Flame,
  Tag,
  Copy,
  RefreshCw,
  X
} from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminAdsPage = () => {
  const {
    advertisements = [],
    brandPartners = [],
    midPageCampaign = {},
    salons = [],
    createAd,
    updateAd,
    deleteAd,
    toggleAdActive,
    createBrandPartner,
    updateBrandPartner,
    deleteBrandPartner,
    toggleBrandPartnerActive,
    updateMidCampaign,
    theme
  } = useAdmin();

  const isLight = theme === 'light';

  // Active Tab: 'top-ads' | 'brand-partners' | 'mid-campaign'
  const [activeTab, setActiveTab] = useState('top-ads');
  const [searchQuery, setSearchQuery] = useState('');

  // ---------------- Modal States ----------------
  // Ad Modal
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [adFormData, setAdFormData] = useState({
    brand: '',
    sponsorBadge: 'Sponsored',
    title: '',
    subtitle: '',
    description: '',
    discountBadge: '',
    couponCode: '',
    ctaText: 'Claim Deal',
    image: '',
    salonId: '',
    category: 'facial',
    validTill: 'Limited Time Offer',
    isActive: true
  });

  // Partner Modal
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [partnerFormData, setPartnerFormData] = useState({
    name: '',
    fullName: '',
    tagline: '',
    offer: '',
    couponCode: '',
    logo: '💎',
    description: '',
    isActive: true
  });

  // Delete Confirm Modal
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'ad'|'partner', id, title }

  // Mid Campaign Local Form
  const [campaignFormData, setCampaignFormData] = useState({
    badge: 'Sponsored Campaign',
    title: '',
    subtitle: '',
    highlight: '',
    coupon: '',
    ctaText: 'Claim Pass',
    bannerImage: '',
    isActive: true
  });
  const [campaignSaved, setCampaignSaved] = useState(false);

  // Sync campaignFormData when midPageCampaign changes
  useEffect(() => {
    if (midPageCampaign) {
      setCampaignFormData({
        badge: midPageCampaign.badge || 'Sponsored Campaign',
        title: midPageCampaign.title || '',
        subtitle: midPageCampaign.subtitle || '',
        highlight: midPageCampaign.highlight || '',
        coupon: midPageCampaign.coupon || '',
        ctaText: midPageCampaign.ctaText || 'Claim Pass',
        bannerImage: midPageCampaign.bannerImage || '',
        isActive: midPageCampaign.isActive !== false
      });
    }
  }, [midPageCampaign]);

  // ---------------- Handlers: Top Ads ----------------
  const handleOpenCreateAd = () => {
    setEditingAd(null);
    setAdFormData({
      brand: '',
      sponsorBadge: 'Sponsored Spotlight',
      title: '',
      subtitle: '',
      description: '',
      discountBadge: 'Flat ₹200 OFF',
      couponCode: '',
      ctaText: 'Claim Deal',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      salonId: salons[0]?.id || '',
      category: 'facial',
      validTill: 'Limited Time Offer',
      isActive: true
    });
    setAdModalOpen(true);
  };

  const handleOpenEditAd = (ad) => {
    setEditingAd(ad);
    setAdFormData({
      brand: ad.brand || '',
      sponsorBadge: ad.sponsorBadge || '',
      title: ad.title || '',
      subtitle: ad.subtitle || '',
      description: ad.description || '',
      discountBadge: ad.discountBadge || '',
      couponCode: ad.couponCode || '',
      ctaText: ad.ctaText || 'Claim Deal',
      image: ad.image || '',
      salonId: ad.salonId || '',
      category: ad.category || 'facial',
      validTill: ad.validTill || 'Limited Time Offer',
      isActive: ad.isActive !== false
    });
    setAdModalOpen(true);
  };

  const handleSubmitAd = async (e) => {
    e.preventDefault();
    const payload = {
      ...adFormData,
      brand: adFormData.brand.trim(),
      title: adFormData.title.trim(),
      couponCode: adFormData.couponCode.trim().toUpperCase()
    };

    if (editingAd) {
      await updateAd(editingAd.id, payload);
    } else {
      await createAd(payload);
    }
    setAdModalOpen(false);
  };

  // ---------------- Handlers: Brand Partners ----------------
  const handleOpenCreatePartner = () => {
    setEditingPartner(null);
    setPartnerFormData({
      name: '',
      fullName: '',
      tagline: '',
      offer: '20% OFF',
      couponCode: '',
      logo: '✨',
      description: '',
      isActive: true
    });
    setPartnerModalOpen(true);
  };

  const handleOpenEditPartner = (bp) => {
    setEditingPartner(bp);
    setPartnerFormData({
      name: bp.name || '',
      fullName: bp.fullName || '',
      tagline: bp.tagline || '',
      offer: bp.offer || '',
      couponCode: bp.couponCode || '',
      logo: bp.logo || '✨',
      description: bp.description || '',
      isActive: bp.isActive !== false
    });
    setPartnerModalOpen(true);
  };

  const handleSubmitPartner = async (e) => {
    e.preventDefault();
    const payload = {
      ...partnerFormData,
      name: partnerFormData.name.trim(),
      couponCode: partnerFormData.couponCode.trim().toUpperCase()
    };

    if (editingPartner) {
      await updateBrandPartner(editingPartner.id, payload);
    } else {
      await createBrandPartner(payload);
    }
    setPartnerModalOpen(false);
  };

  // ---------------- Handlers: Mid Campaign ----------------
  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    await updateMidCampaign({
      ...campaignFormData,
      coupon: campaignFormData.coupon.trim().toUpperCase()
    });
    setCampaignSaved(true);
    setTimeout(() => setCampaignSaved(false), 3000);
  };

  // ---------------- Delete Confirmation Handler ----------------
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'ad') {
      await deleteAd(deleteConfirm.id);
    } else if (deleteConfirm.type === 'partner') {
      await deleteBrandPartner(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  // ---------------- Filters & Computed ----------------
  const filteredAds = advertisements.filter((ad) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ad.brand?.toLowerCase().includes(q) ||
      ad.title?.toLowerCase().includes(q) ||
      ad.couponCode?.toLowerCase().includes(q) ||
      ad.category?.toLowerCase().includes(q)
    );
  });

  const filteredPartners = brandPartners.filter((bp) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      bp.name?.toLowerCase().includes(q) ||
      bp.fullName?.toLowerCase().includes(q) ||
      bp.tagline?.toLowerCase().includes(q) ||
      bp.couponCode?.toLowerCase().includes(q)
    );
  });

  const activeAdsCount = advertisements.filter((a) => a.isActive !== false).length;
  const activePartnersCount = brandPartners.filter((b) => b.isActive !== false).length;

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      {/* Top Bar */}
      <AdminTopBar
        title="Ads & Banners Management"
        subtitle="Manage customer app top sponsored carousel, brand showcase partners, and campaign banners"
        action={
          <div className="flex items-center gap-2.5">
            {activeTab === 'top-ads' && (
              <button
                type="button"
                onClick={handleOpenCreateAd}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Carousel Ad</span>
              </button>
            )}
            {activeTab === 'brand-partners' && (
              <button
                type="button"
                onClick={handleOpenCreatePartner}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Brand Partner</span>
              </button>
            )}
          </div>
        }
      />

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262638] pb-4">
          <div className="admin-filter-bar flex items-center gap-1.5 bg-[#14141e] border border-[#262638] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('top-ads');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'top-ads'
                  ? 'bg-purple-600 text-white shadow-md'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#1a1a24]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Top Ad Carousel</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === 'top-ads'
                    ? 'bg-white/20 text-white'
                    : isLight
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {activeAdsCount}/{advertisements.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('brand-partners');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'brand-partners'
                  ? 'bg-purple-600 text-white shadow-md'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#1a1a24]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Brand Partners</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === 'brand-partners'
                    ? 'bg-white/20 text-white'
                    : isLight
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {activePartnersCount}/{brandPartners.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('mid-campaign');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'mid-campaign'
                  ? 'bg-purple-600 text-white shadow-md'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#1a1a24]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Mid-Page Campaign</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  midPageCampaign.isActive !== false ? 'bg-emerald-500' : 'bg-stone-400'
                }`}
              />
            </button>
          </div>

          {/* Search bar for list tabs */}
          {activeTab !== 'mid-campaign' && (
            <div className="relative w-full sm:w-64">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-stone-500'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'top-ads' ? 'Search ads, brands...' : 'Search brand partners...'
                }
                className="w-full bg-[#14141e] border border-[#262638] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:border-purple-500 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ---------------- TAB 1: TOP AD CAROUSEL ---------------- */}
        {activeTab === 'top-ads' && (
          <div className="space-y-4">
            <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="admin-table-header border-b border-[#262638] text-stone-400 font-semibold bg-[#101018]">
                      <th className="py-3.5 px-4">Preview & Brand</th>
                      <th className="py-3.5 px-4">Headline & Offer</th>
                      <th className="py-3.5 px-4">Target Salon / Category</th>
                      <th className="py-3.5 px-4">Validity</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e2c]">
                    {filteredAds.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-500">
                          <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
                          <p className="font-semibold text-sm">No carousel ads found</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {searchQuery ? 'Try clearing your search query' : 'Click "+ Add Carousel Ad" to create your first top advertisement'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredAds.map((ad) => {
                        const targetSalon = salons.find((s) => s.id === ad.salonId);
                        const isActive = ad.isActive !== false;

                        return (
                          <tr
                            key={ad.id}
                            className="hover:bg-[#181824] transition-colors group"
                          >
                            {/* Preview & Brand */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-16 h-11 rounded-lg overflow-hidden shrink-0 border ${isLight ? 'border-slate-200 bg-slate-100' : 'border-[#2d2d40] bg-stone-900'} relative`}>
                                  <img
                                    src={ad.image}
                                    alt={ad.brand}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src =
                                        'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
                                    }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className={`font-bold text-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    {ad.brand}
                                  </div>
                                  <span
                                    className={`inline-block mt-0.5 text-[9.5px] px-1.5 py-0.2 rounded font-semibold border ${
                                      isLight
                                        ? 'bg-purple-100 text-purple-800 border-purple-200'
                                        : 'bg-purple-950/60 text-purple-300 border-purple-800/40'
                                    }`}
                                  >
                                    {ad.sponsorBadge || 'Sponsored'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Headline & Offer */}
                            <td className="py-3.5 px-4 max-w-[240px]">
                              <div className={`font-semibold line-clamp-1 leading-snug ${isLight ? 'text-slate-900' : 'text-stone-200'}`}>
                                {ad.title?.replace(/\n/g, ' • ')}
                              </div>
                              <div className={`text-[10.5px] line-clamp-1 mt-0.5 ${isLight ? 'text-slate-500 font-medium' : 'text-stone-400'}`}>
                                {ad.subtitle}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                {ad.discountBadge && (
                                  <span
                                    className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded border ${
                                      isLight
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : 'bg-emerald-950/70 text-emerald-400 border-emerald-800/50'
                                    }`}
                                  >
                                    {ad.discountBadge}
                                  </span>
                                )}
                                {ad.couponCode && (
                                  <span
                                    className={`font-mono text-[9.5px] font-extrabold px-1.5 py-0.2 rounded border ${
                                      isLight
                                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                                        : 'bg-amber-950/60 text-amber-300 border-amber-800/50'
                                    }`}
                                  >
                                    {ad.couponCode}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Target Salon / Category */}
                            <td className="py-3.5 px-4">
                              <div className={`font-semibold truncate max-w-[160px] ${isLight ? 'text-slate-900' : 'text-stone-200'}`}>
                                {targetSalon ? targetSalon.name : ad.salonId || 'Sitewide'}
                              </div>
                              <div className={`text-[10px] capitalize mt-0.5 ${isLight ? 'text-slate-500 font-medium' : 'text-stone-400'}`}>
                                {ad.category} • CTA: "{ad.ctaText || 'Claim Deal'}"
                              </div>
                            </td>

                            {/* Validity */}
                            <td className={`py-3.5 px-4 text-[11px] whitespace-nowrap ${isLight ? 'text-slate-700 font-medium' : 'text-stone-400'}`}>
                              {ad.validTill || 'Always Active'}
                            </td>

                            {/* Status Toggle */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => toggleAdActive(ad.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                  isActive
                                    ? isLight
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                    : isLight
                                    ? 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                                    : 'bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-700'
                                }`}
                                title={isActive ? 'Click to pause ad' : 'Click to activate ad'}
                              >
                                {isActive ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Active</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className={`w-3 h-3 ${isLight ? 'text-slate-500' : 'text-stone-400'}`} />
                                    <span>Paused</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditAd(ad)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                                    isLight
                                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200'
                                      : 'bg-[#222230] hover:bg-purple-950/70 hover:text-purple-300 text-stone-300 border-transparent'
                                  }`}
                                  title="Edit Ad"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: 'ad',
                                      id: ad.id,
                                      title: `${ad.brand} - ${ad.title?.replace(/\n/g, ' ')}`
                                    })
                                  }
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                                    isLight
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200'
                                      : 'bg-[#222230] hover:bg-red-950/70 hover:text-red-300 text-stone-300 border-transparent'
                                  }`}
                                  title="Delete Ad"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- TAB 2: BRAND PARTNER SHOWCASE ---------------- */}
        {activeTab === 'brand-partners' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPartners.length === 0 ? (
                <div className="col-span-full py-12 text-center text-stone-500 bg-[#14141e] border border-[#262638] rounded-2xl p-8">
                  <Award className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
                  <p className="font-semibold text-sm">No brand partners found</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {searchQuery ? 'Try clearing your search query' : 'Click "+ Add Brand Partner" to list a collaboration'}
                  </p>
                </div>
              ) : (
                filteredPartners.map((bp) => {
                  const isActive = bp.isActive !== false;

                  return (
                    <div
                      key={bp.id}
                      className={`rounded-2xl p-5 flex flex-col justify-between border transition-all relative overflow-hidden group ${
                        isLight
                          ? 'bg-white border-slate-200 shadow-sm hover:border-purple-300 hover:shadow-md'
                          : 'bg-[#14141e] border-[#262638] shadow-md hover:border-purple-500/40'
                      }`}
                    >
                      {/* Status indicator top bar */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${
                              isLight
                                ? 'bg-purple-50 border-purple-200 shadow-inner'
                                : 'bg-[#20202e] border-[#303042] shadow-inner'
                            }`}
                          >
                            {bp.logo || '✨'}
                          </div>
                          <div className="min-w-0">
                            <h4 className={`font-bold text-sm leading-tight truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {bp.name}
                            </h4>
                            <div className={`text-xs truncate mt-0.5 ${isLight ? 'text-slate-500 font-medium' : 'text-stone-400'}`}>
                              {bp.fullName || bp.tagline}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleBrandPartnerActive(bp.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer shrink-0 border ${
                            isActive
                              ? isLight
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : isLight
                              ? 'bg-slate-100 text-slate-600 border-slate-300'
                              : 'bg-stone-800 text-stone-400 border-stone-700'
                          }`}
                        >
                          {isActive ? 'Active' : 'Paused'}
                        </button>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <p className={`text-xs line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-stone-300'}`}>
                          {bp.description || bp.tagline || 'Official Brand Partner collaboration'}
                        </p>

                        <div className={`flex items-center justify-between pt-2.5 border-t ${isLight ? 'border-slate-200' : 'border-[#222230]'}`}>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10.5px] font-extrabold px-2 py-0.5 rounded-md border ${
                                isLight
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                              }`}
                            >
                              {bp.offer || 'Partner Offer'}
                            </span>
                          </div>

                          {bp.couponCode && (
                            <div
                              className={`flex items-center gap-1 font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                                isLight
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                              }`}
                            >
                              <Tag className={`w-3 h-3 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} />
                              <span>{bp.couponCode}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-[#222230]'}`}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditPartner(bp)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                            isLight
                              ? 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200'
                              : 'bg-[#20202e] hover:bg-purple-950/70 hover:text-purple-300 text-stone-300 border-transparent'
                          }`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteConfirm({
                              type: 'partner',
                              id: bp.id,
                              title: bp.name
                            })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                            isLight
                              ? 'bg-red-100 hover:bg-red-200 text-red-700 border-red-200'
                              : 'bg-[#20202e] hover:bg-red-950/70 hover:text-red-300 text-stone-300 border-transparent'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ---------------- TAB 3: MID-PAGE CAMPAIGN BANNER ---------------- */}
        {activeTab === 'mid-campaign' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Column */}
            <div
              className={`lg:col-span-7 rounded-2xl p-6 shadow-xl space-y-5 border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#14141e] border-[#262638]'
              }`}
            >
              <div className={`flex items-center justify-between border-b pb-4 ${isLight ? 'border-slate-200' : 'border-[#262638]'}`}>
                <div>
                  <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Mid-Page Featured Campaign Banner</span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-stone-400'}`}>
                    This sponsored banner appears between categories and salons on the customer home feed.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className={`flex items-center gap-2 text-xs font-semibold cursor-pointer select-none ${isLight ? 'text-slate-700' : 'text-stone-300'}`}>
                    <input
                      type="checkbox"
                      checked={campaignFormData.isActive}
                      onChange={(e) =>
                        setCampaignFormData({ ...campaignFormData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-purple-600 bg-stone-900 border-stone-700 cursor-pointer"
                    />
                    <span>Active on App</span>
                  </label>
                </div>
              </div>

              <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                      Badge Text
                    </label>
                    <input
                      type="text"
                      required
                      value={campaignFormData.badge}
                      onChange={(e) =>
                        setCampaignFormData({ ...campaignFormData, badge: e.target.value })
                      }
                      placeholder="e.g. Sponsored Campaign"
                      className={`w-full rounded-xl px-3 py-2 outline-none border ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                          : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      required
                      value={campaignFormData.ctaText}
                      onChange={(e) =>
                        setCampaignFormData({ ...campaignFormData, ctaText: e.target.value })
                      }
                      placeholder="e.g. Claim Pass"
                      className={`w-full rounded-xl px-3 py-2 outline-none border ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                          : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    required
                    value={campaignFormData.title}
                    onChange={(e) =>
                      setCampaignFormData({ ...campaignFormData, title: e.target.value })
                    }
                    placeholder="e.g. InstaaTrim Gold Glow Carnival"
                    className={`w-full rounded-xl px-3 py-2 font-bold outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Subtitle / Co-sponsors
                  </label>
                  <input
                    type="text"
                    value={campaignFormData.subtitle}
                    onChange={(e) =>
                      setCampaignFormData({ ...campaignFormData, subtitle: e.target.value })
                    }
                    placeholder="e.g. Co-sponsored by Lakmé & O3+ Pro"
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                      Highlight Offer Message
                    </label>
                    <input
                      type="text"
                      required
                      value={campaignFormData.highlight}
                      onChange={(e) =>
                        setCampaignFormData({ ...campaignFormData, highlight: e.target.value })
                      }
                      placeholder="e.g. Book 2 Services • Get Free De-Tan"
                      className={`w-full rounded-xl px-3 py-2 outline-none border ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                          : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      required
                      value={campaignFormData.coupon}
                      onChange={(e) =>
                        setCampaignFormData({
                          ...campaignFormData,
                          coupon: e.target.value.toUpperCase()
                        })
                      }
                      placeholder="e.g. CARNIVAL50"
                      className={`w-full rounded-xl px-3 py-2 font-mono font-bold outline-none border ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                          : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Banner Background Image URL
                  </label>
                  <input
                    type="url"
                    required
                    value={campaignFormData.bannerImage}
                    onChange={(e) =>
                      setCampaignFormData({ ...campaignFormData, bannerImage: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>

                <div className={`flex items-center justify-between pt-4 border-t ${isLight ? 'border-slate-200' : 'border-[#262638]'}`}>
                  {campaignSaved ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Campaign updated successfully!</span>
                    </span>
                  ) : (
                    <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-stone-500'}`}>
                      Changes are reflected immediately in the customer app.
                    </span>
                  )}

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-lg transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Save Campaign Changes</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-stone-300'}`}>
                  <Eye className="w-3.5 h-3.5 text-purple-600" />
                  <span>Customer App Live Preview</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.8 rounded-full border ${
                    campaignFormData.isActive
                      ? isLight
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : isLight
                      ? 'bg-slate-100 text-slate-600 border-slate-300'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  {campaignFormData.isActive ? 'Active on Feed' : 'Hidden (Paused)'}
                </span>
              </div>

              {/* Exact Mockup of SponsoredDealBanner */}
              <div className="w-full max-w-md mx-auto">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-stone-900 via-stone-850 to-purple-950 p-4 text-white shadow-2xl border border-purple-200/40">
                  {campaignFormData.bannerImage && (
                    <img
                      alt="Campaign background"
                      src={campaignFormData.bannerImage}
                      className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
                    />
                  )}

                  <div className="relative z-10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full shadow-2xs">
                        <Sparkles className="w-2.5 h-2.5 fill-current" />
                        {campaignFormData.badge || 'Sponsored Campaign'}
                      </span>
                      <span className="text-[9px] text-stone-300 font-medium">Limited Seats</span>
                    </div>

                    <h3 className="text-[14px] font-bold text-white leading-tight">
                      {campaignFormData.title || 'Your Campaign Title Here'}
                    </h3>

                    {campaignFormData.subtitle && (
                      <p className="text-[10px] text-stone-300">{campaignFormData.subtitle}</p>
                    )}

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 mt-2 border border-white/15 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[9px] text-amber-300 font-bold block uppercase tracking-wide">
                          Special Offer
                        </span>
                        <p className="text-[10px] text-stone-100 font-medium truncate">
                          {campaignFormData.highlight || 'Highlight offer terms'}
                        </p>
                      </div>

                      <div className="shrink-0 bg-white text-stone-900 font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs">
                        <Copy className="w-3 h-3 text-brand-maroon" />
                        <span>CODE: {campaignFormData.coupon || 'CODE'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`mt-3 text-[11px] text-center ${isLight ? 'text-slate-500' : 'text-stone-500'}`}>
                  Preview mirrors real customer device presentation inside mobile shell.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- MODAL: ADD / EDIT CAROUSEL AD ---------------- */}
      {adModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`border rounded-2xl w-full max-w-xl p-6 shadow-2xl relative my-8 ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#14141e] border-[#262638] text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-4 border-b ${isLight ? 'border-slate-200' : 'border-[#242433]'}`}>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Megaphone className="w-4 h-4 text-purple-600" />
                <span>{editingAd ? 'Edit Top Carousel Ad' : 'Create Top Carousel Ad'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setAdModalOpen(false)}
                className={`cursor-pointer ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-stone-400 hover:text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAd} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={adFormData.brand}
                    onChange={(e) => setAdFormData({ ...adFormData, brand: e.target.value })}
                    placeholder="e.g. L'Oréal Paris"
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Sponsor Badge *
                  </label>
                  <input
                    type="text"
                    required
                    value={adFormData.sponsorBadge}
                    onChange={(e) => setAdFormData({ ...adFormData, sponsorBadge: e.target.value })}
                    placeholder="e.g. Official Brand Partner"
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                  Headline Title * <span className="text-stone-500 font-normal">(Supports multi-line via \n or linebreaks)</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={adFormData.title}
                  onChange={(e) => setAdFormData({ ...adFormData, title: e.target.value })}
                  placeholder="Parisian Glow &\nHyaluronic Care"
                  className={`w-full rounded-xl px-3 py-2 outline-none border ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                      : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={adFormData.subtitle}
                    onChange={(e) => setAdFormData({ ...adFormData, subtitle: e.target.value })}
                    placeholder="e.g. Exclusive Salon Collaboration"
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Discount Badge
                  </label>
                  <input
                    type="text"
                    value={adFormData.discountBadge}
                    onChange={(e) => setAdFormData({ ...adFormData, discountBadge: e.target.value })}
                    placeholder="e.g. Flat ₹400 OFF"
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={adFormData.description}
                  onChange={(e) => setAdFormData({ ...adFormData, description: e.target.value })}
                  placeholder="Short marketing description shown under title on carousel card..."
                  className={`w-full rounded-xl px-3 py-2 outline-none border ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                      : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={adFormData.couponCode}
                    onChange={(e) =>
                      setAdFormData({ ...adFormData, couponCode: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. LOREAL400"
                    className={`w-full rounded-xl px-3 py-2 font-mono font-bold outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={adFormData.ctaText}
                    onChange={(e) => setAdFormData({ ...adFormData, ctaText: e.target.value })}
                    placeholder="e.g. Claim Deal"
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Category
                  </label>
                  <select
                    value={adFormData.category}
                    onChange={(e) => setAdFormData({ ...adFormData, category: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  >
                    <option value="facial">Facial</option>
                    <option value="hair">Hair</option>
                    <option value="spa">Spa</option>
                    <option value="makeup">Makeup</option>
                    <option value="nails">Nails</option>
                    <option value="all">All Services</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Linked Target Salon
                  </label>
                  <select
                    value={adFormData.salonId}
                    onChange={(e) => setAdFormData({ ...adFormData, salonId: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  >
                    <option value="">None (Platform-wide)</option>
                    {salons.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.area || s.city})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Validity Note
                  </label>
                  <input
                    type="text"
                    value={adFormData.validTill}
                    onChange={(e) => setAdFormData({ ...adFormData, validTill: e.target.value })}
                    placeholder="e.g. Limited Time Offer"
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                  Image URL *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    required
                    value={adFormData.image}
                    onChange={(e) => setAdFormData({ ...adFormData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className={`flex-1 rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                  {adFormData.image && (
                    <div className={`w-12 h-9 rounded-lg overflow-hidden border shrink-0 ${isLight ? 'border-slate-300 bg-slate-100' : 'border-[#2d2d40] bg-stone-900'}`}>
                      <img
                        src={adFormData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2 select-none">
                <input
                  type="checkbox"
                  checked={adFormData.isActive}
                  onChange={(e) => setAdFormData({ ...adFormData, isActive: e.target.checked })}
                  className="rounded text-purple-600 bg-stone-900 border-stone-700 w-4 h-4 cursor-pointer"
                />
                <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-stone-300'}`}>
                  Active (Visible in Customer App Carousel)
                </span>
              </label>

              <div className={`flex justify-end gap-3 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-[#242433]'}`}>
                <button
                  type="button"
                  onClick={() => setAdModalOpen(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${
                    isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer shadow-lg"
                >
                  {editingAd ? 'Update Ad' : 'Create Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: ADD / EDIT BRAND PARTNER ---------------- */}
      {partnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative my-8 ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#14141e] border-[#262638] text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-4 border-b ${isLight ? 'border-slate-200' : 'border-[#242433]'}`}>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Award className="w-4 h-4 text-purple-600" />
                <span>{editingPartner ? 'Edit Brand Partner' : 'Add Brand Partner'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setPartnerModalOpen(false)}
                className={`cursor-pointer ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-stone-400 hover:text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPartner} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Brand Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerFormData.name}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, name: e.target.value })}
                    placeholder="e.g. L'Oréal"
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Icon / Emoji *
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerFormData.logo}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, logo: e.target.value })}
                    placeholder="e.g. 💎 or ✨"
                    className={`w-full rounded-xl px-3 py-2 text-center text-base outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                  Full Corporate / Brand Name
                </label>
                <input
                  type="text"
                  value={partnerFormData.fullName}
                  onChange={(e) =>
                    setPartnerFormData({ ...partnerFormData, fullName: e.target.value })
                  }
                  placeholder="e.g. L'Oréal Paris Professional"
                  className={`w-full rounded-xl px-3 py-2 outline-none border ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                      : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Tagline *
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerFormData.tagline}
                    onChange={(e) =>
                      setPartnerFormData({ ...partnerFormData, tagline: e.target.value })
                    }
                    placeholder="e.g. Paris Hair & Skin"
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Promotional Offer *
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerFormData.offer}
                    onChange={(e) => setPartnerFormData({ ...partnerFormData, offer: e.target.value })}
                    placeholder="e.g. 40% OFF or Free Kit"
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                  Associated Coupon Code
                </label>
                <input
                  type="text"
                  value={partnerFormData.couponCode}
                  onChange={(e) =>
                    setPartnerFormData({
                      ...partnerFormData,
                      couponCode: e.target.value.toUpperCase()
                    })
                  }
                  placeholder="e.g. LOREAL400"
                  className={`w-full rounded-xl px-3 py-2 font-mono font-bold outline-none border ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                      : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={partnerFormData.description}
                  onChange={(e) =>
                    setPartnerFormData({ ...partnerFormData, description: e.target.value })
                  }
                  placeholder="Details on what products or services this partner collaborates on..."
                  className={`w-full rounded-xl px-3 py-2 outline-none border ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                      : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                  }`}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2 select-none">
                <input
                  type="checkbox"
                  checked={partnerFormData.isActive}
                  onChange={(e) =>
                    setPartnerFormData({ ...partnerFormData, isActive: e.target.checked })
                  }
                  className="rounded text-purple-600 bg-stone-900 border-stone-700 w-4 h-4 cursor-pointer"
                />
                <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-stone-300'}`}>
                  Active (Visible in Showcase on Customer Home)
                </span>
              </label>

              <div className={`flex justify-end gap-3 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-[#242433]'}`}>
                <button
                  type="button"
                  onClick={() => setPartnerModalOpen(false)}
                  className={`px-4 py-2 rounded-xl cursor-pointer ${
                    isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer shadow-lg"
                >
                  {editingPartner ? 'Update Partner' : 'Add Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: DELETE CONFIRMATION ---------------- */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`border rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#14141e] border-[#262638] text-white'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h4 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Confirm Removal
              </h4>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-stone-400'}`}>
                Are you sure you want to delete{' '}
                <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  "{deleteConfirm.title}"
                </span>
                ? This will remove it from the customer app immediately.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className={`flex-1 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                  isLight
                    ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    : 'border-stone-700 text-stone-300 hover:bg-stone-800'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
