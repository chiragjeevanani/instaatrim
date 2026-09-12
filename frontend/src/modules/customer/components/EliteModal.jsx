import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../context/CustomerContext';
import { X, Sparkles, Check, Crown } from 'lucide-react';

export const EliteModal = () => {
  const { isEliteModalOpen, setIsEliteModalOpen, user, showToast } = useCustomer();

  if (!isEliteModalOpen) return null;

  const benefits = [
    'Flat 10% Extra Discount on all bookings across all salons',
    'Free cancellation up to 1 hour before scheduled time',
    'Priority slot access & zero convenience charges',
    'Free Safety & Sanitized Kit on every visit'
  ];

  const handleJoin = () => {
    showToast('You are now an InstaaTrim Elite Club Member!');
    setIsEliteModalOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsEliteModalOpen(false)}
          className="absolute inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-[380px] bg-gradient-to-b from-stone-900 to-black text-white rounded-2xl shadow-2xl p-4 z-10 space-y-3 border border-amber-400/30 overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => setIsEliteModalOpen(false)}
            className="absolute top-3 right-3 p-1 rounded-full text-stone-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-md shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold text-amber-300 tracking-wider">ELITE</span>
                <span className="text-[9px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.5 rounded-full border border-amber-400/40 uppercase">
                  VIP Club
                </span>
              </div>
              <p className="text-[10.5px] text-stone-300 leading-tight mt-0.5">Luxury perks &amp; guaranteed savings</p>
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-1.5 pt-1">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] text-stone-200 leading-tight">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                </div>
                <span>{b}</span>
              </div>
            ))}
          </div>

          {/* Pricing Box */}
          <div className="bg-white/10 rounded-xl p-2.5 border border-amber-400/20 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-amber-300 uppercase tracking-wider font-bold">Annual Membership</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-black text-white">₹299</span>
                <span className="text-[10px] text-stone-400 line-through">₹999</span>
                <span className="text-[9.5px] font-bold text-emerald-400">70% OFF</span>
              </div>
            </div>
            <span className="text-[10px] text-stone-300 font-medium">12 Months</span>
          </div>

          {/* CTA */}
          <button
            onClick={handleJoin}
            className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.985] flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{user?.isElite ? 'Active Member • Renew' : 'Join Elite Membership'}</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
