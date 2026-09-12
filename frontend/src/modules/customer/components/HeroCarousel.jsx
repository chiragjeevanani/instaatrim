import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockBanners } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockBanners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const banner = mockBanners[currentIndex];

  const handleBookNow = (e) => {
    e.stopPropagation();
    navigate(`/customer/salons/${banner.salonId}`);
  };

  return (
    <section className="relative px-4 pt-2.5 pb-1 w-full max-w-full min-w-0 overflow-hidden box-border" data-purpose="hero-promotions">
      <div className="relative overflow-hidden rounded-2xl bg-[#cb9b87] shadow-xs min-h-[178px] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.85 }}
            transition={{ duration: 0.25 }}
            className="relative min-h-[178px] flex items-stretch cursor-pointer"
            onClick={() => navigate(`/customer/salons/${banner.salonId}`)}
          >
            {/* Banner Background & Image Stack */}
            <img
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover object-right"
              src={banner.image}
            />

            {/* Left warm aesthetic gradient wash */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#d9b09a] via-[#e2bead]/92 to-transparent w-[72%]"></div>

            {/* Banner Content - Compact and elegant */}
            <div className="relative z-10 p-3.5 max-w-[62%] flex flex-col justify-center text-left">
              <span className="text-[9.5px] font-semibold text-stone-800 tracking-wide leading-none">
                {banner.subtitle}
              </span>
              
              {/* Decorative small divider */}
              <div className="flex items-center gap-1 my-1">
                <span className="w-4 h-[1px] bg-stone-500/60"></span>
                <span className="text-[8px] text-stone-600 leading-none">✻</span>
                <span className="w-4 h-[1px] bg-stone-500/60"></span>
              </div>

              <h1 className="text-[20px] font-serif font-black text-stone-900 leading-tight tracking-tight mt-0.5 whitespace-pre-line">
                {banner.title}
              </h1>
              
              <p className="text-[9px] text-stone-700 italic mt-0.5 font-medium leading-snug">
                {banner.desc}
              </p>

              <div className="mt-2">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleBookNow}
                  className="bg-[#78233f] text-white text-[9.5px] font-bold tracking-wider px-3.5 py-1 rounded-full uppercase shadow-xs hover:bg-brand-maroon transition-all"
                >
                  {banner.ctaText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
          {mockBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex ? 'w-3 h-1 bg-white' : 'w-1 h-1 bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
