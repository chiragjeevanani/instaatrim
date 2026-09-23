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
  X,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminAdsPage = () => {
  const {
    advertisements = [],
    brandPartners = [],
    heroBanners = [],
    midPageCampaigns = [],
    midPageCampaign = {},
    salons = [],
    services = [],
    createAd,
    updateAd,
    deleteAd,
    toggleAdActive,
    createBrandPartner,
    updateBrandPartner,
    deleteBrandPartner,
    toggleBrandPartnerActive,
    createHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
    toggleHeroBannerActive,
    createMidCampaign,
    updateMidCampaign,
    deleteMidCampaign,
    toggleMidCampaignActive,
    theme
  } = useAdmin();

  const isLight = theme === 'light';

  // Active Tab: 'top-ads' | 'hero-banners' | 'mid-campaign' | 'brand-partners'
  const [activeTab, setActiveTab] = useState('top-ads');
  const [searchQuery, setSearchQuery] = useState('');

  // ---------------- Modal States ----------------
  // 1. Spotlight Ad Modal
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

  // 2. Hero Package Banner Modal
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [editingHeroBanner, setEditingHeroBanner] = useState(null);
  const [heroFormData, setHeroFormData] = useState({
    title: '',
    subtitle: '',
    desc: '',
    ctaText: 'Book Now',
    tag: 'Trending Ritual',
    image: '',
    salonId: '',
    serviceId: '',
    link: '',
    isActive: true
  });

  // 3. Mid-Page Deal Campaign Modal
  const [midModalOpen, setMidModalOpen] = useState(false);
  const [editingMidCampaign, setEditingMidCampaign] = useState(null);
  const [midFormData, setMidFormData] = useState({
    badge: 'Sponsored Campaign',
    title: '',
    subtitle: '',
    highlight: '',
    coupon: '',
    ctaText: 'Claim Pass',
    bannerImage: '',
    link: '',
    isActive: true
  });

  // 4. Partner Modal
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
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'ad'|'hero'|'mid'|'partner', id, title }

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

  // ---------------- Handlers: Hero Banners ----------------
  const handleOpenCreateHeroBanner = () => {
    setEditingHeroBanner(null);
    setHeroFormData({
      title: 'Radiance Revival\n& Glow Package',
      subtitle: 'Exclusive Salon Ritual',
      desc: 'Infused with organic botanicals & ultra-hydrating serums',
      ctaText: 'Book Chair',
      tag: 'Festive Special',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      salonId: salons[0]?.id || '',
      serviceId: services[0]?.id || '',
      link: '',
      isActive: true
    });
    setHeroModalOpen(true);
  };

  const handleOpenEditHeroBanner = (banner) => {
    setEditingHeroBanner(banner);
    setHeroFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      desc: banner.desc || '',
      ctaText: banner.ctaText || 'Book Now',
      tag: banner.tag || 'Special Deal',
      image: banner.image || '',
      salonId: banner.salonId || '',
      serviceId: banner.serviceId || '',
      link: banner.link || '',
      isActive: banner.isActive !== false
    });
    setHeroModalOpen(true);
  };

  const handleSubmitHeroBanner = async (e) => {
    e.preventDefault();
    const payload = {
      ...heroFormData,
      title: heroFormData.title.trim(),
      subtitle: heroFormData.subtitle.trim(),
      desc: heroFormData.desc.trim(),
      image: heroFormData.image.trim()
    };

    if (editingHeroBanner) {
      await updateHeroBanner(editingHeroBanner.id, payload);
    } else {
      await createHeroBanner(payload);
    }
    setHeroModalOpen(false);
  };

  // ---------------- Handlers: Mid-Page Deals ----------------
  const handleOpenCreateMidCampaign = () => {
    setEditingMidCampaign(null);
    setMidFormData({
      badge: 'Sponsored Campaign',
      title: 'Glow Festival Special Deal',
      subtitle: 'Co-sponsored by Lakmé & O3+ Pro',
      highlight: 'Book Any 2 Services • Get Free De-Tan',
      coupon: 'GLOW50',
      ctaText: 'Claim Pass',
      bannerImage: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
      link: '/customer/salons',
      isActive: true
    });
    setMidModalOpen(true);
  };

  const handleOpenEditMidCampaign = (campaign) => {
    setEditingMidCampaign(campaign);
    setMidFormData({
      badge: campaign.badge || 'Sponsored Campaign',
      title: campaign.title || '',
      subtitle: campaign.subtitle || '',
      highlight: campaign.highlight || '',
      coupon: campaign.coupon || '',
      ctaText: campaign.ctaText || 'Claim Pass',
      bannerImage: campaign.bannerImage || '',
      link: campaign.link || '',
      isActive: campaign.isActive !== false
    });
    setMidModalOpen(true);
  };

  const handleSubmitMidCampaign = async (e) => {
    e.preventDefault();
    const payload = {
      ...midFormData,
      title: midFormData.title.trim(),
      coupon: midFormData.coupon.trim().toUpperCase(),
      bannerImage: midFormData.bannerImage.trim()
    };

    if (editingMidCampaign) {
      await updateMidCampaign(editingMidCampaign.id, payload);
    } else {
      await createMidCampaign(payload);
    }
    setMidModalOpen(false);
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

  // ---------------- Delete Confirmation Handler ----------------
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'ad') {
      await deleteAd(deleteConfirm.id);
    } else if (deleteConfirm.type === 'hero') {
      await deleteHeroBanner(deleteConfirm.id);
    } else if (deleteConfirm.type === 'mid') {
      await deleteMidCampaign(deleteConfirm.id);
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

  const filteredHeroBanners = heroBanners.filter((banner) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      banner.title?.toLowerCase().includes(q) ||
      banner.subtitle?.toLowerCase().includes(q) ||
      banner.tag?.toLowerCase().includes(q)
    );
  });

  const resolvedMidCampaigns =
    midPageCampaigns && midPageCampaigns.length > 0
      ? midPageCampaigns
      : midPageCampaign && midPageCampaign.title
      ? [midPageCampaign]
      : [];

  const filteredMidCampaigns = resolvedMidCampaigns.filter((cmp) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      cmp.title?.toLowerCase().includes(q) ||
      cmp.coupon?.toLowerCase().includes(q) ||
      cmp.highlight?.toLowerCase().includes(q)
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
  const activeHeroCount = heroBanners.filter((b) => b.isActive !== false).length;
  const activeMidCount = resolvedMidCampaigns.filter((m) => m.isActive !== false).length;
  const activePartnersCount = brandPartners.filter((b) => b.isActive !== false).length;

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      {/* Top Bar */}
      <AdminTopBar
        title="Carousel Banners & Ads"
        subtitle="Manage customer app hero carousel slides, mid-page deal banners, top spotlight carousels, and partner showcases"
        action={
          <div className="flex items-center gap-2.5">
            {activeTab === 'hero-banners' && (
              <button
                type="button"
                onClick={handleOpenCreateHeroBanner}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hero Carousel Slide</span>
              </button>
            )}
            {activeTab === 'mid-campaign' && (
              <button
                type="button"
                onClick={handleOpenCreateMidCampaign}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Mid-Page Deal Slide</span>
              </button>
            )}
            {activeTab === 'top-ads' && (
              <button
                type="button"
                onClick={handleOpenCreateAd}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Spotlight Ad</span>
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
          <div className="admin-filter-bar flex flex-wrap items-center gap-1.5 bg-[#14141e] border border-[#262638] p-1 rounded-xl">
            {/* TAB 1: Hero Carousel Banners */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('hero-banners');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'hero-banners'
                  ? 'bg-purple-600 text-white shadow-md'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#1a1a24]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Hero Package Carousel</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === 'hero-banners'
                    ? 'bg-white/20 text-white'
                    : isLight
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {activeHeroCount}/{heroBanners.length}
              </span>
            </button>

            {/* TAB 2: Mid-Page Deals Carousel */}
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
              <span>Mid-Page Deals Carousel</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  activeTab === 'mid-campaign'
                    ? 'bg-white/20 text-white'
                    : isLight
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {activeMidCount}/{resolvedMidCampaigns.length}
              </span>
            </button>

            {/* TAB 3: Top Spotlight Ads */}
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
              <span>Top Spotlight Carousel</span>
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

            {/* TAB 4: Brand Partners */}
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
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-stone-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, coupon..."
              className="w-full bg-[#14141e] border border-[#262638] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:border-purple-500 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ---------------- TAB: HERO PACKAGE CAROUSEL ---------------- */}
        {activeTab === 'hero-banners' && (
          <div className="space-y-4">
            <div
              className={`border rounded-2xl overflow-hidden shadow-xl ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#14141e] border-[#262638]'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b text-[11px] uppercase tracking-wider font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#181824] border-[#262638] text-stone-400'
                    }`}>
                      <th className="py-3 px-4">Banner Slide</th>
                      <th className="py-3 px-4">Headline & Description</th>
                      <th className="py-3 px-4">Destination Target</th>
                      <th className="py-3 px-4">Tag Badge</th>
                      <th className="py-3 px-4">Visibility</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#20202e]'}`}>
                    {filteredHeroBanners.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-500">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
                          <p className="font-semibold text-sm">No hero banners found</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Click "+ Add Hero Carousel Slide" to upload a new banner image.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredHeroBanners.map((banner) => {
                        const targetSalon = salons.find((s) => s.id === banner.salonId);
                        const isActive = banner.isActive !== false;

                        return (
                          <tr
                            key={banner.id}
                            className={`transition-colors ${
                              isLight ? 'hover:bg-slate-50/80' : 'hover:bg-[#1a1a26]'
                            }`}
                          >
                            {/* Banner Slide Preview */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-24 h-14 rounded-xl overflow-hidden bg-stone-900 border border-stone-700/60 shrink-0 relative group shadow-sm">
                                  <img
                                    src={banner.image}
                                    alt={banner.title}
                                    className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                                <div>
                                  <span className="font-mono text-[10px] text-stone-400 block">
                                    {banner.id}
                                  </span>
                                  <span className="text-[11px] font-bold text-amber-500 block">
                                    {banner.ctaText || 'Book Now'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Headline & Description */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="text-[10px] font-semibold text-purple-400">
                                {banner.subtitle}
                              </div>
                              <div className={`font-bold text-xs mt-0.5 whitespace-pre-line leading-tight ${
                                isLight ? 'text-slate-900' : 'text-white'
                              }`}>
                                {banner.title}
                              </div>
                              <p className={`text-[10.5px] truncate mt-1 ${isLight ? 'text-slate-500 font-medium' : 'text-stone-400'}`}>
                                {banner.desc}
                              </p>
                            </td>

                            {/* Destination Target */}
                            <td className="py-3.5 px-4">
                              <div className={`font-semibold truncate max-w-[170px] ${isLight ? 'text-slate-900' : 'text-stone-200'}`}>
                                {targetSalon ? targetSalon.name : banner.salonId ? banner.salonId : banner.link || 'All Salons'}
                              </div>
                              <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-stone-400'}`}>
                                {banner.serviceId ? `Service: ${banner.serviceId}` : 'Direct Link'}
                              </div>
                            </td>

                            {/* Tag */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                {banner.tag || 'Special Offer'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => toggleHeroBannerActive(banner.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                  isActive
                                    ? isLight
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : isLight
                                    ? 'bg-slate-100 text-slate-600 border border-slate-300'
                                    : 'bg-stone-800 text-stone-400 border border-stone-700'
                                }`}
                              >
                                {isActive ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Active</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3" />
                                    <span>Hidden</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditHeroBanner(banner)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                                    isLight
                                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200'
                                      : 'bg-[#222230] hover:bg-purple-950/70 hover:text-purple-300 text-stone-300 border-transparent'
                                  }`}
                                  title="Edit Banner Image & Text"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: 'hero',
                                      id: banner.id,
                                      title: banner.title?.replace(/\n/g, ' ') || 'Hero Banner'
                                    })
                                  }
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                                    isLight
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200'
                                      : 'bg-[#222230] hover:bg-red-950/70 hover:text-red-300 text-stone-300 border-transparent'
                                  }`}
                                  title="Delete Banner"
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

        {/* ---------------- TAB: MID-PAGE DEALS CAROUSEL ---------------- */}
        {activeTab === 'mid-campaign' && (
          <div className="space-y-6">
            <div
              className={`border rounded-2xl overflow-hidden shadow-xl ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#14141e] border-[#262638]'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b text-[11px] uppercase tracking-wider font-semibold ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#181824] border-[#262638] text-stone-400'
                    }`}>
                      <th className="py-3 px-4">Deal Slide Image</th>
                      <th className="py-3 px-4">Campaign Title & Highlight</th>
                      <th className="py-3 px-4">Coupon Code</th>
                      <th className="py-3 px-4">Badge & CTA</th>
                      <th className="py-3 px-4">Visibility</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#20202e]'}`}>
                    {filteredMidCampaigns.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-500">
                          <Flame className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
                          <p className="font-semibold text-sm">No mid-page deal slides found</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Click "+ Add Mid-Page Deal Slide" to add an interactive deal banner slide.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredMidCampaigns.map((cmp) => {
                        const isActive = cmp.isActive !== false;

                        return (
                          <tr
                            key={cmp.id || cmp.title}
                            className={`transition-colors ${
                              isLight ? 'hover:bg-slate-50/80' : 'hover:bg-[#1a1a26]'
                            }`}
                          >
                            {/* Slide Background Image Preview */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="w-24 h-14 rounded-xl overflow-hidden bg-gradient-to-r from-stone-900 to-purple-950 border border-purple-500/30 shrink-0 relative group shadow-sm">
                                {cmp.bannerImage && (
                                  <img
                                    src={cmp.bannerImage}
                                    alt={cmp.title}
                                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
                                  />
                                )}
                                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white bg-black/30 backdrop-blur-2xs">
                                  Slide
                                </span>
                              </div>
                            </td>

                            {/* Title & Highlight */}
                            <td className="py-3.5 px-4 max-w-sm">
                              <div className={`font-bold text-xs leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {cmp.title}
                              </div>
                              <div className="text-[10px] text-amber-400 font-medium mt-0.5">
                                {cmp.highlight}
                              </div>
                              {cmp.subtitle && (
                                <p className={`text-[10px] truncate mt-0.5 ${isLight ? 'text-slate-500' : 'text-stone-400'}`}>
                                  {cmp.subtitle}
                                </p>
                              )}
                            </td>

                            {/* Coupon Code */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {cmp.coupon ? (
                                <span className="font-mono text-[10px] font-extrabold px-2 py-1 rounded-md bg-amber-400 text-stone-950 shadow-2xs">
                                  {cmp.coupon}
                                </span>
                              ) : (
                                <span className="text-stone-500 text-[10px]">—</span>
                              )}
                            </td>

                            {/* Badge & CTA */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="text-[10.5px] font-semibold text-stone-300">
                                {cmp.badge || 'Sponsored'}
                              </div>
                              <div className="text-[10px] text-purple-400 font-bold">
                                CTA: {cmp.ctaText || 'Claim Pass'}
                              </div>
                            </td>

                            {/* Visibility Toggle */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => toggleMidCampaignActive(cmp.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                  isActive
                                    ? isLight
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : isLight
                                    ? 'bg-slate-100 text-slate-600 border border-slate-300'
                                    : 'bg-stone-800 text-stone-400 border border-stone-700'
                                }`}
                              >
                                {isActive ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Active</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3" />
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
                                  onClick={() => handleOpenEditMidCampaign(cmp)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                                    isLight
                                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200'
                                      : 'bg-[#222230] hover:bg-purple-950/70 hover:text-purple-300 text-stone-300 border-transparent'
                                  }`}
                                  title="Edit Deal Slide"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: 'mid',
                                      id: cmp.id,
                                      title: cmp.title || 'Mid Campaign Deal'
                                    })
                                  }
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                                    isLight
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200'
                                      : 'bg-[#222230] hover:bg-red-950/70 hover:text-red-300 text-stone-300 border-transparent'
                                  }`}
                                  title="Delete Deal Slide"
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

        {/* ---------------- TAB: TOP SPOTLIGHT ADS ---------------- */}
        {activeTab === 'top-ads' && (
          <div className="space-y-4">
            <div
              className={`border rounded-2xl overflow-hidden shadow-xl ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#14141e] border-[#262638]'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr
                      className={`border-b text-[11px] uppercase tracking-wider font-semibold ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-500'
                          : 'bg-[#181824] border-[#262638] text-stone-400'
                      }`}
                    >
                      <th className="py-3 px-4">Ad Image & Brand</th>
                      <th className="py-3 px-4">Headline / Offer</th>
                      <th className="py-3 px-4">Target Salon / Category</th>
                      <th className="py-3 px-4">Validity</th>
                      <th className="py-3 px-4">Visibility</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#20202e]'}`}>
                    {filteredAds.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-500">
                          <Layers className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
                          <p className="font-semibold text-sm">No ads found</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {searchQuery ? 'Try another search query' : 'Click "+ Add Spotlight Ad" to create one'}
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
                            className={`transition-colors ${
                              isLight ? 'hover:bg-slate-50/80' : 'hover:bg-[#1a1a26]'
                            }`}
                          >
                            {/* Ad Image & Brand */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-900 border border-stone-700/60 shrink-0 relative group">
                                  <img
                                    src={ad.image}
                                    alt={ad.brand}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                </div>
                                <div>
                                  <span className="font-bold text-sm block leading-tight text-white">
                                    {ad.brand}
                                  </span>
                                  <span className="text-[10px] text-purple-400 font-semibold block mt-0.5">
                                    {ad.sponsorBadge}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Headline / Offer */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className={`font-bold text-xs leading-tight whitespace-pre-line ${isLight ? 'text-slate-900' : 'text-stone-100'}`}>
                                {ad.title}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                {ad.discountBadge && (
                                  <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-400 border border-rose-800/40">
                                    {ad.discountBadge}
                                  </span>
                                )}
                                {ad.couponCode && (
                                  <span className="font-mono text-[9.5px] font-extrabold px-1.5 py-0.2 rounded border bg-amber-950/60 text-amber-300 border-amber-800/50">
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
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : isLight
                                    ? 'bg-slate-100 text-slate-600 border border-slate-300'
                                    : 'bg-stone-800 text-stone-400 border border-stone-700'
                                }`}
                              >
                                {isActive ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Active</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3" />
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

        {/* ---------------- TAB: BRAND PARTNER SHOWCASE ---------------- */}
        {activeTab === 'brand-partners' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPartners.length === 0 ? (
                <div className="col-span-full py-12 text-center text-stone-500 bg-[#14141e] border border-[#262638] rounded-2xl p-8">
                  <Award className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
                  <p className="font-semibold text-sm">No brand partners found</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Click "+ Add Brand Partner" to list a collaboration.
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
      </div>

      {/* ---------------- MODAL 1: ADD / EDIT HERO PACKAGE BANNER ---------------- */}
      {heroModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`border rounded-2xl w-full max-w-xl p-6 shadow-2xl relative my-8 ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#14141e] border-[#262638] text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-4 border-b ${isLight ? 'border-slate-200' : 'border-[#242433]'}`}>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span>{editingHeroBanner ? 'Edit Hero Banner Slide' : 'Add Hero Banner Slide'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setHeroModalOpen(false)}
                className={`cursor-pointer ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-stone-400 hover:text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitHeroBanner} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Banner Tag / Badge
                  </label>
                  <input
                    type="text"
                    value={heroFormData.tag}
                    onChange={(e) => setHeroFormData({ ...heroFormData, tag: e.target.value })}
                    placeholder="e.g. Trending Ritual, 40% OFF"
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Subtitle Lead
                  </label>
                  <input
                    type="text"
                    value={heroFormData.subtitle}
                    onChange={(e) => setHeroFormData({ ...heroFormData, subtitle: e.target.value })}
                    placeholder="e.g. Precision Beard & Hair Craft"
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
                  Banner Title * <span className="text-stone-500 font-normal">(Break line with Enter or \n)</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={heroFormData.title}
                  onChange={(e) => setHeroFormData({ ...heroFormData, title: e.target.value })}
                  placeholder="Executive Beard\n& Fade Sculpting"
                  className={`w-full rounded-xl px-3 py-2 outline-none border font-bold text-sm ${
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
                  value={heroFormData.desc}
                  onChange={(e) => setHeroFormData({ ...heroFormData, desc: e.target.value })}
                  placeholder="Short ritual description shown on the hero banner card..."
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
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={heroFormData.ctaText}
                    onChange={(e) => setHeroFormData({ ...heroFormData, ctaText: e.target.value })}
                    placeholder="e.g. Book Chair, Explore"
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Linked Destination Salon
                  </label>
                  <select
                    value={heroFormData.salonId}
                    onChange={(e) => setHeroFormData({ ...heroFormData, salonId: e.target.value })}
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  >
                    <option value="">All Salons Overview</option>
                    {salons.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.area || s.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                  Banner Image URL *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    required
                    value={heroFormData.image}
                    onChange={(e) => setHeroFormData({ ...heroFormData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className={`flex-1 rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                  {heroFormData.image && (
                    <div className="w-16 h-10 rounded-lg overflow-hidden border border-purple-500/40 shrink-0 bg-stone-900">
                      <img
                        src={heroFormData.image}
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
                  checked={heroFormData.isActive}
                  onChange={(e) => setHeroFormData({ ...heroFormData, isActive: e.target.checked })}
                  className="rounded text-purple-600 bg-stone-900 border-stone-700 w-4 h-4 cursor-pointer"
                />
                <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-stone-300'}`}>
                  Active (Visible in Customer Hero Carousel)
                </span>
              </label>

              <div className={`flex justify-end gap-3 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-[#242433]'}`}>
                <button
                  type="button"
                  onClick={() => setHeroModalOpen(false)}
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
                  {editingHeroBanner ? 'Update Slide' : 'Add Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 2: ADD / EDIT MID-PAGE DEAL CAMPAIGN ---------------- */}
      {midModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`border rounded-2xl w-full max-w-xl p-6 shadow-2xl relative my-8 ${
              isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#14141e] border-[#262638] text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-4 border-b ${isLight ? 'border-slate-200' : 'border-[#242433]'}`}>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Flame className="w-4 h-4 text-purple-600" />
                <span>{editingMidCampaign ? 'Edit Mid-Page Deal Slide' : 'Add Mid-Page Deal Slide'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setMidModalOpen(false)}
                className={`cursor-pointer ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-stone-400 hover:text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMidCampaign} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Badge Text
                  </label>
                  <input
                    type="text"
                    required
                    value={midFormData.badge}
                    onChange={(e) => setMidFormData({ ...midFormData, badge: e.target.value })}
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
                    value={midFormData.ctaText}
                    onChange={(e) => setMidFormData({ ...midFormData, ctaText: e.target.value })}
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
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  value={midFormData.title}
                  onChange={(e) => setMidFormData({ ...midFormData, title: e.target.value })}
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
                  value={midFormData.subtitle}
                  onChange={(e) => setMidFormData({ ...midFormData, subtitle: e.target.value })}
                  placeholder="e.g. Co-sponsored by Lakmé & O3+ Pro"
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
                    Highlight Offer Message *
                  </label>
                  <input
                    type="text"
                    required
                    value={midFormData.highlight}
                    onChange={(e) => setMidFormData({ ...midFormData, highlight: e.target.value })}
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
                    value={midFormData.coupon}
                    onChange={(e) => setMidFormData({ ...midFormData, coupon: e.target.value.toUpperCase() })}
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
                  Banner Background Image URL *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    required
                    value={midFormData.bannerImage}
                    onChange={(e) => setMidFormData({ ...midFormData, bannerImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className={`flex-1 rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                  {midFormData.bannerImage && (
                    <div className="w-16 h-10 rounded-lg overflow-hidden border border-purple-500/40 shrink-0 bg-stone-900">
                      <img
                        src={midFormData.bannerImage}
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
                  checked={midFormData.isActive}
                  onChange={(e) => setMidFormData({ ...midFormData, isActive: e.target.checked })}
                  className="rounded text-purple-600 bg-stone-900 border-stone-700 w-4 h-4 cursor-pointer"
                />
                <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-stone-300'}`}>
                  Active (Visible in Customer Mid-Page Deals Carousel)
                </span>
              </label>

              <div className={`flex justify-end gap-3 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-[#242433]'}`}>
                <button
                  type="button"
                  onClick={() => setMidModalOpen(false)}
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
                  {editingMidCampaign ? 'Update Deal Slide' : 'Add Deal Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 3: ADD / EDIT SPOTLIGHT AD ---------------- */}
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

      {/* ---------------- MODAL 4: ADD / EDIT BRAND PARTNER ---------------- */}
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
                    placeholder="e.g. Parisian Hair Expert"
                    className={`w-full rounded-xl px-3 py-2 outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 focus:border-purple-600'
                        : 'bg-[#0d0d14] border-[#2c2c40] text-white focus:border-purple-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-1 font-semibold ${isLight ? 'text-slate-700' : 'text-stone-400'}`}>
                    Offer Badge *
                  </label>
                  <input
                    type="text"
                    required
                    value={partnerFormData.offer}
                    onChange={(e) =>
                      setPartnerFormData({ ...partnerFormData, offer: e.target.value })
                    }
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
                  Coupon Code
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
                  placeholder="e.g. LOREALPRO"
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
