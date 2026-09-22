import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { useCustomer } from '../context/CustomerContext';
import { Sparkles, ChevronRight, Tag, ShieldCheck } from 'lucide-react';

export const TopAdCarousel = ({ onSelectAd }) => {
  const { state } = useAppData();
  const ads = (state.advertisements || []).filter((a) => a.isActive !== false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { applyCoupon, showToast } = useCustomer();

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 4800);
    return () => clearInterval(timer);
  }, [ads.length]);

  if (!ads || ads.length === 0) return null;

  const validIndex = currentIndex >= ads.length ? 0 : currentIndex;
  const ad = ads[validIndex];

  const handleAction = (e) => {
    e.stopPropagation();
    if (onSelectAd) {
      onSelectAd(ad);
    } else {
      if (ad.couponCode) {
        applyCoupon(ad.couponCode);
      }
      if (ad.salonId) {
        navigate(`/customer/salons/${ad.salonId}`);
      } else {
        navigate('/customer/salons');
      }
    }
  };

  return (
    <section className="px-4 pt-1 w-full max-w-full min-w-0 overflow-hidden box-border" data-purpose="sponsored-top-carousel">
      <div className="relative overflow-hidden rounded-2xl bg-stone-900 shadow-sm min-h-[164px] w-full border border-stone-200/60">
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
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`transition-all duration-300 rounded-full ${
                idx === validIndex ? 'w-4 h-1 bg-amber-400 shadow-xs' : 'w-1 h-1 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
