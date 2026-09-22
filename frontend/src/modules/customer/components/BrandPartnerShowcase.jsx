import React from 'react';
import { motion } from 'framer-motion';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { Sparkles, ArrowUpRight } from 'lucide-react';

export const BrandPartnerShowcase = ({ onSelectBrand }) => {
  const { state } = useAppData();
  const brandPartners = (state.brandPartners || []).filter((bp) => bp.isActive !== false);

  if (!brandPartners || brandPartners.length === 0) return null;

  return (
    <section className="mt-5 px-4 w-full max-w-full min-w-0 box-border" data-purpose="brand-partners-showcase">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[14px] font-bold text-stone-900 tracking-tight">Brand Partners</h2>
        <span className="text-[11px] font-semibold text-stone-500">Curated</span>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 w-full max-w-full">
        {brandPartners.map((bp) => (
          <motion.div
            key={bp.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectBrand && onSelectBrand(bp)}
            className="w-[114px] shrink-0 bg-white rounded-xl p-2.5 border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-lg leading-none">{bp.logo}</span>
                <span className="text-[7.5px] font-bold uppercase tracking-wider text-stone-400 bg-stone-100 px-1 py-0.5 rounded">
                  Partner
                </span>
              </div>
              <h4 className="text-[11.5px] font-bold text-stone-900 mt-2 leading-tight truncate">
                {bp.name}
              </h4>
            </div>

            <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[8.5px] font-black text-brand-maroon truncate">
                {bp.offer}
              </span>
              <ArrowUpRight className="w-2.5 h-2.5 text-stone-400 shrink-0" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
