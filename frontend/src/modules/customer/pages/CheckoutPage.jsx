import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { processPayment } from '../../../shared/lib/payments';
import { releaseHold, isHoldStillValid } from '../../../shared/lib/slotLock';
import { HoldCountdown } from '../components/HoldCountdown';
import {
  ArrowLeft,
  Calendar,
  Zap,
  MapPin,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Banknote,
  Landmark,
  Wallet,
  AlertCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartSummary,
    bookingSlot,
    setBookingSlot,
    preferredProduct,
    currentLocation,
    appliedCoupon,
    createBooking,
    showToast,
    user
  } = useCustomer();
  const { state } = useAppData();

  const [paymentMethod, setPaymentMethod] = useState('Pay Online');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [holdExpired, setHoldExpired] = useState(false);
  const [showSuccessTick, setShowSuccessTick] = useState(false);

  // Exact Business Commercial Calculation (as per spreadsheet):
  // Salon Bill Value = cartSummary.subtotal
  // Customer Visible Discount = 40% of bill value
  // Instant Discount = 50% of visible discount (i.e. 20% of bill value)
  // Wallet Cashback Issued = 50% of visible discount (i.e. 20% of bill value)
  const billValue = cartSummary.subtotal || 0;
  const visibleDiscount = Math.round(billValue * 0.40);
  const instantDiscount = Math.round(visibleDiscount * 0.50);
  const walletCashbackIssued = Math.round(visibleDiscount * 0.50);

  // Wallet Redeemed: 50% of available wallet balance can be redeemed
  const walletBalance = Number(user?.wallet_balance) || 0;
  const walletRedeemed = Math.min(Math.round(walletBalance * 0.50), Math.max(0, billValue - instantDiscount));
  const walletCashbackLeft = Math.max(0, walletBalance - walletRedeemed);
  const totalDirectDiscount = instantDiscount + walletRedeemed + (cartSummary.discount || 0);
  const calculatedPayable = Math.max(0, billValue - instantDiscount - walletRedeemed);
  const newEndingWalletBalance = walletCashbackLeft + walletCashbackIssued;

  if (showSuccessTick) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-stone-900">
            Booking Confirmed!
          </h2>
        </motion.div>
      </div>
    );
  }

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
    { id: 'pay-online', name: 'Pay Online', sub: 'Cards, UPI, Wallets, NetBanking (via Razorpay)', icon: <Smartphone className="w-4 h-4 text-emerald-600" /> },
    { id: 'pay-at-salon', name: 'Pay at Salon (COD)', sub: 'Pay cash or card after service', icon: <Banknote className="w-4 h-4 text-amber-600" /> }
  ];

  const handleHoldExpire = () => {
    if (holdExpired) return;
    setHoldExpired(true);
    showToast('Your held slot expired. Please pick a new one.');
  };

  const confirmBookingAfterPayment = async (paymentStatus, transactionId) => {
    try {
      const newBooking = await createBooking({
        salonId: cartItems[0]?.salonId || 'sal-1',
        salonName: cartItems[0]?.salonName || 'Luxe Glow Salon & Spa',
        address: currentLocation?.area || 'South Tukoganj, Indore',
        paymentMethod,
        paymentStatus,
        transactionId,
        holdId: bookingSlot.holdId,
        staffId: bookingSlot.staffId,
        finalPaid: calculatedPayable + (cartSummary.taxAmount || 0)
      });

      await releaseHold(bookingSlot.holdId);
      setBookingSlot((prev) => ({ ...prev, holdId: null, holdExpiresAt: null }));
      
      // Show Zomato-style success tick before navigating
      setShowSuccessTick(true);
      setTimeout(() => {
        setShowSuccessTick(false);
        navigate(`/customer/booking-confirmation/${newBooking.id}`);
      }, 2000);
      
    } catch (err) {
      setPaymentError(err?.message || 'Booking failed to save.');
      showToast(err?.message || 'Booking failed');
      setIsProcessing(false);
    }
  };

  const handlePayAndConfirm = async () => {
    setPaymentError(null);

    if (bookingSlot.holdId && !isHoldStillValid({ id: bookingSlot.holdId }, state.holds)) {
      setHoldExpired(true);
      showToast('Your held slot has expired. Please choose a new slot.');
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === 'Pay at Salon (COD)') {
      // Direct COD Flow
      await confirmBookingAfterPayment('Pending', null);
      return;
    }

    // Razorpay Flow
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:6200/api';
      
      // 1. Create order on backend
      const payableAmount = calculatedPayable + (cartSummary.taxAmount || 0);
      const res = await fetch(`${API_BASE}/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: payableAmount })
      });
      const data = await res.json();
      
      if (!data.success) throw new Error('Failed to initialize payment');

      const options = {
        key: 'rzp_test_S3IcSS1NbymL6D', // Updated test key
        amount: data.data.amount,
        currency: data.data.currency,
        name: 'DrimStyle',
        description: 'Salon Booking Payment',
        order_id: data.data.id,
        handler: async function (response) {
          // 2. Verify payment on backend
          try {
            const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              await confirmBookingAfterPayment('Paid', response.razorpay_payment_id);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (verifyErr) {
            setPaymentError('Payment verification failed. Please contact support.');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#881337'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
            showToast('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        setPaymentError('Payment failed: ' + response.error.description);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setPaymentError(err?.message || 'Failed to start payment');
      showToast(err?.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-24 mx-auto border-x border-purple-200/50 overflow-x-hidden box-border"
    >
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#f8f4fb]/95 backdrop-blur-md px-3.5 py-2.5 border-b border-purple-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1 text-stone-700 active:scale-95">
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <div>
            <h1 className="text-xs font-bold text-stone-900">Review &amp; Payment</h1>
            <p className="text-[10px] text-stone-500">Secure Checkout</p>
          </div>
        </div>
        {bookingSlot.holdExpiresAt && !holdExpired && (
          <HoldCountdown expiresAt={bookingSlot.holdExpiresAt} onExpire={handleHoldExpire} />
        )}
      </header>

      {holdExpired && (
        <div className="mx-3.5 mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-800">Your slot hold expired</p>
            <p className="text-[10.5px] text-red-700 mt-0.5">Go back and pick a slot again — someone else may now hold it.</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-2 text-[11px] font-bold text-red-700 underline"
            >
              Pick a new slot
            </button>
          </div>
        </div>
      )}

      <main className="p-3.5 space-y-3">
        {/* Appointment Slot & Venue Summary */}
        <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
            <span className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider">Appointment</span>
            <span
              className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                bookingSlot.type === 'Instant' ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-brand-maroon'
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
                {bookingSlot.type === 'Instant' ? `Today (${bookingSlot.time})` : `${bookingSlot.date} at ${bookingSlot.time}`}
              </p>
              <p className="text-[10.5px] text-stone-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-maroon shrink-0" />
                {currentLocation?.area || 'South Tukoganj, Indore'}
              </p>
            </div>
          </div>

          {preferredProduct && (
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-xs bg-purple-50/70 p-2 rounded-xl border border-purple-200/60">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-maroon" />
                <span className="text-[10.5px] font-bold text-purple-950">
                  Preferred Treatment: <span className="text-brand-maroon">{preferredProduct}</span>
                </span>
              </div>
              <span className="text-[9px] bg-white text-brand-maroon font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                Requested
              </span>
            </div>
          )}
        </div>

        {/* Selected Services Summary */}
        <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-2">
          <span className="text-[10.5px] font-bold text-stone-400 uppercase tracking-wider block">
            Services ({cartItems.length})
          </span>
          <div className="divide-y divide-stone-100">
            {cartItems.flatMap((item) => 
              Array.from({ length: item.quantity || 1 }).map((_, idx) => (
              <div key={`${item.id}-${idx}`} className="py-1.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-stone-900 text-xs">
                    {item.name || item.title}
                  </p>
                  <p className="text-[10px] text-stone-500">{item.duration}</p>
                </div>
                <span className="font-black text-stone-900 text-xs">₹{item.price}</span>
              </div>
            )))}
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
                  paymentMethod === opt.name ? 'border-brand-maroon bg-rose-50/50' : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-white rounded-lg border border-stone-200 shadow-xs">{opt.icon}</div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">{opt.name}</p>
                    <p className="text-[9.5px] text-stone-500">{opt.sub}</p>
                  </div>
                </div>
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    paymentMethod === opt.name ? 'border-brand-maroon bg-brand-maroon' : 'border-stone-400'
                  }`}
                >
                  {paymentMethod === opt.name && <div className="w-1 h-1 bg-white rounded-full" />}
                </div>
              </label>
            ))}
          </div>
        </div>

        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-[10.5px] text-red-700 leading-snug">{paymentError}</p>
          </div>
        )}

        {/* Cancellation Notice */}
        <div className="bg-stone-200/60 rounded-xl p-2.5 flex items-start gap-2 text-xs text-stone-600">
          <AlertCircle className="w-3.5 h-3.5 text-brand-maroon shrink-0 mt-0.5" />
          <p className="text-[10.5px] text-stone-600 leading-snug">
            Free cancellation up to {state.platformSettings?.cancellationFreeHours || 1} hr before your slot with 100% full refund guarantee.
          </p>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-2 text-xs">
          <span className="font-bold text-stone-800 block text-xs">Price Details</span>
          <div className="flex justify-between text-stone-600 text-[11px]">
            <span>Salon Bill Value</span>
            <span>₹{billValue}</span>
          </div>

          <div className="flex justify-between text-emerald-600 font-bold text-[11px]">
            <span>Instant Discount (50% of Promo)</span>
            <span>-₹{instantDiscount}</span>
          </div>

          {walletRedeemed > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold text-[11px]">
              <span>Wallet Redeemed (50% of balance)</span>
              <span>-₹{walletRedeemed}</span>
            </div>
          )}

          {cartSummary.discount > 0 && appliedCoupon && (
            <div className="flex justify-between text-emerald-600 font-bold text-[11px]">
              <span>Coupon Savings ({appliedCoupon?.code})</span>
              <span>-₹{cartSummary.discount}</span>
            </div>
          )}

          {cartSummary.taxAmount > 0 && (
            <div className="flex justify-between text-stone-600 text-[11px]">
              <span>Taxes & GST ({cartSummary.taxRatePercent}%)</span>
              <span>₹{cartSummary.taxAmount}</span>
            </div>
          )}

          <div className="border-t border-stone-200 pt-1.5 flex justify-between text-xs font-black text-stone-900">
            <span>Customer Pays</span>
            <span>₹{Math.max(0, calculatedPayable + (cartSummary.taxAmount || 0))}</span>
          </div>

          {/* Cashback & Wallet Summary Box (Exact flow) */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 mt-2 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-amber-900 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" /> Wallet Cashback Earned:
              </span>
              <span className="font-black text-amber-700">+₹{walletCashbackIssued}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-amber-800 pt-0.5 border-t border-amber-200/60">
              <span>Remaining Wallet Balance after booking:</span>
              <span className="font-bold">₹{newEndingWalletBalance}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto p-3 bg-white/95 backdrop-blur-md border-t border-stone-200 z-40 shadow-soft-up box-border">
        <button
          disabled={isProcessing || holdExpired}
          onClick={handlePayAndConfirm}
          className="w-full py-3 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
              <span>Pay ₹{Math.max(0, calculatedPayable + (cartSummary.taxAmount || 0))} &amp; Confirm Booking</span>
            </>
          )}
        </button>
      </div>

    </motion.div>
  );
};
