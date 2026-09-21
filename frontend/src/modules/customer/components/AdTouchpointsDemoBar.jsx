import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { Sparkles, X, ChevronRight, CheckCircle2, Eye } from 'lucide-react';

export const AdTouchpointsDemoBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { addToCart, setIsBookingFlowOpen } = useCustomer();
  const { state } = useAppData();

  const touchpoints = [
    {
      id: 1,
      title: '1. Top Ad Carousel',
      subtitle: 'Hero Brand Takeovers (High CPM)',
      badge: 'Homepage Top',
      color: 'bg-rose-100 text-rose-800 border-rose-200',
      action: () => {
        setIsOpen(false);
        navigate('/customer');
        setTimeout(() => {
          const el = document.querySelector('[data-purpose="sponsored-top-carousel"]');
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    },
    {
      id: 2,
      title: '2. Brand Partner Showcase',
      subtitle: 'Official Brand Store Strips',
      badge: 'Homepage Strip',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      action: () => {
        setIsOpen(false);
        navigate('/customer');
        setTimeout(() => {
          const el = document.querySelector('[data-purpose="brand-partners-showcase"]');
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    },
    {
      id: 3,
      title: '3. Mid-Page Campaign Banner',
      subtitle: 'Festival & Weekend Flash Sales',
      badge: 'Mid-Feed Card',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      action: () => {
        setIsOpen(false);
        navigate('/customer');
        setTimeout(() => {
          const el = document.querySelector('[data-purpose="sponsored-mid-banner"]');
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    },
    {
      id: 4,
      title: '4. Promoted / Sponsored Salons',
      subtitle: 'Position #1 & #2 Sponsored Badges',
      badge: 'Salon Listing',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      action: () => {
        setIsOpen(false);
        navigate('/customer/salons');
      }
    },
    {
      id: 5,
      title: '5. Sponsored Search & Keyword Pin',
      subtitle: 'Top Pinned Result for Queries',
      badge: 'Search Screen',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      action: () => {
        setIsOpen(false);
        navigate('/customer/salons?q=Hydra+Facial');
      }
    },
    {
      id: 6,
      title: '6. In-Flow Brand Kit Upsell',
      subtitle: 'Product Kit Selection (Booking Flow)',
      badge: 'Booking Funnel',
      color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
      action: () => {
        setIsOpen(false);
        // Add a sample facial service and open booking flow directly
        const facialService = state.services.find((s) => s.category === 'Facial') || state.services[0];
        const salon = state.salons.find((s) => s.id === facialService.salonId) || state.salons[0];
        addToCart(facialService, salon);
        setIsBookingFlowOpen(true);
      }
    },
    {
      id: 7,
      title: '7. Post-Booking & Aftercare Retail',
      subtitle: 'Cross-Promotions & Ride Vouchers',
      badge: 'Confirmation',
      color: 'bg-stone-200 text-stone-800 border-stone-300',
      action: () => {
        setIsOpen(false);
        const bookingId = state.bookings[0]?.id || 'bk-1';
        navigate(`/customer/booking-confirmation/${bookingId}`);
      }
    }
  ];

  return (
    <>
      {/* Floating Demo Trigger Pill */}
      <div className="fixed bottom-20 right-3 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-brand-maroon to-purple-950 text-white font-extrabold text-[10px] px-3 py-2 rounded-full shadow-lg border border-amber-300/60 flex items-center gap-1.5 backdrop-blur-md cursor-pointer hover:shadow-xl transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
          <span>7 Ad Touchpoints Demo</span>
        </motion.button>
      </div>

      {/* Interactive Modal Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-w-[480px] bg-gradient-to-b from-[#fdfbfd] via-[#f7f0fa] to-[#f3eaf7] rounded-t-3xl shadow-2xl p-4 z-10 border-t border-purple-200 max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-purple-200/70">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-maroon text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-xs">Client Demo: 7 Ad Touchpoints</h3>
                    <p className="text-[10px] text-stone-500">Tap any touchpoint to jump straight to it in the UI</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Touchpoints list */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-0.5">
                {touchpoints.map((tp) => (
                  <div
                    key={tp.id}
                    onClick={tp.action}
                    className="bg-white rounded-xl p-2.5 border border-purple-100 hover:border-brand-maroon/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-2.5 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-purple-50 text-brand-maroon font-black text-xs flex items-center justify-center border border-purple-200 shrink-0">
                        {tp.id}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-stone-900 text-xs truncate group-hover:text-brand-maroon transition-colors">
                            {tp.title}
                          </h4>
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded border ${tp.color}`}>
                            {tp.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 truncate mt-0.5">{tp.subtitle}</p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-brand-maroon group-hover:translate-x-0.5 transition-transform">
                      <Eye className="w-3.5 h-3.5" />
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer tip */}
              <div className="p-2.5 bg-purple-100/60 rounded-xl text-center border border-purple-200/70">
                <span className="text-[10px] text-purple-950 font-semibold">
                  💡 Use this during client presentations to showcase all 7 ad touchpoints instantly!
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
