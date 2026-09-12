import React from 'react';
import { useCustomer } from '../context/CustomerContext';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export const EliteStrip = () => {
  const { setIsEliteModalOpen } = useCustomer();

  return (
    <section className="mt-3.5 px-4 w-full max-w-full min-w-0 box-border" data-purpose="membership-banner">
      <motion.div
        whileTap={{ scale: 0.985 }}
        onClick={() => setIsEliteModalOpen(true)}
        className="bg-black text-white px-3.5 py-2 rounded-xl flex items-center justify-between shadow-xs cursor-pointer hover:bg-stone-950 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-serif font-extrabold text-amber-400 tracking-wide text-[13px]">Elite</span>
          <p className="text-[11px] font-medium text-stone-200">
            Get <span className="text-amber-400 font-bold">10% OFF</span> on all bookings
          </p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400 stroke-[2.2]" />
      </motion.div>
    </section>
  );
};
