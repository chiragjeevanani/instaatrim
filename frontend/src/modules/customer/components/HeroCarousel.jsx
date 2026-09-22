import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BANNERS as mockBanners } from '../../../shared/data/seed';
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
    <section className="relative px-4 pt-1.5 pb-1 w-full max-w-full min-w-0 overflow-hidden box-border" data-purpose="hero-promotions">
      <div className="relative overflow-hidden rounded-2xl bg-stone-900 shadow-xs min-h-[174px] w-full border border-stone-200/80">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.85 }}
            transition={{ duration: 0.25 }}
            className="relative min-h-[174px] flex items-stretch cursor-pointer"
            onClick={() => navigate(`/customer/salons/${banner.salonId}`)}
          >
            {/* Banner Background & Image Stack */}
            <img
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover object-right"
              src={banner.image}
            />

            {/* Left dark luxury gradient wash */}
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-900/80 to-transparent w-[74%]"></div>

            {/* Banner Content - Subtle classic typography */}
            <div className="relative z-10 p-4 max-w-[62%] flex flex-col justify-center text-left">
              <h1 className="text-[18px] font-bold text-white leading-tight tracking-tight whitespace-pre-line">
                {banner.title}
              </h1>

              <div className="mt-3">
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleBookNow}
                  className="bg-white hover:bg-stone-100 text-stone-900 text-[10px] font-bold tracking-wide px-3.5 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
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
