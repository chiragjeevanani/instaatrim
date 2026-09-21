import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { getDaySlots, getInstantAvailability } from '../../../shared/lib/availability';
import { acquireHold, releaseHold } from '../../../shared/lib/slotLock';
import { rollingDays, dateKey } from '../../../shared/lib/time';
import { getRecommendationsForCategories } from '../../../shared/data/productRecommendations';
import {
  X,
  Trash2,
  Calendar,
  Clock,
  Zap,
  Tag,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Check
} from 'lucide-react';

export const BookingFlowModal = ({ salonId: propSalonId }) => {
  const navigate = useNavigate();
  const {
    isBookingFlowOpen,
    setIsBookingFlowOpen,
    cartItems,
    removeFromCart,
    cartSummary,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    bookingSlot,
    setBookingSlot,
    preferredProduct,
    setPreferredProduct,
    showToast
  } = useCustomer();

  const { state } = useAppData();

  const salonId = propSalonId || cartItems[0]?.salonId;
  const salon = state.salons.find((s) => s.id === salonId) || state.salons[0];
  const staffList = useMemo(() => state.staff.filter((s) => s.salonId === salon?.id), [state.staff, salon?.id]);

  const durationMinutes = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.durationMinutes || 30), 0) || 30,
    [cartItems]
  );

  // Categories in current cart
  const cartCategories = useMemo(
    () => Array.from(new Set(cartItems.map((item) => item.category).filter(Boolean))),
    [cartItems]
  );

  // Relevant brand recommendations
  const productRecommendations = useMemo(
    () => getRecommendationsForCategories(cartCategories),
    [cartCategories]
  );

  const hasUpsell = productRecommendations.length > 0;

  // Steps: 1: Cart, 2: Slot/Date, 3: Preferred Product (if applicable), 4: Summary
  const [currentStep, setCurrentStep] = useState(1);
  const [couponInput, setCouponInput] = useState('');

  // Step 2 state (Date/Slot)
  const days = useMemo(() => rollingDays(14), []);
  const [bookingType, setBookingType] = useState(bookingSlot.type || 'Scheduled');
  const [selectedDayKey, setSelectedDayKey] = useState(bookingSlot.dateKey || days[1]?.key || days[0]?.key);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isHoldingSlot, setIsHoldingSlot] = useState(false);

  const selectedDay = days.find((d) => d.key === selectedDayKey) || days[0];

  const { slots: daySlots, reason: daySlotsReason } = useMemo(() => {
    if (!salon || !selectedDay) return { slots: [], reason: 'Loading…' };
    return getDaySlots({
      salon,
      staffList,
      durationMinutes,
      category: cartCategories[0] || null,
      bookings: state.bookings,
      holds: state.holds,
      dateObj: selectedDay.date,
      excludeHoldId: bookingSlot.holdId
    });
  }, [salon, staffList, durationMinutes, cartCategories, state.bookings, state.holds, selectedDay, bookingSlot.holdId]);

  const instantAvailability = useMemo(() => {
    if (!salon) return { state: 'unavailable', label: 'Unavailable', slot: null };
    return getInstantAvailability({
      salon,
      staffList,
      durationMinutes,
      category: cartCategories[0] || null,
      bookings: state.bookings,
      holds: state.holds
    });
  }, [salon, staffList, durationMinutes, cartCategories, state.bookings, state.holds]);

  // Reset step when opened
  useEffect(() => {
    if (isBookingFlowOpen) {
      setCurrentStep(1);
    }
  }, [isBookingFlowOpen]);

  // Reset slot when date changes
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDayKey, bookingType]);

  if (!isBookingFlowOpen) return null;

  const handleClose = () => {
    setIsBookingFlowOpen(false);
  };

  const handleNextFromCart = () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty. Add services first.');
      return;
    }
    setCurrentStep(2);
  };

  const handleConfirmSlotAndNext = async () => {
    setIsHoldingSlot(true);
    try {
      if (bookingType === 'Instant') {
        if (instantAvailability.state === 'unavailable' || !instantAvailability.slot) {
          showToast('Instant booking is not available right now. Please choose a scheduled slot.');
          setIsHoldingSlot(false);
          return;
        }

        // Release prior hold if any
        if (bookingSlot.holdId) {
          await releaseHold(bookingSlot.holdId);
        }

        const hold = await acquireHold({
          salonId: salon.id,
          serviceId: cartItems[0]?.id || null,
          staffId: instantAvailability.slot.staffId,
          dateObj: new Date(),
          startMin: instantAvailability.slot.startMin,
          endMin: instantAvailability.slot.endMin
        });

        setBookingSlot({
          type: 'Instant',
          dateKey: dateKey(new Date()),
          date: 'Today',
          time: instantAvailability.slot.time,
          staffId: instantAvailability.slot.staffId,
          holdId: hold.id,
          holdExpiresAt: hold.expiresAt,
          durationMinutes
        });
        showToast(`Instant slot locked for 8 mins!`);
      } else {
        if (!selectedSlot) {
          showToast('Please select a timeslot first.');
          setIsHoldingSlot(false);
          return;
        }

        // Release prior hold if any
        if (bookingSlot.holdId) {
          await releaseHold(bookingSlot.holdId);
        }

        const hold = await acquireHold({
          salonId: salon.id,
          serviceId: cartItems[0]?.id || null,
          staffId: selectedSlot.staffId,
          dateObj: selectedDay.date,
          startMin: selectedSlot.startMin,
          endMin: selectedSlot.endMin
        });

        setBookingSlot({
          type: 'Scheduled',
          dateKey: selectedDay.key,
          date: selectedDay.isToday ? 'Today' : selectedDay.label,
          time: selectedSlot.time,
          staffId: selectedSlot.staffId,
          holdId: hold.id,
          holdExpiresAt: hold.expiresAt,
          durationMinutes
        });
        showToast(`Slot locked for 8 mins — ${selectedDay.label}, ${selectedSlot.time}`);
      }

      // If category has product recommendations, go to Step 3, otherwise Step 4
      if (hasUpsell) {
        setCurrentStep(3);
      } else {
        setCurrentStep(4);
      }
    } catch (err) {
      showToast('Could not hold slot. Please pick another timeslot.');
    } finally {
      setIsHoldingSlot(false);
    }
  };

  const handleProductSelect = (brandName) => {
    if (preferredProduct === brandName) {
      setPreferredProduct(null);
    } else {
      setPreferredProduct(brandName);
    }
  };

  const handleProceedToCheckout = () => {
    setIsBookingFlowOpen(false);
    navigate('/customer/checkout');
  };

  const stepTitles = [
    { num: 1, label: 'Cart' },
    { num: 2, label: 'Slot & Date' },
    ...(hasUpsell ? [{ num: 3, label: 'Product Kit' }] : []),
    { num: 4, label: 'Summary' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 27, stiffness: 300 }}
          className="relative w-full max-w-[480px] bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col z-10 overflow-hidden border-t border-x border-purple-200/80"
        >
          {/* Header */}
          <div className="px-4 pt-3 pb-2.5 bg-white/95 border-b border-purple-100 backdrop-blur-xs shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                {currentStep > 1 && (
                  <button
                    onClick={() => {
                      if (currentStep === 4 && !hasUpsell) {
                        setCurrentStep(2);
                      } else {
                        setCurrentStep((prev) => Math.max(1, prev - 1));
                      }
                    }}
                    className="p-1 rounded-full text-stone-600 hover:bg-stone-100 active:scale-95 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                <div>
                  <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <span>Service Booking Flow</span>
                    <span className="text-[10px] bg-purple-100 text-brand-maroon font-extrabold px-1.5 py-0.2 rounded-full">
                      Step {currentStep === 4 && !hasUpsell ? 3 : currentStep} of {hasUpsell ? 4 : 3}
                    </span>
                  </h3>
                  <p className="text-[10.5px] text-stone-500">{salon.name}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {stepTitles.map((step, idx) => {
                const isActive = (step.num === currentStep) || (step.num === 4 && currentStep === 4);
                const isPast = step.num < currentStep;

                return (
                  <div key={step.num} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex items-center">
                      <div
                        className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                          isPast ? 'bg-emerald-500' : isActive ? 'bg-brand-maroon' : 'bg-stone-200'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[9px] mt-1 font-bold truncate ${
                        isActive ? 'text-brand-maroon' : isPast ? 'text-emerald-700' : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Content Scroll Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {/* STEP 1: CART REVIEW */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-3"
              >
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-2xl border border-stone-200 p-5">
                    <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                    <h4 className="font-bold text-stone-800 text-xs">Your cart is empty</h4>
                    <p className="text-[10.5px] text-stone-500 mt-1">Please add services to start your booking.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-bold text-stone-500 uppercase tracking-wider">
                          Selected Treatments ({cartItems.length})
                        </span>
                        <span className="text-[10px] text-stone-400">Total duration: ~{durationMinutes} mins</span>
                      </div>

                      {cartItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-purple-100 rounded-xl p-3 flex items-start justify-between gap-3 shadow-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-stone-900 leading-snug">{item.name || item.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-[10.5px] text-stone-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-stone-400" />
                                {item.duration}
                              </span>
                              <span>•</span>
                              <span className="text-purple-900 font-semibold">{item.category || 'Service'}</span>
                            </div>
                            <div className="flex items-baseline gap-1.5 mt-1.5">
                              <span className="text-xs font-black text-stone-900">₹{item.price}</span>
                              {item.originalPrice && (
                                <span className="text-[10px] text-stone-400 line-through">₹{item.originalPrice}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg active:scale-90 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Coupons & Promo Box */}
                    <div className="bg-white border border-purple-100 rounded-xl p-3 shadow-xs">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Tag className="w-3.5 h-3.5 text-brand-maroon" />
                        <span className="text-xs font-bold text-stone-900">Coupons &amp; Offers</span>
                      </div>

                      {appliedCoupon ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                                {appliedCoupon.code}
                              </span>
                              <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded-full font-bold">
                                Applied
                              </span>
                            </div>
                            <p className="text-[10px] text-emerald-700 mt-0.5">{appliedCoupon.description}</p>
                          </div>
                          <button
                            onClick={removeCoupon}
                            className="text-xs font-bold text-red-600 hover:underline px-1"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Enter Promo Code"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            className="flex-1 bg-stone-100 text-stone-800 text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-brand-maroon font-semibold uppercase"
                          />
                          <button
                            onClick={() => {
                              if (couponInput) applyCoupon(couponInput);
                            }}
                            className="bg-stone-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Pricing summary snippet */}
                    <div className="bg-white border border-purple-100 rounded-xl p-3 shadow-xs space-y-1.5 text-xs">
                      <div className="flex justify-between text-stone-600 text-[11px]">
                        <span>Subtotal ({cartItems.length} items)</span>
                        <span>₹{cartSummary.subtotal}</span>
                      </div>
                      {cartSummary.discount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold text-[11px]">
                          <span>Discount Savings</span>
                          <span>-₹{cartSummary.discount}</span>
                        </div>
                      )}
                      <div className="border-t border-stone-100 pt-1.5 flex justify-between font-black text-xs text-stone-900">
                        <span>Total Payable</span>
                        <span className="text-sm font-black text-brand-maroon">₹{cartSummary.finalAmount}</span>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 2: DATE & TIMESLOT */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-3"
              >
                {/* Instant vs Scheduled selector */}
                <div className="grid grid-cols-2 gap-1.5 bg-[#eaddf3] border border-purple-200/50 p-1 rounded-xl">
                  <button
                    onClick={() => setBookingType('Scheduled')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      bookingType === 'Scheduled' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Scheduled Slot</span>
                  </button>

                  <button
                    onClick={() => setBookingType('Instant')}
                    disabled={!salon.hasInstantBooking}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      bookingType === 'Instant' ? 'bg-brand-maroon text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Instant / Now</span>
                  </button>
                </div>

                {bookingType === 'Instant' ? (
                  <div
                    className={`rounded-2xl p-4 text-center space-y-2 border ${
                      instantAvailability.state === 'unavailable'
                        ? 'bg-stone-100 border-stone-200'
                        : 'bg-amber-50/90 border-amber-200'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                        instantAvailability.state === 'unavailable' ? 'bg-stone-200 text-stone-500' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <h4
                      className={`font-bold text-xs ${
                        instantAvailability.state === 'unavailable' ? 'text-stone-700' : 'text-amber-950'
                      }`}
                    >
                      {instantAvailability.state === 'unavailable' ? 'Instant Booking Unavailable' : 'Express Immediate Seat'}
                    </h4>
                    <p
                      className={`text-[10.5px] leading-relaxed max-w-[280px] mx-auto ${
                        instantAvailability.state === 'unavailable' ? 'text-stone-500' : 'text-amber-800'
                      }`}
                    >
                      {instantAvailability.label}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-purple-100 shadow-xs">
                    {/* Day selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[10.5px] font-bold text-stone-600 uppercase tracking-wider">
                          Select Date
                        </label>
                        <span className="text-[10px] text-brand-maroon font-bold">14 Days Window</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-0.5 no-scrollbar">
                        {days.slice(0, 8).map((d) => (
                          <button
                            key={d.key}
                            onClick={() => setSelectedDayKey(d.key)}
                            className={`py-1.5 px-1 rounded-xl text-center border transition-all ${
                              selectedDayKey === d.key
                                ? 'border-brand-maroon bg-rose-50/50 text-brand-maroon font-bold shadow-xs'
                                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            <span className="text-[11px] font-bold block">{d.label}</span>
                            <span className="text-[9.5px] text-stone-400 block">{d.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time slots */}
                    <div>
                      <label className="text-[10.5px] font-bold text-stone-600 mb-1.5 block uppercase tracking-wider">
                        Select Start Time
                      </label>
                      {daySlots.length === 0 ? (
                        <div className="flex items-start gap-2 bg-stone-100 border border-stone-200 rounded-xl p-3">
                          <AlertCircle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                          <p className="text-[10.5px] text-stone-600">{daySlotsReason}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                          {daySlots.map((slot) => (
                            <button
                              key={slot.time}
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-1.5 px-1 text-[11px] rounded-lg font-medium text-center border transition-all flex items-center justify-center gap-1 ${
                                selectedSlot?.time === slot.time
                                  ? 'border-brand-maroon bg-brand-maroon text-white font-bold shadow-xs'
                                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                              }`}
                            >
                              {selectedSlot?.time === slot.time && <CheckCircle2 className="w-3 h-3" />}
                              <span>{slot.time}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: PREFERRED PRODUCT / BRAND (OPTIONAL UPSELL) */}
            {currentStep === 3 && hasUpsell && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-3"
              >
                <div className="bg-white rounded-2xl p-3.5 border-2 border-purple-200/80 shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[8.5px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <Sparkles className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                      Brand Kit Customizer
                    </span>
                    <span className="text-[8.5px] bg-purple-100 text-brand-maroon font-black px-1.5 py-0.5 rounded">
                      Official Partner Kits
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-stone-900 tracking-tight">
                    Step 3: Customise {cartCategories[0] ? `${cartCategories[0]} Kit` : 'Treatment Kit'}
                  </h4>
                  <p className="text-[10.5px] text-stone-500 leading-snug">
                    Select your preferred brand formulation. Salon specialists will prepare your session with genuine certified salon kits.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[10.5px] font-bold text-stone-500 uppercase tracking-wider">
                      Suggested Formulations ({productRecommendations.length})
                    </span>
                    {preferredProduct && (
                      <button
                        onClick={() => setPreferredProduct(null)}
                        className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer"
                      >
                        Reset Kit Selection
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-0.5">
                    {productRecommendations.map((prod) => {
                      const isSelected = preferredProduct === prod.brand;

                      return (
                        <div
                          key={prod.id}
                          onClick={() => handleProductSelect(prod.brand)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'border-brand-maroon bg-white shadow-md ring-2 ring-brand-maroon/20'
                              : 'border-stone-200 bg-white hover:border-purple-200 shadow-xs'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-stone-900">{prod.brand}</span>
                              <span
                                className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-extrabold text-white bg-gradient-to-r ${prod.accentColor}`}
                              >
                                {prod.badge}
                              </span>
                            </div>
                            <h5 className="text-[11px] font-semibold text-stone-700 mt-0.5 leading-snug">
                              {prod.tagline}
                            </h5>
                            <p className="text-[10px] text-stone-500 mt-0.5 leading-tight">{prod.description}</p>
                          </div>

                          <div className="shrink-0">
                            {isSelected ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductSelect(prod.brand);
                                }}
                                className="bg-brand-maroon hover:bg-brand-darkMaroon text-white font-black text-[9.5px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-xs tracking-wider uppercase cursor-pointer"
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>SELECTED</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProductSelect(prod.brand);
                                }}
                                className="bg-white hover:bg-purple-50 text-brand-maroon font-bold text-[10px] px-2.5 py-1.5 rounded-lg border border-purple-200/80 shadow-2xs active:scale-95 transition-all cursor-pointer"
                              >
                                <span>+ Select</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-2.5 bg-stone-100/80 rounded-xl border border-stone-200/70 text-center">
                  <span className="text-[10px] text-stone-500 font-medium">
                    This selection is optional. You can also customize your product kit at the salon chair.
                  </span>
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUMMARY & CONFIRMATION */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-3"
              >
                {/* Appointment recap */}
                <div className="bg-white rounded-2xl p-3.5 border border-purple-100 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider">
                      Appointment Summary
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        bookingSlot.type === 'Instant' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-brand-maroon'
                      }`}
                    >
                      {bookingSlot.type === 'Instant' ? 'Express Instant' : 'Scheduled Slot'}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="p-2 bg-purple-50 text-brand-maroon rounded-xl shrink-0">
                      {bookingSlot.type === 'Instant' ? <Zap className="w-4 h-4 fill-amber-500" /> : <Calendar className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-900">
                        {bookingSlot.type === 'Instant' ? `Today (${bookingSlot.time})` : `${bookingSlot.date} at ${bookingSlot.time}`}
                      </p>
                      <p className="text-[10.5px] text-stone-500 mt-0.5">{salon.address}</p>
                    </div>
                  </div>

                  {preferredProduct && (
                    <div className="p-2 bg-purple-50/70 rounded-xl border border-purple-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-maroon" />
                        <span className="text-[11px] font-bold text-purple-950">
                          Kit Preference: <span className="text-brand-maroon">{preferredProduct}</span>
                        </span>
                      </div>
                      <span className="text-[9px] bg-white text-brand-maroon font-bold px-1.5 py-0.5 rounded shadow-xs">
                        Included
                      </span>
                    </div>
                  )}
                </div>

                {/* Services list */}
                <div className="bg-white rounded-2xl p-3.5 border border-purple-100 shadow-xs space-y-2">
                  <span className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider block">
                    Services ({cartItems.length})
                  </span>
                  <div className="divide-y divide-stone-100">
                    {cartItems.map((item) => (
                      <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-stone-900 text-xs">{item.name || item.title}</p>
                          <p className="text-[10px] text-stone-500">{item.duration}</p>
                        </div>
                        <span className="font-black text-stone-900 text-xs">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-white rounded-2xl p-3.5 border border-purple-100 shadow-xs space-y-1.5 text-xs">
                  <span className="font-bold text-stone-800 block text-xs">Price Breakdown</span>
                  <div className="flex justify-between text-stone-600 text-[11px]">
                    <span>Item Total</span>
                    <span>₹{cartSummary.subtotal}</span>
                  </div>
                  {cartSummary.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold text-[11px]">
                      <span>Coupon Applied ({appliedCoupon?.code})</span>
                      <span>-₹{cartSummary.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-600 text-[11px]">
                    <span className="flex items-center gap-1">
                      Safety Kit &amp; Sanitation
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    </span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <div className="border-t border-stone-100 pt-1.5 flex justify-between text-xs font-black text-stone-900">
                    <span>Total Amount Payable</span>
                    <span className="text-sm text-brand-maroon">₹{cartSummary.finalAmount}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Navigation Bar */}
          <div className="p-3.5 bg-white border-t border-stone-200 shadow-soft-up shrink-0">
            {currentStep === 1 && (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-stone-400 block">Total</span>
                  <span className="text-sm font-black text-stone-900 leading-tight">₹{cartSummary.finalAmount}</span>
                </div>
                <button
                  disabled={cartItems.length === 0}
                  onClick={handleNextFromCart}
                  className="flex-1 max-w-[260px] py-2.5 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span>Select Date &amp; Slot</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="py-2.5 px-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  disabled={
                    isHoldingSlot ||
                    (bookingType === 'Instant'
                      ? instantAvailability.state === 'unavailable'
                      : !selectedSlot)
                  }
                  onClick={handleConfirmSlotAndNext}
                  className="flex-1 py-2.5 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isHoldingSlot ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Locking Slot...</span>
                    </>
                  ) : (
                    <>
                      <span>{hasUpsell ? 'Continue to Product Kit' : 'Review Summary'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {currentStep === 3 && hasUpsell && (
              <div className="flex items-center justify-between gap-2.5">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="py-2.5 px-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="py-2.5 px-3 rounded-xl border border-purple-200 bg-purple-50 text-brand-maroon font-bold text-xs hover:bg-purple-100"
                >
                  Skip
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 py-2.5 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{preferredProduct ? `Confirm ${preferredProduct}` : 'Proceed to Summary'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {currentStep === 4 && (
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    if (hasUpsell) {
                      setCurrentStep(3);
                    } else {
                      setCurrentStep(2);
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50"
                >
                  Back
                </button>
                <button
                  onClick={handleProceedToCheckout}
                  className="flex-1 py-3 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Proceed to Payment (₹{cartSummary.finalAmount})</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
