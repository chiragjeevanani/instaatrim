import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { CartDrawer } from '../components/CartDrawer';
import { ArrowLeft, Flame, Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const TrendsPage = () => {
  const navigate = useNavigate();

  const trends = [
    {
      id: 't-1',
      title: 'Korean Rice Towel Body Polishing',
      tag: '#1 Trend Across Salons',
      reads: '14.2k bookings',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDritZYUH3wWaqkvavo6kcFqWBR8YbSIvUYKV-YBRJo8rH1tMeY16TLt53edhR-5vbpC_jQ5pcVDRmop0Ya7L87JrMW41Xx7xOAm_8PXybl3wHwppBJqgvWJCkG7Pg_h6btwEeLQPRQCRMlEeU2MVu2f_dn20QdX6hogxOhBK1m1X8jvxSC5vPEOF4H1HCZonTB1St4pUkQsWdKC_bhQV4awCLT1mqWcGmkl0YO1eCMlZE5DbV9zzkzIA',
      desc: 'Inspired by traditional bathhouses in Seoul, combining physical Italy towel exfoliation with hot oil seal.'
    },
    {
      id: 't-2',
      title: 'HydraGlo Deep Pore Diamond Infusion',
      tag: 'Celebrity Glow',
      reads: '21.5k bookings',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKOZvsFacJMzTEx78j1kJJGV9xWdwRp3-fNcdJELVxA84BL49qmSzZQFwfF_DwDPSujw7BeLRcD36407W6shCprJc3SSww_wPfLk-c9i22zEkrsXoLx12PYtglXJKNFcLoUe4fTw5sx5jls1407Q8MD3OFTg_bFRv_-WLEWbUHkDje49n770wAyt2dzq-gAFGTR9XgwR3mBKrdOwU3d91eojLJ6B5YQGtJnz0tQ8gtpjEm672xqwnp-w',
      desc: 'Multi-stage facial combining vortex vacuum debris extraction and hyaluronic hydration.'
    },
    {
      id: 't-3',
      title: 'Japanese Head Spa & Scalp Detox',
      tag: 'Viral ASMR Ritual',
      reads: '9.8k bookings',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      desc: 'Water halo circulation with botanical tea rinse and tension-relieving acupressure.'
    }
  ];

  return (
    <div
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-20 mx-auto border-x border-purple-200/50 flex flex-col justify-between overflow-x-hidden box-border"
    >
      <header className="sticky top-0 z-30 bg-[#f8f4fb]/95 backdrop-blur-md px-3.5 py-2.5 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1 text-stone-700 active:scale-95">
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <div>
            <span className="text-[9px] font-bold text-pink-700 uppercase tracking-widest flex items-center gap-1 leading-none">
              <Flame className="w-3 h-3 fill-pink-600 text-pink-600" />
              HOT PICKS
            </span>
            <h1 className="text-sm font-serif font-bold text-stone-900 leading-tight mt-0.5">
              K-Beauty Trends
            </h1>
          </div>
        </div>
      </header>

      <main className="p-3.5 space-y-3 flex-1">
        {trends.map((t) => (
          <div
            key={t.id}
            onClick={() => navigate('/customer/salons')}
            className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-xs cursor-pointer hover:shadow-sm transition-all group"
          >
            <div className="relative h-32 w-full overflow-hidden bg-stone-100">
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

            <div className="p-3">
              <h2 className="text-xs font-bold text-stone-900 font-serif leading-snug">{t.title}</h2>
              <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">{t.desc}</p>
              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-brand-maroon font-bold text-[11px]">Explore Salons</span>
                <span className="text-brand-maroon font-bold text-xs">&rarr;</span>
              </div>
            </div>
          </div>
        ))}
      </main>

      <BottomNav />
      <CartDrawer />
    </div>
  );
};
