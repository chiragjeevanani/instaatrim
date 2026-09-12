import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import {
  ArrowLeft,
  Calendar,
  Zap,
  MapPin,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Banknote,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartSummary,
    bookingSlot,
    currentLocation,
    appliedCoupon,
    createBooking
  } = useCustomer();

  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay)');
  const [isProcessing, setIsProcessing] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] max-w-[480px] mx-auto p-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-sm font-bold text-stone-900">No Services to Checkout</h2>
        <p className="text-xs text-stone-500 mt-1">Please add services to your cart first.</p>
        <button
          onClick={() => navigate('/customer')}
          className="mt-4 px-5 py-2 bg-brand-maroon text-white font-bold text-xs rounded-xl shadow-xs"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const paymentOptions = [
    {
      id: 'upi-gpay',
      name: 'UPI (Google Pay / PhonePe)',
      sub: 'Instant 1-click payment',
      icon: <Smartphone className="w-4 h-4 text-emerald-600" />
    },
    {
      id: 'card',
      name: 'Credit / Debit Card',
      sub: 'Visa, MasterCard, RuPay',
      icon: <CreditCard className="w-4 h-4 text-blue-600" />
    },
    {
      id: 'pay-at-salon',
      name: 'Pay at Salon',
      sub: 'Pay cash or card after service',
      icon: <Banknote className="w-4 h-4 text-amber-600" />
    }
  ];

  const handlePayAndConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newBooking = createBooking({
        salonId: cartItems[0]?.salonId || 'sal-1',
        salonName: cartItems[0]?.salonName || 'Luxe Glow Salon & Spa',
        address: currentLocation?.area || 'South Tukoganj, Indore',
        paymentMethod: paymentMethod
      });
      setIsProcessing(false);
      navigate(`/customer/booking-confirmation/${newBooking.id}`);
    }, 1100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-24 mx-auto border-x border-purple-200/50 overflow-x-hidden box-border"
    >
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#f8f4fb]/95 backdrop-blur-md px-3.5 py-2.5 border-b border-purple-100 flex items-center gap-2">
        <button onClick={() => navigate(-1)} className="p-1 text-stone-700 active:scale-95">
          <ArrowLeft className="w-4 h-4 stroke-[2]" />
        </button>
        <div>
          <h1 className="text-xs font-bold text-stone-900">Review &amp; Payment</h1>
          <p className="text-[10px] text-stone-500">Secure Checkout</p>
        </div>
      </header>

      <main className="p-3.5 space-y-3">
        {/* Appointment Slot & Venue Summary */}
        <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
            <span className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider">Appointment</span>
            <span
              className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                bookingSlot.type === 'Instant'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-rose-100 text-brand-maroon'
              }`}
            >
              {bookingSlot.type === 'Instant' ? 'Express Instant' : 'Scheduled'}
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-stone-100 rounded-lg text-stone-800 shrink-0">
              {bookingSlot.type === 'Instant' ? <Zap className="w-4 h-4 fill-amber-500 text-amber-500" /> : <Calendar className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">
                {bookingSlot.type === 'Instant' ? 'Today (Ready in 15 mins)' : `${bookingSlot.date} at ${bookingSlot.time}`}
              </p>
              <p className="text-[10.5px] text-stone-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-maroon shrink-0" />
                {currentLocation?.area || 'South Tukoganj, Indore'}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Services Summary */}
        <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-2">
          <span className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider block">
            Services ({cartItems.length})
          </span>
          <div className="divide-y divide-stone-100">
            {cartItems.map((item) => (
              <div key={item.id} className="py-1.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-stone-900 text-xs">{item.name || item.title}</p>
                  <p className="text-[10px] text-stone-500">{item.duration}</p>
                </div>
                <span className="font-black text-stone-900 text-xs">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-2">
          <span className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider block">
            Payment Method
          </span>
          <div className="space-y-1.5">
            {paymentOptions.map((opt) => (
              <label
                key={opt.id}
                onClick={() => setPaymentMethod(opt.name)}
                className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === opt.name
                    ? 'border-brand-maroon bg-rose-50/50'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-white rounded-lg border border-stone-200 shadow-xs">
                    {opt.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">{opt.name}</p>
                    <p className="text-[9.5px] text-stone-500">{opt.sub}</p>
                  </div>
                </div>
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    paymentMethod === opt.name
                      ? 'border-brand-maroon bg-brand-maroon'
                      : 'border-stone-400'
                  }`}
                >
                  {paymentMethod === opt.name && <div className="w-1 h-1 bg-white rounded-full" />}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Cancellation Notice */}
        <div className="bg-stone-200/60 rounded-xl p-2.5 flex items-start gap-2 text-xs text-stone-600">
          <AlertCircle className="w-3.5 h-3.5 text-brand-maroon shrink-0 mt-0.5" />
          <p className="text-[10.5px] text-stone-600 leading-snug">
            Free cancellation up to 1 hr before your slot with 100% full refund guarantee.
          </p>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-1.5 text-xs">
          <span className="font-bold text-stone-800 block text-xs">Price Details</span>
          <div className="flex justify-between text-stone-600 text-[11px]">
            <span>Item Total</span>
            <span>₹{cartSummary.subtotal}</span>
          </div>
          {cartSummary.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold text-[11px]">
              <span>Coupon Savings ({appliedCoupon?.code})</span>
              <span>-₹{cartSummary.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-stone-600 text-[11px]">
            <span>Safety Kit</span>
            <span className="text-emerald-600 font-bold">FREE</span>
          </div>
          <div className="border-t border-stone-200 pt-1.5 flex justify-between text-xs font-black text-stone-900">
            <span>Total Payable</span>
            <span>₹{cartSummary.finalAmount}</span>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto p-3 bg-white/95 backdrop-blur-md border-t border-stone-200 z-40 shadow-soft-up box-border">
        <button
          disabled={isProcessing}
          onClick={handlePayAndConfirm}
          className="w-full py-3 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Processing...</span>
            </div>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Pay ₹{cartSummary.finalAmount} &amp; Confirm Booking</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
