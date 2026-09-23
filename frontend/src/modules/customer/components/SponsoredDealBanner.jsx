import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { useCustomer } from '../context/CustomerContext';
import { Sparkles, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { MID_PAGE_CAMPAIGNS, MID_PAGE_CAMPAIGN } from '../../../shared/data/advertisements';

export const SponsoredDealBanner = () => {
  const [copiedId, setCopiedId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { state } = useAppData();
  const { applyCoupon, showToast } = useCustomer();

  // Combine campaigns from state or fallback
  const campaigns = useMemo(() => {
    let list = [];
    if (Array.isArray(state.midPageCampaigns) && state.midPageCampaigns.length > 0) {
      list = state.midPageCampaigns.filter((c) => c.isActive !== false);
    } else if (state.midPageCampaign && state.midPageCampaign.isActive !== false) {
      list = [state.midPageCampaign];
    } else if (MID_PAGE_CAMPAIGNS && MID_PAGE_CAMPAIGNS.length > 0) {
      list = MID_PAGE_CAMPAIGNS.filter((c) => c.isActive !== false);
    } else if (MID_PAGE_CAMPAIGN) {
      list = [MID_PAGE_CAMPAIGN];
    }
    return list;
  }, [state.midPageCampaigns, state.midPageCampaign]);

  // Reset index if out of range
  useEffect(() => {
    if (currentIndex >= campaigns.length) {
      setCurrentIndex(0);
    }
  }, [campaigns.length, currentIndex]);

  // Auto carousel advance
  useEffect(() => {
    if (campaigns.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [campaigns.length]);

  if (!campaigns || campaigns.length === 0) return null;

  const campaign = campaigns[currentIndex] || campaigns[0];

  const handleCopy = (e, couponCode) => {
    e.stopPropagation();
    if (couponCode) {
      navigator.clipboard?.writeText(couponCode);
      applyCoupon(couponCode);
      setCopiedId(campaign.id || couponCode);
      showToast(`Coupon ${couponCode} applied to your cart!`);
      setTimeout(() => setCopiedId(null), 3000);
    }
  };

  const handleNavigate = () => {
    if (campaign.link) {
      navigate(campaign.link);
    } else {
      navigate('/customer/salons');
    }
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? campaigns.length - 1 : prev - 1));
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % campaigns.length);
  };

  return (
    <section className="mt-5 px-4 w-full max-w-full min-w-0 box-border" data-purpose="sponsored-mid-banner">
      <div className="relative rounded-2xl overflow-hidden shadow-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={campaign.id || currentIndex}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.8 }}
            transition={{ duration: 0.3 }}
            onClick={handleNavigate}
            className="relative p-4 text-white cursor-pointer overflow-hidden border border-purple-200/40 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-purple-950 min-h-[148px] flex flex-col justify-between"
          >
            {/* Background image & gradient overlay */}
            {campaign.bannerImage && (
              <img
                alt={campaign.title || 'Campaign background'}
                src={campaign.bannerImage}
                className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-overlay"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full shadow-2xs">
                  <Sparkles className="w-2.5 h-2.5 fill-current" />
                  {campaign.badge || 'Sponsored Deal'}
                </span>
                <span className="text-[9px] text-stone-300 font-medium">Limited Seats</span>
              </div>

              <h3 className="text-[14px] font-bold text-white leading-tight">
                {campaign.title}
              </h3>

              {campaign.subtitle && (
                <p className="text-[10px] text-stone-300 leading-snug line-clamp-1">
                  {campaign.subtitle}
                </p>
              )}

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 mt-2 border border-white/15 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] text-amber-300 font-bold block uppercase tracking-wide">
                    Special Offer
                  </span>
                  <p className="text-[10px] text-stone-100 font-medium truncate">
                    {campaign.highlight}
                  </p>
                </div>

                {campaign.coupon && (
                  <button
                    onClick={(e) => handleCopy(e, campaign.coupon)}
                    className="shrink-0 bg-white hover:bg-stone-100 text-stone-900 font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    {copiedId === (campaign.id || campaign.coupon) ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                        <span>Applied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-brand-maroon" />
                        <span>CODE: {campaign.coupon}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Left & Right arrow buttons if multiple slides */}
            {campaigns.length > 1 && (
              <div className="absolute top-1/2 -translate-y-1/2 inset-x-2 flex items-center justify-between pointer-events-none z-20">
                <button
                  onClick={prevSlide}
                  aria-label="Previous Deal"
                  className="pointer-events-auto p-1 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/70 backdrop-blur-sm transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next Deal"
                  className="pointer-events-auto p-1 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/70 backdrop-blur-sm transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators / Pagination Dots */}
        {campaigns.length > 1 && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {campaigns.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex ? 'w-4 h-1 bg-amber-400' : 'w-1 h-1 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
