import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// A small in-brand bottom sheet for simple informational content —
// replaces raw browser alert() popups, which break the app's look and
// feel the moment they appear (Defect D11).
export const InfoSheet = ({ isOpen, onClose, icon, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="relative w-full max-w-[420px] bg-[#faf9f6] rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 z-10 space-y-3 border-t sm:border border-stone-300/80"
        >
          <div className="flex items-start justify-between gap-3 border-b border-stone-200/80 pb-2.5">
            <div className="flex items-center gap-2.5">
              {icon && (
                <div className="w-8 h-8 rounded-xl bg-white text-stone-900 flex items-center justify-center shrink-0 shadow-xs border border-stone-200">
                  {icon}
                </div>
              )}
              <h3 className="font-bold text-stone-900 text-sm leading-tight">{title}</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-stone-500 hover:text-stone-800 hover:bg-white/60 transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-stone-700 leading-relaxed space-y-2">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
