import React, { useState, useMemo } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { Clock, Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const TrendingServices = ({ genderFilter = 'all' }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const { cartItems, addToCart, setIsCartOpen, openServiceDetail } = useCustomer();
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
        <h2 className="text-[14px] font-bold text-stone-900 tracking-tight">
          Trending Near You
        </h2>
        <span className="text-[10px] font-semibold text-stone-500">
          Top Rated
        </span>
      </div>

      {/* Category Filter Pills - Luxury Neutral */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-4 mt-2.5 pb-1 w-full max-w-full">
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedFilter(tab)}
              className={`text-[10.5px] font-medium px-3 py-1 rounded-full shrink-0 transition-all cursor-pointer ${
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
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 mt-3 pb-2 w-full max-w-full">
          {filteredServices.map((service) => {
            const isInCart = cartItems.some((item) => item.id === service.id);

            return (
              <motion.article
                key={service.id}
                whileHover={{ y: -2 }}
                onClick={() => openServiceDetail && openServiceDetail(service)}
                className="w-[152px] shrink-0 bg-white rounded-xl p-2.5 border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                data-purpose="service-item"
              >
                <div>
                  {/* Image */}
                  <div className="relative rounded-lg overflow-hidden bg-stone-100 h-[96px] w-full">
                    <img
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      src={service.image}
                      loading="lazy"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-[11.5px] font-semibold text-stone-900 mt-2 line-clamp-1 leading-snug group-hover:text-stone-950">
                    {service.title}
                  </h3>

                  {/* Duration */}
                  <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-0.5 font-medium">
                    <Clock className="w-2.5 h-2.5 stroke-[2]" />
                    <span>{service.duration}</span>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-bold text-xs text-stone-900">₹{service.price}</span>
                    {service.originalPrice && (
                      <span className="text-[9.5px] text-stone-400 line-through">₹{service.originalPrice}</span>
                    )}
                    {service.discount && (
                      <span className="text-[9px] font-semibold text-emerald-800 ml-auto">
                        {service.discount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {isInCart ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCartOpen(true);
                    }}
                    className="mt-2.5 w-full h-[28px] border border-emerald-600 text-emerald-800 bg-emerald-50 font-bold text-[10.5px] rounded-lg active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>Added</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(service, { id: service.salonId, name: service.salonName });
                    }}
                    className="mt-2.5 w-full h-[28px] border border-brand-maroon/50 text-brand-maroon bg-white hover:bg-rose-50/70 font-bold text-[10.5px] rounded-lg active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
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
