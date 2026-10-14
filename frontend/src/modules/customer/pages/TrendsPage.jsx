import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { BottomNav } from '../components/BottomNav';
import { ArrowLeft, Flame, Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const TrendsPage = () => {
  const navigate = useNavigate();
  const { trendsItems = [] } = useCustomer();

  const trends = trendsItems.filter((t) => t.isActive !== false);

  return (
    <div
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-20 mx-auto border-x border-purple-200/50 lg:max-w-7xl lg:px-6 lg:bg-none lg:min-h-0 lg:pb-12 lg:border-x-0 flex flex-col justify-between overflow-x-hidden box-border"
    >
      <header className="sticky top-0 lg:static z-30 bg-[#f8f4fb]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none lg:px-0 lg:pt-8 lg:pb-5 lg:border-0 px-3.5 py-2.5 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} aria-label="Go back" className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-stone-700 hover:bg-white/80 active:scale-95 lg:hidden">
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <div>
            <span className="text-[9px] font-bold text-pink-700 uppercase tracking-widest flex items-center gap-1 leading-none">
              <Flame className="w-3 h-3 fill-pink-600 text-pink-600" />
              HOT PICKS
            </span>
            <h1 className="text-lg lg:text-3xl font-serif font-bold text-stone-900 leading-tight mt-0.5 lg:mt-1.5">
              K-Beauty Trends
            </h1>
          </div>
        </div>
      </header>

      <main className="p-3.5 lg:p-0 space-y-3 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:content-start flex-1">
        {trends.map((t) => (
          <div
            key={t.id}
            onClick={() => navigate('/customer/salons')}
            className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs cursor-pointer hover:shadow-sm transition-all group"
          >
            <div className="relative h-40 lg:h-48 w-full overflow-hidden bg-stone-100">
              <img
                src={t.image}
                alt={t.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-xs text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full">
                {t.tag}
              </span>
              <span className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-stone-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                {t.reads}
              </span>
            </div>

            <div className="p-3 lg:p-4">
              <h2 className="text-[15px] lg:text-base font-bold text-stone-900 font-serif leading-snug">{t.title}</h2>
              <p className="text-xs lg:text-[13px] text-stone-500 mt-1 leading-relaxed">{t.desc}</p>
              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-brand-maroon font-bold text-[11px]">Explore Salons</span>
                <span className="text-brand-maroon font-bold text-xs">&rarr;</span>
              </div>
            </div>
          </div>
        ))}
      </main>

      <BottomNav />
    </div>
  );
};
