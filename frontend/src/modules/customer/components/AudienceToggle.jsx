import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Scissors, Heart } from 'lucide-react';

const OPTIONS = [
  { id: 'all', label: 'All Services', icon: Sparkles },
  { id: 'women', label: 'Women', icon: Heart },
  { id: 'men', label: 'Men', icon: Scissors }
];

export const AudienceToggle = ({ selected = 'all', onChange }) => {
  return (
    <div className="px-4 pt-1.5 pb-1 w-full max-w-full box-border" data-purpose="audience-toggle">
      <div className="bg-[#eaddf3] p-1 rounded-2xl border border-purple-200/60 flex items-center gap-1 shadow-2xs backdrop-blur-xs">
        {OPTIONS.map((opt) => {
          const isSelected = selected === opt.id;
          const Icon = opt.icon;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange && onChange(opt.id)}
              className={`relative flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 select-none cursor-pointer z-10 ${
                isSelected ? 'text-white' : 'text-purple-950 hover:text-brand-darkMaroon'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="audience-pill-active"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  className="absolute inset-0 bg-brand-maroon rounded-xl shadow-xs -z-10"
                />
              )}

              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-purple-700'}`} />
              <span className="truncate tracking-tight">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
