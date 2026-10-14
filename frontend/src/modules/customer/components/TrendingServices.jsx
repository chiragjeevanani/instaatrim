import React, { useState, useMemo } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { Clock, Check, Sparkles, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { SafeImage } from '../../../shared/components/SafeImage';
import { formatDuration } from '../../../shared/store/selectors';

export const TrendingServices = ({ genderFilter = 'all' }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const { cartItems, addToCart, removeFromCart, setIsCartOpen, openServiceDetail } = useCustomer();
  const { state } = useAppData();

  const filterTabs = useMemo(() => {
    if (genderFilter === 'men') {
      return ['All', 'Hair Studio', 'Beard', 'Grooming', 'Spa', 'Facial'];
    }
    if (genderFilter === 'women') {
      return ['All', 'Hair Studio', 'Facial', 'Spa', 'Waxing', 'Mani-Pedi'];
    }
    return ['All', 'Hair Studio', 'Beard & Grooming', 'Facial', 'Spa', 'Waxing'];
  }, [genderFilter]);

  const trendingServices = useMemo(() => {
    return state.services
      .filter((s) => {
        if (!s.isActive) return false;
        const salon = state.salons.find((sal) => sal.id === s.salonId);
        if (!salon?.isVerified || salon?.verificationStatus !== 'Live') return false;

        // Gender affinity filter
        const isMenOnly = s.category === 'Beard' || s.category === 'Grooming';
        const isWomenOnly = s.category === 'Waxing' || s.category === 'Makeup' || s.category === 'Mehandi';

        if (genderFilter === 'men' && isWomenOnly) return false;
        if (genderFilter === 'women' && isMenOnly) return false;

        return true;
      })
      .map((s) => {
        const salon = state.salons.find((sal) => sal.id === s.salonId);
        const discountPct = s.originalPrice ? Math.round((1 - s.price / s.originalPrice) * 100) : 0;
        return {
          ...s,
          title: s.name,
          badge: s.sponsorBadge || s.category,
          isBoosted: Boolean(s.isBoosted || s.isSponsored),
          boostRank: s.boostRank || 999,
          salonName: salon?.name || 'Salon Partner',
          discount: discountPct > 0 ? `${discountPct}% OFF` : null
        };
      })
      .sort((a, b) => {
        if (a.isBoosted && !b.isBoosted) return -1;
        if (!a.isBoosted && b.isBoosted) return 1;
        if (a.isBoosted && b.isBoosted) return a.boostRank - b.boostRank;
        return 0;
      });
  }, [state.services, state.salons, genderFilter]);

  const filteredServices = trendingServices.filter((srv) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Beard & Grooming') {
      return srv.category === 'Beard' || srv.category === 'Grooming';
    }
    return srv.category.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  return (
    <section className="mt-5 pt-1 w-full max-w-full min-w-0 overflow-hidden box-border" data-purpose="trending-services">
      <div className="px-4 flex items-center justify-between">
        <h2 className="text-base lg:text-lg font-bold text-stone-900 tracking-tight">
          Trending Near You
        </h2>
        <span className="text-[11px] font-semibold text-stone-500">
          Top Rated
        </span>
      </div>

      {/* Category Filter Pills - Luxury Neutral */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 mt-3 pb-1 w-full max-w-full">
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedFilter(tab)}
              className={`text-xs font-medium px-3.5 py-1.5 lg:px-4 rounded-full shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-maroon text-white font-semibold shadow-xs'
                  : 'bg-[#eaddf3] text-purple-900 hover:bg-[#e2d2ed]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {filteredServices.length === 0 ? (
        <p className="px-4 mt-4 text-[11px] text-stone-500">No trending services in this category right now.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 mt-3 pb-2 w-full max-w-full snap-x snap-mandatory scroll-px-4 lg:snap-none lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:[&>*:nth-child(n+11)]:hidden">
          {filteredServices.map((service) => {
            const isInCart = cartItems.some((item) => item.id === service.id);

            return (
              <motion.article
                key={service.id}
                whileHover={{ y: -2 }}
                onClick={() => openServiceDetail && openServiceDetail(service)}
                className="w-[160px] lg:w-auto shrink-0 snap-start bg-white rounded-2xl p-2.5 lg:p-3 border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                data-purpose="service-item"
              >
                <div>
                  {/* Image */}
                  <div className="relative rounded-xl overflow-hidden bg-stone-100 h-[104px] lg:h-[140px] w-full">
                    <SafeImage
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      src={service.image}
                      loading="lazy"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-[12.5px] lg:text-[13px] font-semibold text-stone-900 mt-2 line-clamp-1 leading-snug group-hover:text-stone-950">
                    {service.title}
                  </h3>

                  {/* Duration */}
                  <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-0.5 font-medium">
                    <Clock className="w-3 h-3 stroke-[2]" />
                    <span>{formatDuration(service.duration)}</span>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-bold text-[13px] lg:text-sm text-stone-900">₹{service.price}</span>
                    {service.originalPrice && (
                      <span className="text-[9.5px] text-stone-400 line-through">₹{service.originalPrice}</span>
                    )}
                    {service.discount && (
                      <span className="text-[10px] font-semibold text-emerald-700 ml-auto">
                        {service.discount}
                      </span>
                    )}
                  </div>
                </div>

              {/* Action Button */}
              {isInCart ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2.5 w-full h-8 border border-brand-maroon/50 text-brand-maroon bg-rose-50/30 font-bold text-xs rounded-lg flex items-center justify-between overflow-hidden shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => removeFromCart(service.id)}
                    className="h-full px-3 flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-semibold">{cartItems.find(item => item.id === service.id)?.quantity || 1}</span>
                  <button
                    type="button"
                    onClick={() => addToCart(service, { id: service.salonId, name: service.salonName })}
                    className="h-full px-3 flex items-center justify-center hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(service, { id: service.salonId, name: service.salonName });
                    }}
                    className="mt-2.5 w-full h-8 border border-brand-maroon/50 text-brand-maroon bg-white hover:bg-rose-50/70 font-bold text-xs rounded-lg active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                  >
                    Add To Cart
                  </button>
                )}
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
};
