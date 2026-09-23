import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../context/CustomerContext';
import { X, Copy, Share2, Gift, Check } from 'lucide-react';
import { useState } from 'react';

export const ReferEarnModal = () => {
  const { isReferModalOpen, setIsReferModalOpen, user, showToast } = useCustomer();
  const [copied, setCopied] = useState(false);

  if (!isReferModalOpen) return null;

  const referralCode = user?.referralCode || 'INSTATRIM50';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    showToast('Referral code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsReferModalOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-[360px] bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] rounded-2xl shadow-2xl p-4 z-10 text-center space-y-3 overflow-hidden border border-purple-200/80"
        >
          {/* Close button */}
          <button
            onClick={() => setIsReferModalOpen(false)}
            className="absolute top-3 right-3 p-1 rounded-full text-stone-500 hover:text-stone-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Reward Icon Graphic */}
          <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-xl flex items-center justify-center mx-auto text-stone-900 shadow-sm mt-1">
            <Gift className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-stone-900">Refer &amp; Earn ₹150</h3>
            <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
              Share your link with friends. They get <span className="font-bold text-brand-maroon">₹100 OFF</span>, and you get <span className="font-bold text-amber-700">₹150 credits</span>!
            </p>
          </div>

          {/* Code Box */}
          <div className="bg-white rounded-xl p-2.5 border border-stone-300/70 flex items-center justify-between">
            <div className="text-left pl-1.5">
              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">Your Code</span>
              <span className="text-sm font-black text-stone-900 tracking-wider">{referralCode}</span>
            </div>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'InstaaTrim Salon Booking',
                  text: `Book top salons with my code ${referralCode} and get ₹100 OFF!`,
                  url: window.location.origin
                });
              } else {
                handleCopy();
              }
            }}
            className="w-full py-2.5 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share via WhatsApp</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
