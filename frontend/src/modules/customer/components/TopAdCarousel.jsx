import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TOP_ADVERTISEMENTS } from '../../../shared/data/advertisements';
import { useCustomer } from '../context/CustomerContext';
import { Sparkles, ChevronRight, Tag, ShieldCheck } from 'lucide-react';

export const TopAdCarousel = ({ onSelectAd }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { applyCoupon, showToast } = useCustomer();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TOP_ADVERTISEMENTS.length);
    }, 4800);
    return () => clearInterval(timer);
  }, []);

  const ad = TOP_ADVERTISEMENTS[currentIndex];

  const handleAction = (e) => {
    e.stopPropagation();
    if (onSelectAd) {
      onSelectAd(ad);
    } else {
      if (ad.couponCode) {
        applyCoupon(ad.couponCode);
      }
      navigate(`/customer/salons/${ad.salonId}`);
    }
  };

  return (
    <section className="px-4 pt-1.5 pb-2 w-full max-w-full min-w-0 overflow-hidden box-border" data-purpose="sponsored-top-carousel">
      {/* Top micro-header */}
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 bg-amber-100/90 text-amber-900 border border-amber-300/70 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
            Sponsored Spotlight
          </span>
          <span className="text-[10px] text-stone-500 font-medium">Brand Collaborations</span>
        </div>
        <span className="text-[9px] font-bold text-stone-400">Ad • Verified</span>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-stone-900 shadow-md min-h-[172px] w-full border border-purple-200/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={ad.id}
            initial={{ opacity: 0.82 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.82 }}
            transition={{ duration: 0.28 }}
            className="relative min-h-[172px] flex items-stretch cursor-pointer"
            onClick={handleAction}
          >
            {/* Background Image */}
            <img
              alt={ad.brand}
              className="absolute inset-0 w-full h-full object-cover object-center"
              src={ad.image}
              loading="lazy"
            />

            {/* Gradient overlay tailored to brand */}
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-900/80 to-transparent w-[78%]"></div>

            {/* Content Left Column */}
            <div className="relative z-10 p-3.5 max-w-[68%] flex flex-col justify-between text-left">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-xs">
                    {ad.brand}
                  </span>
                  <span className="text-[8.5px] text-stone-300 font-medium truncate">
                    {ad.sponsorBadge}
                  </span>
                </div>

                <h3 className="text-[16.5px] font-bold text-white leading-tight tracking-tight whitespace-pre-line drop-shadow-xs">
                  {ad.title}
                </h3>

                <p className="text-[9.5px] text-stone-300 mt-1 line-clamp-2 leading-tight">
                  {ad.description}
                </p>
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAction}
                  className="bg-gradient-to-r from-brand-maroon to-brand-darkMaroon hover:from-brand-darkMaroon hover:to-stone-950 text-white text-[10px] font-extrabold tracking-wide px-3.5 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <span>{ad.ctaText}</span>
                  <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                </button>

                {ad.discountBadge && (
                  <span className="text-[9px] font-extrabold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-1 rounded-lg backdrop-blur-xs">
                    {ad.discountBadge}
                  </span>
                )}
              </div>
            </div>

            {/* Top Right Sponsored Pill */}
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="text-[8.5px] font-bold text-white/90 bg-black/55 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                Partner Ad
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicators */}
        <div className="absolute bottom-2 right-3 flex items-center gap-1 z-10">
          {TOP_ADVERTISEMENTS.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex ? 'w-4 h-1 bg-amber-400 shadow-xs' : 'w-1 h-1 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
