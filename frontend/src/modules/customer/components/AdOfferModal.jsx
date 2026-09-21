import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { X, Sparkles, Check, Copy, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

export const AdOfferModal = ({ ad, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { applyCoupon, showToast } = useCustomer();

  if (!isOpen || !ad) return null;

  const handleCopyCode = () => {
    if (ad.couponCode) {
      navigator.clipboard?.writeText(ad.couponCode);
      applyCoupon(ad.couponCode);
      setCopied(true);
      showToast(`Coupon ${ad.couponCode} applied to your cart!`);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleBookNow = () => {
    if (ad.couponCode) {
      applyCoupon(ad.couponCode);
    }
    onClose();
    if (ad.salonId) {
      navigate(`/customer/salons/${ad.salonId}`);
    } else {
      navigate('/customer/salons');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/65 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full max-w-[440px] bg-gradient-to-b from-[#fdfbfd] via-[#f8f2fa] to-[#f3eaf7] rounded-t-3xl sm:rounded-3xl shadow-2xl p-4 sm:p-5 z-10 border-t sm:border border-purple-200/80 max-h-[85vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/80 text-stone-500 hover:text-stone-800 shadow-2xs active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header pill */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
              <Sparkles className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
              {ad.sponsorBadge || 'Sponsored Offer'}
            </span>
            <span className="text-[9.5px] font-bold text-stone-500">Verified Brand Collaboration</span>
          </div>

          {/* Ad Hero Image */}
          <div className="relative rounded-2xl overflow-hidden h-36 w-full mb-3 shadow-xs bg-stone-900">
            <img
              src={ad.image}
              alt={ad.brand}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/30 to-transparent"></div>
            <div className="absolute bottom-2.5 left-3 right-3 text-white">
              <span className="text-[9px] font-extrabold text-amber-300 uppercase tracking-wide">
                {ad.brand}
              </span>
              <h3 className="text-sm font-bold leading-tight drop-shadow-xs">
                {ad.title?.replace('\n', ' ')}
              </h3>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2.5">
            <p className="text-xs text-stone-700 leading-relaxed font-normal">
              {ad.description}
            </p>

            {/* Coupon Code Block */}
            {ad.couponCode && (
              <div className="bg-white rounded-xl p-3 border border-purple-200/80 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                    Promo Coupon Code
                  </span>
                  <span className="text-xs font-black text-brand-maroon tracking-wider">
                    {ad.couponCode}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="bg-purple-50 hover:bg-purple-100 text-brand-maroon text-[10.5px] font-bold px-3 py-1.5 rounded-lg border border-purple-200 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                      <span>Copied &amp; Applied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Apply &amp; Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Perks */}
            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-[10.5px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Offer Terms &amp; Assurance</span>
              </div>
              <ul className="text-[10px] text-emerald-800 space-y-0.5 list-disc list-inside">
                <li>Valid at all verified partner salons in Indore</li>
                <li>Applied automatically at checkout upon booking</li>
                <li>Free cancellation up to 1 hour before appointment</li>
              </ul>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4 pt-2 border-t border-purple-100 flex gap-2">
            <button
              onClick={onClose}
              className="py-2.5 px-3.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleBookNow}
              className="flex-1 py-2.5 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Explore &amp; Book Partner Salon</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
