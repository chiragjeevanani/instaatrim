import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { formatDateKeyFriendly } from '../../../shared/lib/time';
import confetti from 'canvas-confetti';
import { Calendar, Clock, MapPin, Check, ArrowRight, Home, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { bookings, showToast } = useCustomer();

  const booking = bookings.find((b) => b.id === bookingId) || bookings[0];

  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.55 }
      });
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-12 mx-auto border-x border-purple-200/50 flex flex-col justify-between overflow-x-hidden box-border"
    >
      <main className="p-4 text-center space-y-3.5">
        {/* Animated Success Check Icon - Compact */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md mt-2"
        >
          <Check className="w-7 h-7 stroke-[3]" />
        </motion.div>

        <div>
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block mb-0.5">
            Booking Confirmed!
          </span>
          <h1 className="text-lg font-black text-stone-900 tracking-tight">
            We've got you scheduled
          </h1>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Appointment details generated successfully.
          </p>
        </div>

        {/* Unique Booking ID Badge */}
        <div className="inline-block bg-white/80 px-3 py-1 rounded-full border border-stone-300/80">
          <span className="text-[10px] text-stone-500 font-semibold mr-1">Booking ID:</span>
          <span className="text-xs font-black text-stone-900 tracking-wider">{booking.id}</span>
        </div>

        {/* Booking Card Details */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs text-left space-y-3">
          <div className="flex justify-between items-start pb-2 border-b border-stone-100">
            <div>
              <h2 className="font-bold text-stone-900 text-sm">{booking.salonName}</h2>
              <p className="text-[10.5px] text-stone-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-brand-maroon" />
                {booking.address}
              </p>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {booking.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-brand-maroon" />
              <div>
                <span className="text-[9px] text-stone-400 font-bold uppercase block">Date</span>
                <span className="text-xs font-bold text-stone-800">{formatDateKeyFriendly(booking.dateKey)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brand-maroon" />
              <div>
                <span className="text-[9px] text-stone-400 font-bold uppercase block">Time</span>
                <span className="text-xs font-bold text-stone-800">{booking.time}</span>
              </div>
            </div>
          </div>

          {/* Booked Services */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Booked Services
            </span>
            {booking.services?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs text-stone-700">
                <span className="text-[11px]">{item.name || item.title}</span>
                <span className="font-bold text-xs">₹{item.price}</span>
              </div>
            ))}
          </div>

          {booking.preferredProduct && (
            <div className="bg-purple-50/80 border border-purple-200/70 p-2.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-maroon" />
                <div>
                  <span className="text-[9.5px] font-bold uppercase text-purple-900 block">Brand / Product Chosen</span>
                  <span className="text-xs font-bold text-brand-maroon">{booking.preferredProduct}</span>
                </div>
              </div>
              <span className="text-[9px] bg-white border border-purple-200 text-purple-900 font-extrabold px-2 py-0.5 rounded-full">
                Customized
              </span>
            </div>
          )}

          {/* Paid Summary */}
          <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-xs">
            <div>
              <span className="text-[10.5px] text-stone-500">Paid via {booking.paymentMethod}</span>
              {booking.couponApplied && (
                <p className="text-[9.5px] text-emerald-600 font-bold">Coupon {booking.couponApplied} applied</p>
              )}
            </div>
            <span className="text-sm font-black text-stone-900">₹{booking.finalPaid}</span>
          </div>
        </div>

        {/* TOUCHPOINT 7: POST-BOOKING CONFIRMATION AFTERCARE RETAIL & CROSS-SELL */}
        <div className="bg-gradient-to-br from-white via-purple-50/30 to-stone-50 rounded-2xl p-3.5 border-2 border-purple-200/80 shadow-xs text-left space-y-3">
          {/* Wireframe Confirmed Banner */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2 flex items-center justify-between text-emerald-900 shadow-2xs">
            <span className="text-xs font-black flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              Booking Confirmed! ID: #{booking.id}
            </span>
            <span className="text-[9px] bg-emerald-200/80 text-emerald-950 font-extrabold px-2 py-0.5 rounded-full">
              Ready For Visit
            </span>
          </div>

          {/* Aftercare Skincare Retail Card (Dashed Border Wireframe) */}
          <div className="bg-white rounded-xl p-3 border-2 border-dashed border-brand-maroon/50 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[8.5px] font-black text-brand-maroon uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">
                RECOMMENDED AFTERCARE
              </span>
              <span className="text-[8.5px] font-bold text-stone-400">Official Brand Retail</span>
            </div>

            <div className="flex items-start justify-between gap-2 pt-0.5">
              <div>
                <h3 className="text-xs font-bold text-stone-900 leading-snug">
                  L'Oréal Revitalift Post-Facial Sunscreen (SPF 50+)
                </h3>
                <p className="text-[10px] text-stone-600 mt-0.5 leading-snug">
                  Get 25% Off at partner salon reception desk
                </p>
                <p className="text-[9.5px] text-emerald-700 font-semibold mt-0.5">
                  Protect and lock in your facial glow for up to 72 hours.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-black text-brand-maroon block">₹499</span>
                <span className="text-[10px] text-stone-400 line-through">₹699</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <span className="text-[9.5px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Flat 25% Off In-Salon Voucher
              </span>
              <button
                type="button"
                onClick={() => showToast('🎉 Aftercare voucher saved! Show barcode at salon reception.')}
                className="bg-brand-maroon hover:bg-brand-darkMaroon text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                Claim Voucher
              </button>
            </div>
          </div>

          {/* Lifestyle Cross-Promotion: Travel & Nearby Partner */}
          <div className="grid grid-cols-2 gap-2">
            <div
              onClick={() => {
                navigator.clipboard?.writeText('INSTAUBER');
                showToast('🚗 Uber promo code INSTAUBER copied!');
              }}
              className="bg-white rounded-xl p-2.5 border border-stone-200/90 shadow-2xs cursor-pointer hover:border-brand-maroon transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-bold text-stone-700 uppercase">🚗 Travel Partner</span>
                <span className="text-[8px] bg-stone-100 text-stone-600 px-1 py-0.2 rounded font-bold">Tap Code</span>
              </div>
              <p className="text-[10.5px] font-bold text-stone-900 mt-1 leading-tight">₹50 OFF Your Ride</p>
              <p className="text-[9px] text-stone-500 mt-0.5">
                Code: <strong className="text-brand-maroon font-black">INSTAUBER</strong>
              </p>
            </div>

            <div
              onClick={() => showToast('☕ Show your booking ID at Blue Tokai counter for 15% OFF!')}
              className="bg-white rounded-xl p-2.5 border border-stone-200/90 shadow-2xs cursor-pointer hover:border-brand-maroon transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-bold text-stone-700 uppercase">☕ Nearby Cafe</span>
                <span className="text-[8px] bg-stone-100 text-stone-600 px-1 py-0.2 rounded font-bold">15% OFF</span>
              </div>
              <p className="text-[10.5px] font-bold text-stone-900 mt-1 leading-tight">Blue Tokai Coffee</p>
              <p className="text-[9px] text-stone-500 mt-0.5">Show booking confirmation</p>
            </div>
          </div>
        </div>
      </main>

      {/* Action Buttons */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => navigate('/customer/bookings')}
          className="w-full py-3 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          <span>View in My Bookings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => navigate('/customer')}
          className="w-full py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>
    </motion.div>
  );
};
