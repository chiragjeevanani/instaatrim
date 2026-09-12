import React, { useState } from 'react';
import { mockTrendingServices } from '../data/mockData';
import { useCustomer } from '../context/CustomerContext';
import { Clock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const filterTabs = ['All', 'Waxing', 'Facial', 'Mani-Pedi', 'Spa'];

export const TrendingServices = () => {
  const [selectedFilter, setSelectedFilter] = useState('Waxing');
  const { cartItems, addToCart, setIsCartOpen } = useCustomer();

  const filteredServices = mockTrendingServices.filter((srv) => {
    if (selectedFilter === 'All') return true;
    return srv.category.toLowerCase().includes(selectedFilter.toLowerCase());
  });

  return (
    <section className="mt-7 pt-1 w-full max-w-full min-w-0 overflow-hidden box-border" data-purpose="trending-services">
      <div className="px-4 flex items-center justify-between">
        <h2 className="text-[13px] font-bold text-stone-900 tracking-tight">Trending Near You</h2>
        <span className="text-[9.5px] font-semibold text-brand-maroon uppercase tracking-wider">Verified Salons</span>
      </div>

      {/* Category Filter Pills - Spacious & Refined */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 mt-3 pb-1 w-full max-w-full">
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`text-[10.5px] font-medium px-3 py-1 rounded-full shrink-0 transition-all ${
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

      {/* Horizontal Carousel with generous card spacing */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 mt-3.5 pb-2 w-full max-w-full">
        {filteredServices.map((service) => {
          const isInCart = cartItems.some((item) => item.id === service.id);

          return (
            <motion.article
              key={service.id}
              whileHover={{ y: -2 }}
              className="w-[152px] shrink-0 bg-white rounded-xl p-2.5 border border-stone-200/90 shadow-xs flex flex-col justify-between"
              data-purpose="service-item"
            >
              <div>
                {/* Image */}
                <div className="relative rounded-lg overflow-hidden bg-stone-100 h-[96px] w-full">
                  <span className="absolute top-1.5 left-1.5 z-10 bg-black/65 backdrop-blur-xs text-white text-[8px] font-semibold px-1.5 py-0.5 rounded">
                    {service.badge}
                  </span>
                  <img
                    alt={service.title}
                    className="w-full h-full object-cover"
                    src={service.image}
                    loading="lazy"
                  />
                </div>

                {/* Title */}
                <h3 className="text-[11px] font-bold text-stone-900 mt-2 line-clamp-2 leading-[1.25] h-[28px]">
                  {service.title}
                </h3>

                {/* Duration */}
                <div className="flex items-center gap-1 text-[9.5px] text-stone-500 mt-1 font-medium">
                  <Clock className="w-2.5 h-2.5 stroke-[2]" />
                  <span>{service.duration}</span>
                </div>

                {/* Price Row */}
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="font-black text-xs text-stone-900">₹{service.price}</span>
                  <span className="text-[9.5px] text-stone-400 line-through">₹{service.originalPrice}</span>
                  <span className="text-[8.5px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto">
                    {service.discount}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {isInCart ? (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="mt-2.5 w-full h-[28px] border border-emerald-600 text-emerald-700 bg-emerald-50 font-bold text-[10.5px] rounded-lg active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3 stroke-[2.5]" />
                  <span>Added</span>
                </button>
              ) : (
                <button
                  onClick={() => addToCart(service, { id: service.salonId, name: service.salonName })}
                  className="mt-2.5 w-full h-[28px] border border-brand-maroon/50 text-brand-maroon bg-white hover:bg-rose-50/70 font-bold text-[10.5px] rounded-lg active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  Add To Cart
                </button>
              )}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};

