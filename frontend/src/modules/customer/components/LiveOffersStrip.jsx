import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Tag,
  Sparkles,
  Flame,
  ChevronRight,
  Store,
  MapPin,
  Star,
  Check,
  X,
  ShoppingBag,
  Zap
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { api } from '../../../shared/services/api';
import { isOfferLiveNow, offerMatchesService, offerScopeText } from '../../../shared/lib/offers';

export const LiveOffersStrip = () => {
  const navigate = useNavigate();
  const { offers = [], currentLocation, addToCart, setIsCartOpen, showToast } = useCustomer();
  const { state } = useAppData();

  const [selectedDealForModal, setSelectedDealForModal] = useState(null);
  const [loadingDealSalons, setLoadingDealSalons] = useState(false);

  const targetCity = (currentLocation?.city || '').toLowerCase().trim();

  // Location filter for salons
  const isMatchingCity = (salon) => {
    if (!targetCity) return true;
    const sCity = (salon.locationCity || salon.city || '').toLowerCase();
    const sArea = (salon.area || '').toLowerCase();
    const sAddr = (salon.address || '').toLowerCase();
    return sCity.includes(targetCity) || sArea.includes(targetCity) || sAddr.includes(targetCity);
  };

  // Filter active approved deals
  const liveDeals = (offers || []).filter((offer) => {
    // Only offers that are live right now (active, approved, not expired, valid today)
    if (!isOfferLiveNow(offer)) return false;

    // 1. If specific salon deal, check if that salon belongs to current city
    if (offer.salonId && offer.salonId !== 'all') {
      const salon = (state.salons || []).find((s) => s.id === offer.salonId || s._id === offer.salonId);
      if (salon && !isMatchingCity(salon)) {
        return false;
      }
    } else {
      // 2. If 'all' (Global deal), ONLY show if there is at least one verified salon in customer's city!
      // If customer is in Bhopal, Agra etc. where no salon exists, don't show the offer.
      const hasAnySalonInCity = (state.salons || []).some((s) => s.isVerified && isMatchingCity(s));
      if (!hasAnySalonInCity) {
        return false;
      }
    }
    return true;
  });

  if (liveDeals.length === 0) return null;

  // Matching salons for a deal
  const getSalonsForDeal = (deal, servicesOverride) => {
    if (!deal) return [];
    if (deal.salonId && deal.salonId !== 'all') {
      const found = (state.salons || []).find((s) => s.id === deal.salonId || s._id === deal.salonId);
      return found ? [found] : [];
    }
    // Global deal: verified salons in this city that actually offer a matching service
    const citySalons = (state.salons || []).filter((s) => s.isVerified && isMatchingCity(s));
    const svcs = servicesOverride || state.services || [];
    return citySalons.filter((s) =>
      svcs.some((svc) => String(svc.salonId) === String(s.id || s._id) && svc.isActive !== false && offerMatchesService(deal, svc))
    );
  };

  const openSalonForDeal = (salon) => {
    setSelectedDealForModal(null);
    navigate(`/customer/salons/${salon.id || salon._id}`);
  };

  // Real-app flow: an offer is a discount on the salon's real services → open the salon page,
  // where matching services already show the discounted price.
  const handleBookDealClick = async (e, deal) => {
    e.stopPropagation();
    // Single-salon deal → straight to that salon
    if (deal.salonId && deal.salonId !== 'all') {
      const salons = getSalonsForDeal(deal);
      if (salons.length === 1) return openSalonForDeal(salons[0]);
      return setSelectedDealForModal(deal);
    }
    // Global deal → load ALL salons' services from DB, then list salons that really offer it
    setSelectedDealForModal(deal);
    setLoadingDealSalons(true);
    try {
      const fresh = await api.services.listAll();
      const salons = getSalonsForDeal(deal, fresh);
      if (salons.length === 1) openSalonForDeal(salons[0]);
    } finally {
      setLoadingDealSalons(false);
    }
  };

  return (
    <>
      <section className="px-4 w-full max-w-full min-w-0 box-border mt-3" data-purpose="live-admin-offers-strip">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 shadow-xs">
              <Flame className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
            </span>
            <div>
              <h2 className="text-sm lg:text-base font-bold text-stone-900 tracking-tight leading-tight">
                Exclusive Offers & Deals
              </h2>
              <p className="text-[10px] text-stone-500">Platform discounts on popular services</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/customer/salons')}
            className="text-xs font-bold text-brand-maroon flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal Scroll of Offer Cards */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-0.5 w-full">
          {liveDeals.map((deal) => {
            const discountLabel = deal.discount || (deal.discountPercent ? `${deal.discountPercent}% OFF` : 'SPECIAL OFFER');
            const isGlobal = deal.salonId === 'all' || !deal.salonId;

            return (
              <motion.div
                key={deal.id || deal._id}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => handleBookDealClick(e, deal)}
                className="min-w-[260px] max-w-[280px] bg-gradient-to-br from-purple-900 via-indigo-950 to-stone-950 text-white rounded-2xl p-3.5 flex flex-col justify-between shadow-md relative overflow-hidden shrink-0 cursor-pointer border border-purple-800/40 hover:border-purple-500/60 transition-all group"
              >
                {/* Background ambient badge */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

                <div>
                  {/* Header row: Discount chip & Global/Salon tag */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-stone-950 shadow-xs flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 fill-stone-950" />
                      {discountLabel}
                    </span>

                    <span className="text-[9px] font-semibold text-purple-200/80 bg-white/10 backdrop-blur-xs px-2 py-0.5 rounded-md truncate max-w-[120px] flex items-center gap-1">
                      <Store className="w-2.5 h-2.5 shrink-0 text-amber-300" />
                      {isGlobal ? 'All Partner Salons' : (deal.salonName || 'Specific Salon')}
                    </span>
                  </div>

                  {/* Offer Title */}
                  <h3 className="font-bold text-sm tracking-tight text-white line-clamp-1 group-hover:text-purple-200 transition-colors">
                    {deal.title}
                  </h3>

                  {/* Subcategories tags */}
                  <p className="text-[10.5px] text-purple-200/90 font-medium mt-0.5 line-clamp-1">
                    {deal.subcategory || deal.category}
                  </p>

                  {/* Description snippet */}
                  {deal.description && (
                    <p className="text-[10px] text-stone-300/80 mt-1.5 line-clamp-2 leading-relaxed">
                      {deal.description}
                    </p>
                  )}
                </div>

                {/* Price & Action Footer */}
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[9px] text-stone-400 block uppercase font-bold tracking-wider">Save on</span>
                    <span className="text-emerald-400 font-bold text-[11px] line-clamp-1">{offerScopeText(deal)}</span>
                    {deal.validTill && <span className="text-[9px] text-stone-400 block">Valid till {deal.validTill}</span>}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleBookDealClick(e, deal)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white text-stone-950 rounded-xl font-bold text-[11px] shadow-xs group-hover:bg-amber-300 active:scale-95 transition-all cursor-pointer"
                  >
                    <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>View Deal</span>
                    <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ---------------- SALON PICKER DIALOG (FOR GLOBAL DEALS) ---------------- */}
      <AnimatePresence>
        {selectedDealForModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 tracking-wider">
                    {selectedDealForModal.discount || 'Special Discount'} Applied
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mt-1">
                    Select Salon for {selectedDealForModal.title}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {selectedDealForModal.discountPercent}% OFF on <span className="font-semibold text-stone-700">{offerScopeText(selectedDealForModal)}</span> — applied automatically at the salon
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDealForModal(null)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Salons List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
                {!loadingDealSalons && getSalonsForDeal(selectedDealForModal).map((salon) => (
                  <div
                    key={salon.id || salon._id}
                    onClick={() => openSalonForDeal(salon)}
                    className="p-3.5 rounded-2xl border border-stone-200 hover:border-purple-600 bg-stone-50/60 hover:bg-purple-50/40 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-base shrink-0 border border-purple-200">
                        {salon.name?.charAt(0) || 'S'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate group-hover:text-purple-700">
                          {salon.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10.5px] text-stone-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{salon.area || salon.locationCity || salon.city || 'Local Area'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 font-bold text-stone-800">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            {Number(salon.rating) > 0 ? Number(salon.rating).toFixed(1) : 'New'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-brand-maroon text-white font-bold text-xs shrink-0 group-hover:bg-purple-700 transition-colors shadow-xs"
                    >
                      View Salon
                    </button>
                  </div>
                ))}

                {loadingDealSalons && (
                  <div className="text-center py-8 text-stone-500 text-xs">Finding salons with this offer…</div>
                )}
                {!loadingDealSalons && getSalonsForDeal(selectedDealForModal).length === 0 && (
                  <div className="text-center py-8 text-stone-500 text-xs leading-relaxed">
                    No salon {currentLocation?.city ? `in ${currentLocation.city} ` : ''}offers <b>{offerScopeText(selectedDealForModal)}</b> yet.
                    <br />
                    The offer applies automatically as soon as a salon adds this service.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
