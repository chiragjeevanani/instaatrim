import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { findCategoryBySlug } from '../../../shared/data/seed';
import { BRAND_PARTNERS } from '../../../shared/data/advertisements';
import { useCustomer } from '../context/CustomerContext';
import { BottomNav } from '../components/BottomNav';
import { CartDrawer } from '../components/CartDrawer';
import { Search, ArrowLeft, Star, Heart, Zap, CheckCircle2, MapPin, X, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const SalonListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentLocation, favoriteSalonIds, toggleFavorite, addToCart, setIsBookingFlowOpen, showToast } = useCustomer();
  const { state } = useAppData();

  // Category and Brand filters
  const categorySlug = searchParams.get('category') || '';
  const activeCategory = categorySlug ? findCategoryBySlug(categorySlug) : null;

  const brandQuery = searchParams.get('brand') || '';
  const activeBrand = brandQuery
    ? BRAND_PARTNERS.find(
        (b) =>
          b.name.toLowerCase() === brandQuery.toLowerCase() ||
          b.fullName?.toLowerCase().includes(brandQuery.toLowerCase())
      ) || { name: brandQuery, offer: 'Special Offer', logo: '💎' }
    : null;

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedGender, setSelectedGender] = useState('All');
  const [instantOnly, setInstantOnly] = useState(false);
  const [sortBy, setSortBy] = useState('Recommended');

  const salonsWithServices = useMemo(
    () =>
      state.salons.map((salon) => ({
        ...salon,
        services: state.services.filter((sv) => sv.salonId === salon.id && sv.isActive)
      })),
    [state.salons, state.services]
  );

  const filteredSalons = useMemo(() => {
    return salonsWithServices
      .filter((salon) => {
        const isLive = salon.isVerified && salon.verificationStatus === 'Live';
        if (!isLive) return false;

        const matchesCategory =
          !activeCategory || salon.services.some((s) => activeCategory.serviceCategories.includes(s.category));

        const term = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !term ||
          salon.name.toLowerCase().includes(term) ||
          salon.tagline.toLowerCase().includes(term) ||
          salon.area.toLowerCase().includes(term) ||
          salon.services.some((s) => s.name.toLowerCase().includes(term) || s.category.toLowerCase().includes(term));

        const matchesGender =
          selectedGender === 'All' ||
          salon.category.toLowerCase() === selectedGender.toLowerCase() ||
          salon.category.toLowerCase() === 'unisex';

        const matchesInstant = !instantOnly || (salon.hasInstantBooking && salon.isInstantBookingEnabled && salon.isStoreOpen);

        return matchesCategory && matchesSearch && matchesGender && matchesInstant;
      })
      .sort((a, b) => {
        if (sortBy === 'Highest Rated') return b.rating - a.rating;
        if (sortBy === 'Nearest') return (a.distanceKm ?? 99) - (b.distanceKm ?? 99);
        if (sortBy === 'Price Low to High') return a.startingPrice - b.startingPrice;
        if (sortBy === 'Price High to Low') return b.startingPrice - a.startingPrice;
        if (sortBy === 'Best Offers') return (b.offer ? 1 : 0) - (a.offer ? 1 : 0);
        // Recommended: a light composite of rating, review volume and
        // instant availability — real ranking weights land in Phase 3's
        // shared/lib/ranking.js; this replaces the previous no-op that
        // always returned 0.
        const scoreOf = (s) => s.rating * 20 + Math.min(s.reviewsCount, 500) / 10 + (s.isInstantBookingEnabled ? 15 : 0);
        return scoreOf(b) - scoreOf(a);
      });
  }, [salonsWithServices, activeCategory, searchTerm, selectedGender, instantOnly, sortBy]);

  const clearCategory = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('category');
    setSearchParams(next);
  };

  const clearBrand = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('brand');
    setSearchParams(next);
  };

  const handleQuickBookSponsored = (e) => {
    e?.stopPropagation();
    const hydraService = {
      id: 'srv-sponsored-hydra',
      name: '7-Step Korean HydraGlo Facial Infusion',
      price: 1499,
      originalPrice: 2200,
      duration: '60 mins',
      category: 'Facial',
      salonId: 'sal-2',
      salonName: 'Enrich Glamour Studio',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'
    };
    addToCart(hydraService, { id: 'sal-2', name: 'Enrich Glamour Studio' });
    showToast('7-Step Korean HydraGlo Facial added! Opening booking...');
    setIsBookingFlowOpen(true);
  };

  return (
    <div
      className="w-full max-w-[480px] min-w-0 bg-[#faf9f6] text-stone-900 min-h-screen pb-20 mx-auto border-x border-stone-200/80 flex flex-col justify-between overflow-x-hidden box-border shadow-md"
    >
      {/* Top Bar with Search */}
      <header className="sticky top-0 z-30 bg-[#faf9f6]/95 backdrop-blur-md px-3.5 pt-2 pb-2 border-b border-stone-200/80">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate(-1)} className="p-1 text-stone-700 active:scale-95 cursor-pointer">
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xs font-bold text-stone-900 truncate">
              {activeBrand
                ? `${activeBrand.name} Certified Salons`
                : activeCategory
                ? `${activeCategory.name} in ${currentLocation?.area || 'Indore'}`
                : 'Discover Salons & Spas'}
            </h1>
            <p className="text-[10px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-stone-700 shrink-0" />
              {currentLocation?.area || 'South Tukoganj'}
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-2.5 pointer-events-none stroke-[1.8]" />
          <input
            type="text"
            placeholder="Search salon, haircut, beard, facial, spa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-stone-200/70 rounded-xl text-xs text-stone-800 placeholder-stone-500 border border-stone-300/60 focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
        </div>

        {/* Active Filter Badges */}
        {(activeCategory || activeBrand) && (
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
            {activeCategory && (
              <span className="inline-flex items-center gap-1 bg-[#1e2329] text-white text-[10.5px] font-bold px-2 py-1 rounded-full shrink-0 shadow-2xs">
                {activeCategory.name}
                <button onClick={clearCategory} className="active:opacity-60 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeBrand && (
              <span className="inline-flex items-center gap-1 bg-stone-200 text-stone-900 border border-stone-300 text-[10.5px] font-bold px-2 py-1 rounded-full shrink-0 shadow-2xs">
                <span>{activeBrand.logo}</span>
                <span>{activeBrand.name} Partner Salons</span>
                <button onClick={clearBrand} className="active:opacity-60 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Filter & Sort Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 pb-0.5 text-xs">
          <button
            onClick={() => setInstantOnly(!instantOnly)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold shrink-0 transition-colors cursor-pointer ${
              instantOnly
                ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/80'
            }`}
          >
            <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>Instant Booking</span>
          </button>

          {['All', 'Men', 'Women', 'Unisex'].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold shrink-0 transition-colors cursor-pointer ${
                selectedGender === g
                  ? 'bg-[#1e2329] text-white shadow-2xs'
                  : 'bg-stone-200/80 text-stone-700 hover:bg-stone-300/80'
              }`}
            >
              {g}
            </button>
          ))}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-stone-200/80 text-stone-800 text-[10.5px] font-bold px-2 py-1 rounded-full border border-stone-300/70 outline-none shrink-0 cursor-pointer"
          >
            <option value="Recommended">Recommended</option>
            <option value="Nearest">Nearest</option>
            <option value="Highest Rated">Top Rated</option>
            <option value="Price Low to High">Price: Low to High</option>
            <option value="Price High to Low">Price: High to Low</option>
            <option value="Best Offers">Best Offers</option>
          </select>
        </div>
      </header>

      {/* Salon Results List */}
      <main className="flex-1 p-3 space-y-3">
        {/* TOUCHPOINT 2: BRAND PARTNER STORE STRIP / CERTIFIED SALONS BANNER */}
        {activeBrand && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-950 via-stone-900 to-[#78233f] text-white p-3.5 rounded-2xl shadow-md border border-amber-300/80 mb-3"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 bg-amber-400 text-stone-950 text-[8.5px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 fill-current" />
                Official Brand Store Strip
              </span>
              <button onClick={clearBrand} className="p-1 text-stone-400 hover:text-white rounded-full cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-start gap-3 mt-2">
              <span className="text-3xl shrink-0 mt-0.5">{activeBrand.logo}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-white leading-tight">
                  {activeBrand.fullName || activeBrand.name} Certified Salons
                </h3>
                <p className="text-[10px] text-amber-200/90 mt-0.5 leading-snug">
                  {activeBrand.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-extrabold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/40">
                    {activeBrand.offer} Applied (Code: {activeBrand.couponCode})
                  </span>
                  <span className="text-[8.5px] text-stone-300">Certified Authentic Products</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TOUCHPOINT 5: SPONSORED SEARCH & KEYWORD BIDDING (TOP PIN) */}
        <motion.div
          whileHover={{ y: -1 }}
          onClick={handleQuickBookSponsored}
          className="bg-gradient-to-r from-sky-950 via-slate-900 to-[#0c4a6e] rounded-2xl p-3.5 text-white shadow-md border border-sky-300/60 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="bg-sky-500 text-white text-[8.5px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-2xs">
              AD • TOP RESULT
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-sky-300">₹1,499</span>
              <span className="text-[10px] text-stone-400 line-through">₹2,200</span>
              <span className="text-[8.5px] bg-emerald-500/30 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-400/30">
                32% OFF
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-white leading-snug">
                7-Step Korean HydraGlo Facial
              </h3>
              <p className="text-[10.5px] text-sky-200 mt-0.5 flex items-center gap-1.5">
                <span>Enrich Glamour Studio</span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-amber-300 font-bold">
                  <Star className="w-2.5 h-2.5 fill-amber-300" />
                  4.9
                </span>
                <span>•</span>
                <span className="text-stone-300">New Palasia (1.4 km)</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleQuickBookSponsored}
              className="shrink-0 bg-sky-400 hover:bg-sky-300 text-stone-950 text-[10px] font-extrabold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <span>Quick Book</span>
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        </motion.div>

        {/* Separator from Page 5 wireframe: Organic Results below... */}
        <div className="flex items-center gap-2 py-1">
          <div className="h-px bg-stone-300/80 flex-1" />
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            Organic Results below...
          </span>
          <div className="h-px bg-stone-300/80 flex-1" />
        </div>

        <div className="flex justify-between items-center px-1 pt-1">
          <span className="text-[11px] font-bold text-stone-600">
            {filteredSalons.length} {filteredSalons.length === 1 ? 'salon' : 'salons'} available
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Real-Time Slots
          </span>
        </div>

        {filteredSalons.length === 0 && (
          <div className="text-center py-14">
            <p className="text-sm font-bold text-stone-700">No salons match these filters</p>
            <p className="text-[11px] text-stone-500 mt-1">Try clearing a filter or searching a different service.</p>
          </div>
        )}

        {filteredSalons.map((salon, index) => {
          const isFav = favoriteSalonIds.includes(salon.id);
          const nextSlotLabel = salon.isInstantBookingEnabled && salon.isStoreOpen ? `Ready in ${salon.instantWaitMinutes} mins` : null;
          const isSponsored = index < 2;

          return (
            <motion.article
              key={salon.id}
              whileHover={{ y: -1 }}
              onClick={() => navigate(`/customer/salons/${salon.id}`)}
              className={`bg-white rounded-2xl shadow-xs overflow-hidden cursor-pointer transition-all ${
                isSponsored
                  ? 'border-2 border-amber-400/90 shadow-md ring-2 ring-amber-300/30'
                  : 'border border-stone-200'
              }`}
            >
              {/* Image & Badges */}
              <div className="relative h-36 w-full overflow-hidden bg-stone-100">
                <img
                  src={salon.coverImage}
                  alt={salon.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Rating & Sponsored Badge (Touchpoint 4) */}
                {isSponsored ? (
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                    <span className="bg-amber-400 text-stone-950 text-[8.5px] font-black px-2 py-0.5 rounded shadow-xs flex items-center gap-1 uppercase tracking-wider">
                      <Sparkles className="w-2.5 h-2.5 fill-current" />
                      SPONSORED • TOP PICK #{index + 1}
                    </span>
                    <div className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{salon.rating}</span>
                    </div>
                  </div>
                ) : (
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{salon.rating}</span>
                    <span className="text-stone-300 font-normal text-[9.5px]">({salon.reviewsCount})</span>
                  </div>
                )}

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(salon.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-stone-800 active:scale-90 transition-transform shadow cursor-pointer"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-600 text-rose-600' : 'text-stone-600'}`}
                  />
                </button>

                {/* Offer tag */}
                {salon.offer && (
                  <div className="absolute bottom-2 left-2 bg-brand-maroon/95 text-white text-[9.5px] font-bold px-2 py-0.5 rounded shadow">
                    {salon.offer}
                  </div>
                )}

                {/* Instant slot tag / Sponsored perk tag */}
                {isSponsored ? (
                  <div className="absolute bottom-2 right-2 bg-emerald-950/80 backdrop-blur-xs border border-emerald-400/50 text-emerald-300 text-[9px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                    <Zap className="w-2.5 h-2.5 fill-emerald-400" />
                    <span>Seat Ready in 15 mins • 20% OFF</span>
                  </div>
                ) : nextSlotLabel ? (
                  <div className="absolute bottom-2 right-2 bg-amber-400 text-stone-950 text-[9.5px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow">
                    <Zap className="w-2.5 h-2.5 fill-stone-950" />
                    <span>{nextSlotLabel}</span>
                  </div>
                ) : null}
              </div>

              {/* Salon Details */}
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <h2 className="font-bold text-stone-900 text-sm">{salon.name}</h2>
                      {salon.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-white shrink-0" />}
                    </div>
                    <p className="text-[10.5px] text-stone-500 mt-0.5 leading-snug">{salon.tagline}</p>
                  </div>
                  <span className="text-[10px] font-bold text-stone-500 shrink-0 bg-stone-100 px-2 py-0.5 rounded-full">
                    {salon.distanceKm != null ? `${salon.distanceKm.toFixed(1)} km` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-2 text-[10.5px] text-stone-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-brand-maroon shrink-0" />
                    {salon.area}
                  </span>
                  <span>•</span>
                  <span>Starts at <strong className="text-stone-900">₹{salon.startingPrice}</strong></span>
                </div>

                {/* Touchpoint 4: Sponsored Boost Perks Banner */}
                {isSponsored && (
                  <div className="mt-2.5 pt-2 border-t border-amber-200/80 bg-amber-50/80 -mx-3 -mb-3 p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="text-[10px] font-extrabold text-amber-950 truncate">
                        Sponsored Perk: Free Welcome Head Massage &amp; Beverage
                      </span>
                    </div>
                    <span className="text-[8.5px] bg-amber-200 text-amber-950 font-black px-1.5 py-0.2 rounded shrink-0">
                      Boost Active
                    </span>
                  </div>
                )}
              </div>
            </motion.article>
          );
        })}
      </main>

      <BottomNav />
      <CartDrawer />
    </div>
  );
};
