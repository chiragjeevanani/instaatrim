import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:6200/api';

export const EliteStrip = () => {
  const { setIsEliteModalOpen, user } = useCustomer();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/page-campaigns/elite`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setConfig(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const title = config?.title || 'Elite';
  // Parse discountText to bold the "10% OFF" part if possible, otherwise just render it
  const renderDiscountText = () => {
    if (user?.is_elite) {
      return (
        <p className="text-[11px] font-medium text-stone-200">
          You are an Elite member! <span className="text-amber-400 font-bold">10% OFF</span> applied.
        </p>
      );
    }
    
    if (!config) return <p className="text-[11px] font-medium text-stone-200">Get <span className="text-amber-400 font-bold">10% OFF</span> on all bookings</p>;
    
    // Simple naive parser to bold any percentage
    const text = config.discountText;
    const parts = text.split(/(10% OFF|\d+% OFF)/g);
    
    return (
      <p className="text-[11px] font-medium text-stone-200">
        {parts.map((part, i) => (
          part.includes('% OFF') ? <span key={i} className="text-amber-400 font-bold">{part}</span> : <span key={i}>{part}</span>
        ))}
      </p>
    );
  };

  return (
    <section className="mt-3.5 px-4 w-full max-w-full min-w-0 box-border" data-purpose="membership-banner">
      <motion.div
        whileTap={{ scale: 0.985 }}
        onClick={() => setIsEliteModalOpen(true)}
        className="bg-black text-white px-3.5 py-2 rounded-xl flex items-center justify-between shadow-xs cursor-pointer hover:bg-stone-950 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-serif font-extrabold text-amber-400 tracking-wide text-[13px]">{title}</span>
          {renderDiscountText()}
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400 stroke-[2.2]" />
      </motion.div>
    </section>
  );
};
