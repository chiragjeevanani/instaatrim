import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Store,
  Scissors,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Flame,
  Award,
  Star,
  Zap,
  Tag,
  X,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

const BADGE_PRESETS = [
  'SPONSORED',
  'SPONSORED • TOP PICK',
  'FEATURED PARTNER',
  'TRENDING #1',
  'EDITOR’S CHOICE',
  'BEST VALUE',
  'ELITE VIP',
  'PREMIUM SPOTLIGHT'
];

export const AdminPromotionsPage = () => {
  const {
    salons = [],
    services = [],
    boostSalon,
    removeSalonBoost,
    boostService,
    removeServiceBoost,
    theme
  } = useAdmin();

  const isLight = theme === 'light';

  // Active Tab: 'salons' | 'services'
  const [activeTab, setActiveTab] = useState('salons');
  const [search, setSearch] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('salon'); // 'salon' | 'service'
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [boostRank, setBoostRank] = useState(1);
  const [sponsorBadge, setSponsorBadge] = useState('SPONSORED • TOP PICK');
  const [boostReason, setBoostReason] = useState('Paid Sponsorship Campaign');
  const [isSponsored, setIsSponsored] = useState(true);
  const [isBoosted, setIsBoosted] = useState(true);
  const [formError, setFormError] = useState('');

  // Remove confirmation modal
  const [removeConfirm, setRemoveConfirm] = useState(null); // { type: 'salon'|'service', id, name }

  // Boosted Salons
  const boostedSalons = useMemo(() => {
    return salons
      .filter((s) => s.isBoosted || s.isSponsored || (s.boostRank && s.boostRank > 0))
      .sort((a, b) => (a.boostRank || 999) - (b.boostRank || 999));
  }, [salons]);

  // Boosted Services
  const boostedServices = useMemo(() => {
    return services
      .filter((srv) => srv.isBoosted || srv.isSponsored || (srv.boostRank && srv.boostRank > 0))
      .sort((a, b) => (a.boostRank || 999) - (b.boostRank || 999));
  }, [services]);

  // Filtered lists
  const displaySalons = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return boostedSalons;
    return boostedSalons.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.area?.toLowerCase().includes(q) ||
        s.boostReason?.toLowerCase().includes(q) ||
        s.sponsorBadge?.toLowerCase().includes(q)
    );
  }, [boostedSalons, search]);

  const displayServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return boostedServices;
    return boostedServices.filter(
      (srv) =>
        srv.name.toLowerCase().includes(q) ||
        srv.category?.toLowerCase().includes(q) ||
        srv.boostReason?.toLowerCase().includes(q) ||
        srv.sponsorBadge?.toLowerCase().includes(q)
    );
  }, [boostedServices, search]);

  // Open Boost Modal
  const handleOpenBoostModal = (type = 'salon', presetId = '') => {
    setModalType(type);
    setSelectedEntityId(presetId || (type === 'salon' ? salons[0]?.id : services[0]?.id));
    const currentList = type === 'salon' ? boostedSalons : boostedServices;
    setBoostRank(currentList.length + 1);
    setSponsorBadge(type === 'salon' ? 'SPONSORED • TOP PICK' : 'TRENDING #1');
    setBoostReason('Paid Sponsorship Campaign');
    setIsSponsored(true);
    setIsBoosted(true);
    setFormError('');
    setIsModalOpen(true);
  };

  // Submit Boost
  const handleSaveBoost = async (e) => {
    e.preventDefault();
    if (!selectedEntityId) {
      setFormError('Please select a salon or service to boost.');
      return;
    }

    const payload = {
      isBoosted,
      isSponsored,
      boostRank: Number(boostRank) || 1,
      sponsorBadge: sponsorBadge.trim() || 'SPONSORED',
      boostReason: boostReason.trim() || 'Featured Priority Spotlight'
    };

    try {
      if (modalType === 'salon') {
        await boostSalon(selectedEntityId, payload);
      } else {
        await boostService(selectedEntityId, payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to save promotion boost.');
    }
  };

  // Quick move rank up/down
  const handleShiftRank = async (type, entity, direction) => {
    const delta = direction === 'up' ? -1 : 1;
    const currentRank = entity.boostRank || 1;
    const nextRank = Math.max(1, currentRank + delta);
    if (nextRank === currentRank) return;

    const payload = {
      isBoosted: entity.isBoosted !== false,
      isSponsored: entity.isSponsored !== false,
      boostRank: nextRank,
      sponsorBadge: entity.sponsorBadge || 'SPONSORED',
      boostReason: entity.boostReason || 'Priority Ranking'
    };

    if (type === 'salon') {
      await boostSalon(entity.id, payload);
    } else {
      await boostService(entity.id, payload);
    }
  };

  // Confirm remove
  const handleConfirmRemove = async () => {
    if (!removeConfirm) return;
    try {
      if (removeConfirm.type === 'salon') {
        await removeSalonBoost(removeConfirm.id);
      } else {
        await removeServiceBoost(removeConfirm.id);
      }
      setRemoveConfirm(null);
    } catch (err) {
      // toast shown in context
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      <AdminTopBar
        title="Sponsored & Indexing Boost"
        subtitle="Push any salon partner or service package to the top index with custom promotional badges"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenBoostModal('salon')}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-stone-950 text-xs font-bold rounded-xl shadow-md shadow-amber-950/40 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-stone-950" />
              <span>Boost Salon to Top</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenBoostModal('service')}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-98 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-950/40 transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Boost Service to Top</span>
            </button>
          </div>
        }
      />

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Boosted Salons</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{boostedSalons.length}</h3>
              <p className="text-[10px] text-stone-500 mt-0.5">Top of search &amp; directory</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
          </div>

          <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Boosted Services</p>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">{boostedServices.length}</h3>
              <p className="text-[10px] text-stone-500 mt-0.5">Prioritized in trending tabs</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <Scissors className="w-5 h-5" />
            </div>
          </div>

          <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Homepage Top Strip</p>
              <h3 className="text-sm font-bold text-white mt-1">
                {boostedSalons[0]?.name || 'Auto Verified Fallback'}
              </h3>
              <p className="text-[10px] text-emerald-400 mt-0.5">Rank #1 Active Spotlight</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>

          <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Indexing Engine</p>
              <h3 className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Live Override Active
              </h3>
              <p className="text-[10px] text-stone-500 mt-0.5">Bypasses default distance/score</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          {/* Tabs */}
          <div className="admin-filter-bar flex items-center gap-1.5 p-1 bg-[#14141e] border border-[#262638] rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('salons')}
              className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'salons'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Sponsored Salons ({boostedSalons.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'services'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Boosted Services ({boostedServices.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search boosted ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#14141e] border border-[#262638] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* ---------------- SALONS TAB ---------------- */}
        {activeTab === 'salons' && (
          <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="admin-table-header border-b border-[#232333] bg-[#111119] text-stone-400 uppercase tracking-wider">
                    <th className="py-3.5 px-5 font-semibold">Priority Rank</th>
                    <th className="py-3.5 px-4 font-semibold">Salon Partner</th>
                    <th className="py-3.5 px-4 font-semibold">Promotional Badge</th>
                    <th className="py-3.5 px-4 font-semibold">Indexing Reason / Campaign</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f2e]">
                  {displaySalons.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-stone-500">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-400" />
                        <p className="text-sm font-medium text-stone-300">No boosted salons found</p>
                        <p className="text-xs text-stone-500 mt-1">
                          Click "Boost Salon to Top" to index a salon at the very top of search results.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    displaySalons.map((salon) => {
                      return (
                        <tr key={salon.id} className="hover:bg-[#181824]/60 transition-colors group">
                          {/* Priority Rank */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-xs flex items-center justify-center border border-amber-500/40">
                                #{salon.boostRank || 1}
                              </span>
                              <div className="flex flex-col gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleShiftRank('salon', salon, 'up')}
                                  title="Move Rank Up (Higher Priority)"
                                  className="p-1 rounded bg-[#1f1f2e] hover:bg-[#2b2b3d] text-stone-400 hover:text-white transition-colors"
                                >
                                  <ArrowUp className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleShiftRank('salon', salon, 'down')}
                                  title="Move Rank Down"
                                  className="p-1 rounded bg-[#1f1f2e] hover:bg-[#2b2b3d] text-stone-400 hover:text-white transition-colors"
                                >
                                  <ArrowDown className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Salon Partner */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-purple-950/40 border border-[#2d2d42] shrink-0">
                                <img
                                  src={salon.coverImage}
                                  alt={salon.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-white font-bold text-sm tracking-tight flex items-center gap-1.5">
                                  <span>{salon.name}</span>
                                </div>
                                <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                                  <span>{salon.area}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    {salon.rating}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Sponsor Badge */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-xs">
                              <Sparkles className="w-2.5 h-2.5 fill-current" />
                              {salon.sponsorBadge || 'SPONSORED'}
                            </span>
                          </td>

                          {/* Boost Reason */}
                          <td className="py-3.5 px-4">
                            <div className="text-stone-300 text-xs font-medium">
                              {salon.boostReason || 'Featured Partner Spotlight'}
                            </div>
                            <div className="text-[10px] text-stone-500">Bypasses standard geo-ranking</div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Pushed to Top
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenBoostModal('salon', salon.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#1a1a26] border border-[#2b2b3d] text-stone-300 hover:text-white text-xs font-semibold hover:border-purple-500/50 transition-colors"
                              >
                                Edit Boost
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setRemoveConfirm({ type: 'salon', id: salon.id, name: salon.name })
                                }
                                title="Remove Boost & Restore Natural Indexing"
                                className="p-1.5 rounded-lg bg-[#1a1a26] border border-[#2b2b3d] text-stone-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
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
        )}

        {/* ---------------- SERVICES TAB ---------------- */}
        {activeTab === 'services' && (
          <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="admin-table-header border-b border-[#232333] bg-[#111119] text-stone-400 uppercase tracking-wider">
                    <th className="py-3.5 px-5 font-semibold">Priority Rank</th>
                    <th className="py-3.5 px-4 font-semibold">Treatment &amp; Salon</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 font-semibold">Promotional Badge</th>
                    <th className="py-3.5 px-4 font-semibold">Indexing Reason</th>
                    <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f1f2e]">
                  {displayServices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-stone-500">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30 text-purple-400" />
                        <p className="text-sm font-medium text-stone-300">No boosted treatment services found</p>
                        <p className="text-xs text-stone-500 mt-1">
                          Click "Boost Service to Top" to pin a treatment to the top of trending packages.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    displayServices.map((srv) => {
                      const salon = salons.find((s) => s.id === srv.salonId);

                      return (
                        <tr key={srv.id} className="hover:bg-[#181824]/60 transition-colors group">
                          {/* Priority Rank */}
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 font-extrabold text-xs flex items-center justify-center border border-purple-500/40">
                                #{srv.boostRank || 1}
                              </span>
                              <div className="flex flex-col gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleShiftRank('service', srv, 'up')}
                                  title="Move Rank Up"
                                  className="p-1 rounded bg-[#1f1f2e] hover:bg-[#2b2b3d] text-stone-400 hover:text-white transition-colors"
                                >
                                  <ArrowUp className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleShiftRank('service', srv, 'down')}
                                  title="Move Rank Down"
                                  className="p-1 rounded bg-[#1f1f2e] hover:bg-[#2b2b3d] text-stone-400 hover:text-white transition-colors"
                                >
                                  <ArrowDown className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Treatment Details */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-purple-950/40 border border-[#2d2d42] shrink-0">
                                <img
                                  src={srv.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'}
                                  alt={srv.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-white font-bold text-sm tracking-tight">
                                  {srv.name}
                                </div>
                                <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                                  <span className="text-purple-300 font-semibold">{salon?.name || 'Salon'}</span>
                                  <span>•</span>
                                  <span className="font-semibold text-emerald-400">₹{srv.price}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#1e1e2d] border border-[#2e2e42] text-stone-300">
                              {srv.category}
                            </span>
                          </td>

                          {/* Promotional Badge */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs">
                              <Sparkles className="w-2.5 h-2.5 fill-current" />
                              {srv.sponsorBadge || 'TRENDING #1'}
                            </span>
                          </td>

                          {/* Reason */}
                          <td className="py-3.5 px-4 text-stone-300 font-medium">
                            {srv.boostReason || 'Featured Service Campaign'}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenBoostModal('service', srv.id)}
                                className="px-2.5 py-1 rounded-lg bg-[#1a1a26] border border-[#2b2b3d] text-stone-300 hover:text-white text-xs font-semibold hover:border-purple-500/50 transition-colors"
                              >
                                Edit Boost
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setRemoveConfirm({ type: 'service', id: srv.id, name: srv.name })
                                }
                                title="Remove Boost"
                                className="p-1.5 rounded-lg bg-[#1a1a26] border border-[#2b2b3d] text-stone-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
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
        )}
      </div>

      {/* ---------------- PUSH TO TOP / BOOST MODAL ---------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#14141e] border border-[#2d2d42] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#242436] flex items-center justify-between bg-[#111119]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 fill-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {modalType === 'salon' ? 'Push Salon to Top Index' : 'Push Service Package to Top Index'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Bypasses organic ranking scores to pin this entity in high-visibility spots
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-[#1e1e2d] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBoost} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Entity Selection */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Select {modalType === 'salon' ? 'Salon Partner' : 'Service Package'}{' '}
                  <span className="text-red-400">*</span>
                </label>
                <select
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                  className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 font-medium"
                >
                  {modalType === 'salon'
                    ? salons.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.area} • {s.category})
                        </option>
                      ))
                    : services.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} — ₹{srv.price} ({srv.category})
                        </option>
                      ))}
                </select>
              </div>

              {/* Priority Rank & Custom Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Indexing Priority Rank <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      required
                      value={boostRank}
                      onChange={(e) => setBoostRank(e.target.value)}
                      className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-amber-300 font-bold text-sm focus:outline-none focus:border-amber-500"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-500">
                      1 = Top Spot
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    required
                    value={sponsorBadge}
                    onChange={(e) => setSponsorBadge(e.target.value)}
                    placeholder="e.g. SPONSORED • TOP PICK"
                    className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 uppercase font-semibold"
                  />
                </div>
              </div>

              {/* Quick Badge Presets */}
              <div>
                <span className="text-[10px] text-stone-400 block mb-1.5">Badge Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {BADGE_PRESETS.map((bp) => (
                    <button
                      key={bp}
                      type="button"
                      onClick={() => setSponsorBadge(bp)}
                      className={`px-2 py-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
                        sponsorBadge === bp
                          ? 'bg-amber-400/30 text-amber-300 border-amber-500 font-bold'
                          : 'bg-[#181824] text-stone-400 border-[#2b2b3d] hover:text-white'
                      }`}
                    >
                      {bp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Promotion / Sponsorship Reason */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Reason / Internal Commercial Campaign Notes
                </label>
                <textarea
                  rows={2}
                  required
                  value={boostReason}
                  onChange={(e) => setBoostReason(e.target.value)}
                  placeholder="e.g. Paid Monthly Top Spot Sponsorship (₹30,000/mo), New Launch Partner Booster"
                  className="w-full bg-[#101018] border border-[#2d2d42] rounded-xl px-3.5 py-2 text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Sponsor Highlight Toggles */}
              <div className="space-y-2 p-3 rounded-xl bg-[#101018] border border-[#262638]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white text-xs">Render as Sponsored Partner</div>
                    <div className="text-[10px] text-stone-500">
                      Displays custom gold badge, star glow ring, and sponsored tag
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSponsored}
                      onChange={(e) => setIsSponsored(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#262638] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-[#242436] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#2d2d42] text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-stone-950 font-bold transition-all shadow-md shadow-amber-950/40 cursor-pointer"
                >
                  Push to Top Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- REMOVE CONFIRM MODAL ---------------- */}
      {removeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#14141e] border border-red-800/60 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Remove Boost for "{removeConfirm.name}"?
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                This entity will no longer be pushed to the top and will return to standard organic ranking.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRemoveConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#2d2d42] text-stone-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-bold text-xs transition-all shadow-md shadow-red-950/40 cursor-pointer"
              >
                Remove Boost
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
