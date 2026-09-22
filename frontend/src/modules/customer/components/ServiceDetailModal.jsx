import React, { useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../context/CustomerContext';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Clock,
  Star,
  CheckCircle2,
  Sparkles,
  ChevronUp,
  ArrowLeft,
  Share2,
  MapPin,
  Zap,
  ShoppingBag,
  Check,
  Maximize2,
  Minimize2,
  Award,
  Layers
} from 'lucide-react';

const cardVariants = {
  initial: {
    opacity: 0,
    scale: 0.92,
    y: 8,
    width: 'calc(100% - 32px)',
    maxWidth: '430px',
    height: 'min(580px, 80vh)',
    borderRadius: '24px'
  },
  modal: {
    opacity: 1,
    scale: 1,
    y: 0,
    width: 'calc(100% - 32px)',
    maxWidth: '430px',
    height: 'min(580px, 80vh)',
    borderRadius: '24px',
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  fullscreen: {
    opacity: 1,
    scale: 1,
    y: 0,
    width: '100%',
    maxWidth: '480px',
    height: '100%',
    borderRadius: '0px',
    transition: {
      duration: 0.38,
      ease: [0.19, 1, 0.22, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 8,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const ServiceDetailModal = () => {
  const {
    activeDetailService,
    serviceModalStage,
    setServiceModalStage,
    closeServiceDetail,
    cartItems,
    addToCart,
    setIsCartOpen,
    setIsSlotPickerOpen,
    showToast
  } = useCustomer();

  const { state } = useAppData();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const isFullscreen = serviceModalStage === 'fullscreen';
  const isOpen = serviceModalStage === 'modal' || serviceModalStage === 'fullscreen';

  // Find linked salon
  const salon = useMemo(() => {
    if (!activeDetailService) return null;
    return (
      state.salons.find((s) => s.id === activeDetailService.salonId) || {
        id: activeDetailService.salonId || 'sal-1',
        name: activeDetailService.salonName || 'InstaaTrim Partner Salon',
        area: 'South Tukoganj, Indore',
        rating: 4.8,
        reviewsCount: 168,
        distanceKm: 1.2,
        hasInstantBooking: true,
        instantWaitMinutes: 15
      }
    );
  }, [activeDetailService, state.salons]);

  const isInCart = useMemo(() => {
    if (!activeDetailService) return false;
    return cartItems.some((item) => item.id === activeDetailService.id);
  }, [cartItems, activeDetailService]);

  const discountPct = useMemo(() => {
    if (!activeDetailService?.originalPrice || !activeDetailService?.price) return null;
    return Math.round((1 - activeDetailService.price / activeDetailService.originalPrice) * 100);
  }, [activeDetailService]);

  const eliteSavings = useMemo(() => {
    if (!activeDetailService?.price) return 100;
    return Math.round(activeDetailService.price * 0.1);
  }, [activeDetailService]);

  // Smooth scroll & wheel triggers to transition from box modal to full-screen
  const handleScroll = (e) => {
    if (!isFullscreen && e.currentTarget.scrollTop > 18) {
      setServiceModalStage('fullscreen');
    }
  };

  const handleWheel = (e) => {
    if (!isFullscreen && e.deltaY > 15) {
      setServiceModalStage('fullscreen');
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setServiceModalStage('modal');
        } else {
          closeServiceDetail();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, closeServiceDetail, setServiceModalStage]);

  if (!isOpen || !activeDetailService) return null;

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator
        .share({
          title: activeDetailService.title || activeDetailService.name,
          text: `Check out ${activeDetailService.title || activeDetailService.name} on InstaaTrim!`,
          url: window.location.href
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Service link copied to clipboard!');
    }
  };

  const handleBookNowDirect = () => {
    if (!isInCart) {
      addToCart(activeDetailService, { id: salon.id, name: salon.name });
    }
    closeServiceDetail();
    setIsSlotPickerOpen(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={() => {
              if (isFullscreen) {
                setServiceModalStage('modal');
              } else {
                closeServiceDetail();
              }
            }}
            className="fixed inset-0 bg-stone-950/65 backdrop-blur-sm z-40 cursor-pointer"
          />

          {/* Animated Boxed Modal transforming smoothly to Full-Screen */}
          <motion.div
            key="boxed-modal-card"
            variants={cardVariants}
            initial="initial"
            animate={isFullscreen ? 'fullscreen' : 'modal'}
            exit="exit"
            className="relative z-50 bg-[#faf9f6] text-stone-900 shadow-2xl flex flex-col overflow-hidden border border-stone-200/90 transform-gpu will-change-transform select-none"
            data-purpose="boxed-service-modal"
          >
            {/* Morphing Top Navigation Bar */}
            <div
              className={`w-full shrink-0 flex items-center justify-between px-3.5 select-none z-20 transition-colors duration-300 ${
                isFullscreen
                  ? 'h-14 bg-white/95 backdrop-blur-md border-b border-stone-200/80 sticky top-0 shadow-2xs'
                  : 'h-12 bg-white/85 backdrop-blur-sm border-b border-stone-200/60'
              }`}
            >
              {isFullscreen ? (
                <>
                  <button
                    type="button"
                    onClick={() => setServiceModalStage('modal')}
                    className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                    title="Collapse to Box Modal"
                  >
                    <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <div className="flex-1 min-w-0 px-2.5 text-center">
                    <h3 className="text-xs font-bold text-stone-900 truncate">
                      {activeDetailService.title || activeDetailService.name}
                    </h3>
                    <p className="text-[10px] text-stone-500 font-medium truncate">
                      {salon.name} • {salon.area}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer active:scale-95 transition-colors"
                      title="Share Service"
                    >
                      <Share2 className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                    <button
                      type="button"
                      onClick={closeServiceDetail}
                      className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer active:scale-95 transition-colors"
                      title="Close"
                    >
                      <X className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 bg-amber-100/90 border border-amber-300/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                      {activeDetailService.category || 'Service'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setServiceModalStage('fullscreen')}
                      className="h-7 px-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                      title="Expand to Full Page"
                    >
                      <Maximize2 className="w-3 h-3 stroke-[2.2]" />
                      <span>Expand</span>
                    </button>
                    <button
                      type="button"
                      onClick={closeServiceDetail}
                      className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center cursor-pointer active:scale-95 transition-colors"
                      title="Close"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Scrollable Body Content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              onWheel={handleWheel}
              className="flex-1 overflow-y-auto no-scrollbar overscroll-contain px-4 pb-20 pt-3 space-y-3.5"
            >
              {/* Hero Image Card */}
              <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-xs shrink-0">
                <img
                  src={activeDetailService.image}
                  alt={activeDetailService.title || activeDetailService.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/15 to-transparent" />

                {/* Instant Ready tag on hero image */}
                {salon.hasInstantBooking && (
                  <div className="absolute top-2.5 left-2.5">
                    <span className="bg-amber-400 text-stone-950 text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      Instant Ready
                    </span>
                  </div>
                )}

                {/* Bottom image stats overlay */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10.5px] font-bold bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>4.9</span>
                    <span className="text-stone-300 font-normal">(140+ reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10.5px] text-stone-200 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3 text-stone-300" />
                    <span>{activeDetailService.duration || '60 mins'}</span>
                  </div>
                </div>
              </div>

              {/* Title & Pricing Card */}
              <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                <h1 className="text-base font-bold text-stone-900 leading-tight">
                  {activeDetailService.title || activeDetailService.name}
                </h1>
                <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                  {activeDetailService.description ||
                    'Signature luxury aesthetic treatment performed by certified therapists with medical-grade sterile tools.'}
                </p>

                {/* Price Row */}
                <div className="flex items-baseline gap-2 mt-3 pt-3 border-t border-stone-100">
                  <span className="text-lg font-black text-stone-900">
                    ₹{activeDetailService.price}
                  </span>
                  {activeDetailService.originalPrice && (
                    <span className="text-xs text-stone-400 line-through font-medium">
                      ₹{activeDetailService.originalPrice}
                    </span>
                  )}
                  {discountPct && (
                    <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {discountPct}% OFF
                    </span>
                  )}
                </div>

                {/* Elite Membership Perk banner */}
                <div className="mt-2.5 bg-stone-900 text-white rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-black text-amber-400 text-xs">Elite</span>
                    <span className="text-[10px] text-stone-200 font-medium">
                      Save extra <strong className="text-amber-400 font-bold">₹{eliteSavings}</strong> on this booking
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-amber-300 underline cursor-pointer">
                    Perk
                  </span>
                </div>
              </div>

              {/* Scroll / Expand Prompt (visible in boxed modal state) */}
              {!isFullscreen && (
                <div
                  onClick={() => setServiceModalStage('fullscreen')}
                  className="bg-stone-200/70 hover:bg-stone-200 p-2.5 rounded-xl border border-stone-300/70 text-center cursor-pointer flex items-center justify-center gap-1.5 transition-colors active:scale-98"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-stone-600 animate-bounce" />
                  <span className="text-[11px] font-bold text-stone-800">
                    Scroll down or tap to view full treatment steps &amp; details
                  </span>
                </div>
              )}

              {/* Extended Details (Treatment Steps, Standards, Reviews, Salon) */}
              <div className="space-y-3.5 pt-0.5">
                {/* Salon Provider Card */}
                <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-stone-400 tracking-wider">
                        Performed At
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <h4 className="text-xs font-bold text-stone-900">{salon.name}</h4>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        closeServiceDetail();
                        navigate(`/customer/salons/${salon.id}`);
                      }}
                      className="text-[10px] font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      View Salon
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-[10px] text-stone-500 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      {salon.area}
                    </span>
                    <span>•</span>
                    <span>{salon.distanceKm != null ? `${salon.distanceKm.toFixed(1)} km away` : 'Near you'}</span>
                  </div>
                </div>

                {/* Step-by-Step Treatment Procedure */}
                <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Layers className="w-3.5 h-3.5 text-stone-700" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Treatment Steps ({activeDetailService.duration || '60 mins'})
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-left">
                    {[
                      { step: '01', title: 'Consultation & Analysis', time: '10 mins', desc: 'Stylist assesses texture and sensitivities to select tailored formulations.' },
                      { step: '02', title: 'Deep Cleansing & Steam Prep', time: '15 mins', desc: 'Warm towel treatment and pH-balanced detox cleanse to unclog pores.' },
                      { step: '03', title: 'Signature Active Treatment', time: '25 mins', desc: 'Precision active treatment applied with specialized certified techniques.' },
                      { step: '04', title: 'Soothing Massage & Shield', time: '10 mins', desc: 'Pressure point relaxation massage followed by antioxidant hydration barrier.' }
                    ].map((s, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 pb-2 border-b border-stone-100 last:border-0 last:pb-0">
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 shrink-0">
                          {s.step}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="text-[11px] font-bold text-stone-900">{s.title}</h5>
                            <span className="text-[9px] text-stone-400 font-medium">{s.time}</span>
                          </div>
                          <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality & Safety Assurance */}
                <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Quality &amp; Hygiene Standards
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left">
                    {[
                      { title: 'Single-Use Sealed Kits', desc: 'Freshly opened in front of you' },
                      { title: 'Certified Master Stylists', desc: 'Background & trade verified' },
                      { title: 'Dermatologically Tested', desc: 'Zero toxic parabens or sulfates' },
                      { title: 'Satisfaction Guaranteed', desc: 'Free fix if not 100% delighted' }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-stone-50 p-2 rounded-xl border border-stone-200/70">
                        <span className="text-[10px] font-bold text-stone-900 block leading-tight">
                          {item.title}
                        </span>
                        <span className="text-[8.5px] text-stone-500 leading-none mt-0.5 block">
                          {item.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real Customer Feedback */}
                <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Verified Customer Reviews
                    </h3>
                    <span className="text-[10px] font-bold text-stone-500">4.9 ★ Rating</span>
                  </div>

                  <div className="space-y-2 text-left">
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/70">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-stone-900">Aarav M.</span>
                        <div className="flex items-center gap-0.5 text-amber-500 text-[10px]">
                          ★★★★★
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-600 mt-1 leading-snug">
                        "Extremely professional service. The salon was immaculate and the therapist explained every step beforehand. Highly recommended!"
                      </p>
                    </div>

                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/70">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-stone-900">Sneha K.</span>
                        <div className="flex items-center gap-0.5 text-amber-500 text-[10px]">
                          ★★★★★
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-600 mt-1 leading-snug">
                        "My skin feels so refreshed and glowing! The massage at the end was an absolute bliss. Booking again next month."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Bottom Booking Action Bar */}
            <div className="shrink-0 bg-white/95 backdrop-blur-md p-3 border-t border-stone-200/80 flex items-center justify-between gap-3 shadow-lg z-30">
              <div>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                  Total Price
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-stone-900">
                    ₹{activeDetailService.price}
                  </span>
                  {activeDetailService.originalPrice && (
                    <span className="text-[10px] text-stone-400 line-through">
                      ₹{activeDetailService.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isInCart ? (
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(true)}
                    className="h-9 px-3 border border-emerald-600 text-emerald-800 bg-emerald-50 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>In Cart</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToCart(activeDetailService, { id: salon.id, name: salon.name })}
                    className="h-9 px-3 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 border border-stone-300/80"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add To Cart</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleBookNowDirect}
                  className="h-9 px-3.5 bg-[#1e2329] hover:bg-stone-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
                >
                  <span>Book Now</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
