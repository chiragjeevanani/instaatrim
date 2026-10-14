import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { formatDateKeyFriendly } from '../../../shared/lib/time';
import confetti from 'canvas-confetti';
import { Calendar, Clock, MapPin, Check, ArrowRight, Home, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const BookingConfirmationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { bookings = [], showToast } = useCustomer();

  const stateBooking = bookings.find((b) => b.id === bookingId || b._id === bookingId);
  const [fetchedBooking, setFetchedBooking] = useState(null);
  const [loading, setLoading] = useState(!stateBooking);

  useEffect(() => {
    if (stateBooking) {
      setLoading(false);
      return;
    }
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:6200/api';
    fetch(`${apiBase}/bookings/${bookingId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const b = json.data;
          setFetchedBooking({ ...b, id: b._id || b.id });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookingId, stateBooking]);

  const booking = stateBooking || fetchedBooking || (bookings.length > 0 ? bookings[0] : null);

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

  if (loading && !booking) {
    return (
      <div className="w-full max-w-[480px] min-h-screen bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] flex items-center justify-center mx-auto p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-maroon animate-spin mx-auto" />
          <p className="text-xs font-bold text-stone-700">Loading booking confirmation...</p>
        </div>
      </div>
    );
  }

  const idDisplay = booking?.id || booking?._id || bookingId;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-12 mx-auto border-x border-purple-200/50 lg:max-w-xl lg:my-8 lg:min-h-0 lg:pb-8 lg:rounded-3xl lg:border lg:shadow-sm flex flex-col justify-between overflow-x-hidden box-border"
    >
      <main className="p-4 lg:p-8 text-center space-y-3.5">
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
          <span className="text-xs font-black text-stone-900 tracking-wider">{idDisplay}</span>
        </div>

        {/* Booking Card Details */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs text-left space-y-3">
          <div className="flex justify-between items-start pb-2 border-b border-stone-100">
            <div>
              <h2 className="font-bold text-stone-900 text-sm">{booking?.salonName || 'Partner Salon'}</h2>
              <p className="text-[10.5px] text-stone-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-brand-maroon" />
                {booking?.address || 'Indore'}
              </p>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {booking?.status || 'Confirmed'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-brand-maroon" />
              <div>
                <span className="text-[9px] text-stone-400 font-bold uppercase block">Date</span>
                <span className="text-xs font-bold text-stone-800">{booking?.dateKey ? formatDateKeyFriendly(booking.dateKey) : 'Today'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-brand-maroon" />
              <div>
                <span className="text-[9px] text-stone-400 font-bold uppercase block">Time</span>
                <span className="text-xs font-bold text-stone-800">{booking?.time || 'Immediate'}</span>
              </div>
            </div>
          </div>

          {/* Booked Services */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              Booked Services
            </span>
            {(booking?.services || []).map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs text-stone-700">
                <span className="text-[11px]">{item.name || item.title}</span>
                <span className="font-bold text-xs">₹{item.price}</span>
              </div>
            ))}
          </div>

          {booking?.preferredProduct && (
            <div className="bg-purple-50/80 border border-purple-200/70 p-2.5 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-maroon" />
                <div>
                  <span className="text-[9.5px] font-bold uppercase text-purple-900 block">Treatment Formulation</span>
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
              <span className="text-[10.5px] text-stone-500">Paid via {booking?.paymentMethod || 'Online'}</span>
              {booking?.couponApplied && (
                <p className="text-[9.5px] text-emerald-600 font-bold">Coupon {booking.couponApplied} applied</p>
              )}
            </div>
            <span className="text-sm font-black text-stone-900">₹{booking?.finalPaid ?? booking?.totalAmount ?? 0}</span>
          </div>
        </div>

        {/* TOUCHPOINT 7: POST-BOOKING CONFIRMATION AFTERCARE RETAIL & CROSS-SELL */}
        <div className="bg-gradient-to-br from-white via-purple-50/30 to-stone-50 rounded-2xl p-3.5 border-2 border-purple-200/80 shadow-xs text-left space-y-3">
          {/* Wireframe Confirmed Banner */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-2 flex items-center justify-between text-emerald-900 shadow-2xs">
            <span className="text-xs font-black flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              Booking Confirmed! ID: #{idDisplay}
            </span>
            <span className="text-[9px] bg-emerald-200/80 text-emerald-950 font-extrabold px-2 py-0.5 rounded-full">
              Ready For Visit
            </span>
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
