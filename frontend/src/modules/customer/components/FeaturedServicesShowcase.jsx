import React from 'react';
import { motion } from 'framer-motion';
import { useCustomer } from '../context/CustomerContext';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { Clock, Plus, Check, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FeaturedServicesShowcase = ({ genderFilter = 'all' }) => {
  const { cartItems, addToCart, setIsCartOpen, openServiceDetail } = useCustomer();
  const { state } = useAppData();
  const navigate = useNavigate();

  // Curate highlighted service packages & treatments
  const featuredServices = (state.services || [])
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
    .slice(0, 6)
    .map((s) => {
      const salon = state.salons.find((sal) => sal.id === s.salonId);
      const discountPct = s.originalPrice ? Math.round((1 - s.price / s.originalPrice) * 100) : 0;
      return {
        ...s,
        salonName: salon?.name || 'Partner Salon',
        discount: discountPct > 0 ? `${discountPct}% OFF` : null
      };
    });

  if (featuredServices.length === 0) return null;

  return (
    <section className="mt-4 px-4 w-full max-w-full min-w-0 box-border" data-purpose="featured-services-showcase">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <h2 className="text-[13px] font-bold text-stone-900 tracking-tight">Featured Service Packages</h2>
          <span className="text-[9px] font-extrabold bg-[#eaddf3] text-brand-maroon px-2 py-0.5 rounded-full border border-purple-200/60 flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 fill-brand-maroon" />
            Top Booked
          </span>
        </div>
        <button
          onClick={() => navigate('/customer/salons')}
          className="text-[10px] font-bold text-brand-maroon hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>All Services</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </button>
      </div>

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 w-full max-w-full">
        {featuredServices.map((service) => {
          const isInCart = cartItems.some((item) => item.id === service.id);

          return (
            <motion.div
              key={service.id}
              whileHover={{ y: -2 }}
              onClick={() => openServiceDetail && openServiceDetail(service)}
              className="w-[160px] shrink-0 bg-white rounded-2xl p-2.5 border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative rounded-xl overflow-hidden bg-stone-100 h-[100px] w-full">
                  <img
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    src={service.image}
                    loading="lazy"
                  />
                  {service.discount && (
                    <span className="absolute top-1.5 left-1.5 bg-brand-maroon text-white text-[8.5px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                      {service.discount}
                    </span>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.2 rounded">
                    {service.category}
                  </span>
                </div>

                <h4 className="text-[11.5px] font-bold text-stone-900 mt-2 leading-tight line-clamp-1">
                  {service.name}
                </h4>
                
                <p className="text-[9.5px] text-stone-500 line-clamp-1 mt-0.5">
                  {service.salonName}
                </p>

                <div className="flex items-center gap-1 text-[9.5px] text-stone-500 mt-1 font-medium">
                  <Clock className="w-2.5 h-2.5 stroke-[2]" />
                  <span>{service.duration}</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-xs text-stone-900">₹{service.price}</span>
                  {service.originalPrice && (
                    <span className="text-[9px] text-stone-400 line-through">₹{service.originalPrice}</span>
                  )}
                </div>

                {isInCart ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCartOpen(true);
                    }}
                    className="h-[26px] px-2 border border-emerald-600 text-emerald-800 bg-emerald-50 font-bold text-[9.5px] rounded-lg active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    <span>Added</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(service, { id: service.salonId, name: service.salonName });
                    }}
                    className="h-[26px] px-2.5 bg-brand-maroon hover:bg-brand-darkMaroon text-white font-bold text-[9.5px] rounded-lg active:scale-95 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-2.5 h-2.5 stroke-[3]" />
                    <span>Book</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
