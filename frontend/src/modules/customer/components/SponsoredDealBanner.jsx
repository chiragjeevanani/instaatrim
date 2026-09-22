import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { useCustomer } from '../context/CustomerContext';
import { Sparkles, Copy, Check, ArrowRight } from 'lucide-react';

export const SponsoredDealBanner = () => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { state } = useAppData();
  const { applyCoupon, showToast } = useCustomer();

  const campaign = state.midPageCampaign;

  if (!campaign || campaign.isActive === false) return null;

  const handleCopy = (e) => {
    e.stopPropagation();
    if (campaign.coupon) {
      navigator.clipboard?.writeText(campaign.coupon);
      applyCoupon(campaign.coupon);
      setCopied(true);
      showToast(`Coupon ${campaign.coupon} applied to your cart!`);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleNavigate = () => {
    navigate('/customer/salons');
  };

  return (
    <section className="mt-5 px-4 w-full max-w-full min-w-0 box-border" data-purpose="sponsored-mid-banner">
      <motion.div
        whileHover={{ y: -1 }}
        onClick={handleNavigate}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-stone-900 via-stone-850 to-purple-950 p-4 text-white shadow-md border border-purple-200/40 cursor-pointer"
      >
        {/* Background decorative image with opacity */}
        {campaign.bannerImage && (
          <img
            alt="Campaign background"
            src={campaign.bannerImage}
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
            loading="lazy"
          />
        )}

        {/* Content */}
        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full shadow-2xs">
              <Sparkles className="w-2.5 h-2.5 fill-current" />
              {campaign.badge || 'Sponsored Campaign'}
            </span>
            <span className="text-[9px] text-stone-300 font-medium">Limited Seats</span>
          </div>

          <h3 className="text-[14px] font-bold text-white leading-tight">
            {campaign.title}
          </h3>

          {campaign.subtitle && (
            <p className="text-[10px] text-stone-300">
              {campaign.subtitle}
            </p>
          )}

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 mt-2 border border-white/15 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[9px] text-amber-300 font-bold block uppercase tracking-wide">
                Special Offer
              </span>
              <p className="text-[10px] text-stone-100 font-medium truncate">
                {campaign.highlight}
              </p>
            </div>

            {campaign.coupon && (
              <button
                onClick={handleCopy}
                className="shrink-0 bg-white hover:bg-stone-100 text-stone-900 font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                {copied ? (
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
      </motion.div>
    </section>
  );
};
