import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { BottomNav } from '../components/BottomNav';
import { Sparkles, ArrowLeft, Heart, Star, ShoppingBag, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const SkincarePage = () => {
  const navigate = useNavigate();
  const { skincareItems = [] } = useCustomer();

  const rituals = skincareItems.filter((i) => i.isActive !== false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-20 mx-auto border-x border-purple-200/50 lg:max-w-5xl lg:px-6 lg:bg-none lg:min-h-0 lg:pb-12 lg:border-x-0 flex flex-col justify-between overflow-x-hidden box-border"
    >
      <header className="sticky top-0 lg:static z-30 bg-[#f8f4fb]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none lg:px-0 lg:pt-8 lg:pb-5 lg:border-0 px-3.5 py-2.5 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} aria-label="Go back" className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-stone-700 hover:bg-white/80 active:scale-95 lg:hidden">
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <div>
            <span className="text-[8.5px] lg:text-[11px] font-bold tracking-widest text-stone-500 uppercase block leading-none">
              SOKORA
            </span>
            <h1 className="text-lg lg:text-3xl font-serif font-bold text-stone-900 leading-tight mt-0.5 lg:mt-1.5">
              Skincare Studio
            </h1>
          </div>
        </div>
        <span className="text-[9.5px] bg-[#eaddf3] text-purple-950 font-bold px-2 py-0.5 rounded-full border border-purple-200/60">
          Derm-Approved
        </span>
      </header>

      <main className="p-3.5 lg:p-0 space-y-3 lg:space-y-6 flex-1">
        {/* Editorial Spotlight Banner - Compact */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 via-purple-50 to-[#ede1f5] p-4 lg:p-8 border border-purple-200/80 shadow-xs">
          <span className="text-[9px] font-bold text-brand-maroon uppercase tracking-wider block">
            Signature Ritual
          </span>
          <h2 className="text-xl lg:text-3xl font-serif font-bold text-stone-900 mt-1 lg:mt-2 leading-snug">
            Glass Skin Botanical Facial Rituals
          </h2>
          <p className="text-xs lg:text-sm lg:max-w-xl text-stone-600 mt-1 leading-relaxed">
            Crafted with clean active botanicals to revitalize dull complexion and protect the natural skin barrier.
          </p>
          <button
            onClick={() => navigate('/customer/salons')}
            className="mt-3 lg:mt-4 px-4 py-2.5 lg:px-5 bg-brand-maroon text-white font-bold text-[13px] rounded-xl active:scale-95 shadow-xs"
          >
            Explore Treatments
          </button>
        </div>

        {/* Rituals List */}
        <div className="space-y-2.5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
          <div className="flex justify-between items-center px-1 lg:col-span-2">
            <h3 className="text-[10.5px] font-bold text-stone-500 uppercase tracking-wider">
              Curated Formulations
            </h3>
            <span className="text-[10px] text-stone-400">Korean Rituals</span>
          </div>

          {rituals.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl p-2.5 lg:p-3.5 border border-stone-200 shadow-xs flex items-center gap-3 lg:gap-4"
            >
              <img
                src={r.image}
                alt={r.title}
                className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg object-cover bg-stone-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{r.rating}</span>
                </div>
                <h4 className="text-[13px] font-bold text-stone-900 truncate leading-tight mt-0.5">
                  {r.title}
                </h4>
                <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">{r.subtitle}</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xs font-black text-stone-900">₹{r.price}</span>
                  <span className="text-[9.5px] text-stone-400 line-through">₹{r.originalPrice}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/customer/salons')}
                className="w-10 h-10 flex items-center justify-center bg-[#eaddf3] text-brand-maroon rounded-xl hover:bg-[#e2d2ed] active:scale-90 transition-colors shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </motion.div>
  );
};
