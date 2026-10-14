import React from 'react';
import { motion } from 'framer-motion';
import { useCustomer } from '../context/CustomerContext';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { Clock, Plus, Check, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SafeImage } from '../../../shared/components/SafeImage';
import { formatDuration } from '../../../shared/store/selectors';

export const FeaturedServicesShowcase = ({ genderFilter = 'all' }) => {
  const { cartItems, addToCart, removeFromCart, setIsCartOpen, openServiceDetail } = useCustomer();
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
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <h2 className="text-base lg:text-lg font-bold text-stone-900 tracking-tight truncate">Featured Service Packages</h2>
          <span className="hidden lg:flex text-[9px] font-extrabold bg-[#eaddf3] text-brand-maroon px-2 py-0.5 rounded-full border border-purple-200/60 items-center gap-0.5 shrink-0">
            <Sparkles className="w-2.5 h-2.5 fill-brand-maroon" />
            Top Booked
          </span>
        </div>
        <button
          onClick={() => navigate('/customer/salons')}
          className="text-xs lg:text-[13px] font-bold text-brand-maroon hover:underline flex items-center gap-0.5 cursor-pointer shrink-0 whitespace-nowrap"
        >
          <span>All Services</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </button>
      </div>

      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 w-full max-w-full snap-x snap-mandatory lg:snap-none lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-visible">
        {featuredServices.map((service) => {
          const cartItem = cartItems.find((item) => item.id === service.id);
          const quantity = cartItem?.quantity || 0;

          return (
            <motion.div
              key={service.id}
              whileHover={{ y: -2 }}
              onClick={() => openServiceDetail && openServiceDetail(service)}
              className="w-[164px] lg:w-auto shrink-0 snap-start bg-white rounded-2xl group p-2.5 border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative rounded-xl overflow-hidden bg-stone-100 h-[100px] lg:h-[130px] w-full">
                  <SafeImage
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

                <h4 className="text-[12.5px] lg:text-[13px] font-bold text-stone-900 mt-2 leading-tight line-clamp-1">
                  {service.name}
                </h4>
                
                <p className="text-[10.5px] lg:text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                  {service.salonName}
                </p>

                <div className="flex items-center gap-1 text-[10.5px] text-stone-500 mt-1 font-medium">
                  <Clock className="w-3 h-3 stroke-[2]" />
                  <span>{formatDuration(service.duration)}</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-[13px] text-stone-900">₹{service.price}</span>
                  {service.originalPrice && (
                    <span className="text-[9px] text-stone-400 line-through">₹{service.originalPrice}</span>
                  )}
                </div>

                {quantity > 0 ? (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 flex items-center border border-brand-maroon bg-brand-maroon/5 rounded-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => removeFromCart(service.id)}
                      className="w-7 h-full flex items-center justify-center text-brand-maroon hover:bg-brand-maroon/10 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="text-sm font-bold leading-none mb-[2px]">-</span>
                    </button>
                    <span className="w-[14px] text-center text-[10.5px] font-black text-brand-maroon">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(service, { id: service.salonId, name: service.salonName })}
                      className="w-7 h-full flex items-center justify-center text-brand-maroon hover:bg-brand-maroon/10 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="text-sm font-bold leading-none mb-[2px]">+</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(service, { id: service.salonId, name: service.salonName });
                    }}
                    className="h-8 px-3 bg-brand-maroon hover:bg-brand-darkMaroon text-white font-bold text-[11px] rounded-lg active:scale-95 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
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
