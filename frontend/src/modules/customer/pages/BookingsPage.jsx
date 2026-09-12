import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { BottomNav } from '../components/BottomNav';
import { RateReviewModal } from '../components/RateReviewModal';
import { Calendar, Clock, MapPin, Star, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export const BookingsPage = () => {
  const navigate = useNavigate();
  const { bookings, cancelBooking, rescheduleBooking } = useCustomer();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'Confirmed' || b.status === 'Pending' || b.status === 'Checked-In' || b.status === 'Service Started'
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'Completed' || b.status === 'Cancelled'
  );

  const handleReschedule = (bookingId) => {
    rescheduleBooking(bookingId, 'Sunday', '02:00 PM');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-20 mx-auto border-x border-purple-200/50 flex flex-col justify-between overflow-x-hidden box-border"
    >
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#f8f4fb]/95 backdrop-blur-md px-3.5 pt-2.5 pb-2 border-b border-purple-100">
        <h1 className="text-sm font-bold text-stone-900 tracking-tight">My Bookings</h1>
        <p className="text-[10.5px] text-stone-500">Manage appointments or view history</p>

        {/* Tab Switcher - Compact */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#eaddf3] border border-purple-200/50 p-1 rounded-xl mt-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'upcoming'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            History ({pastBookings.length})
          </button>
        </div>
      </header>

      {/* Bookings List */}
      <main className="p-3.5 flex-1 space-y-3">
        {activeTab === 'upcoming' ? (
          upcomingBookings.length === 0 ? (
            <div className="text-center py-14">
              <Calendar className="w-10 h-10 text-stone-400 mx-auto mb-1.5" />
              <h3 className="font-bold text-xs text-stone-700">No upcoming appointments</h3>
              <p className="text-[11px] text-stone-500 mt-0.5">Ready for a pampering session?</p>
              <button
                onClick={() => navigate('/customer')}
                className="mt-3 px-4 py-1.5 bg-brand-maroon text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Book a Service
              </button>
            </div>
          ) : (
            upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-2.5"
              >
                {/* Status & ID */}
                <div className="flex justify-between items-center pb-1.5 border-b border-stone-100">
                  <span className="text-[10px] font-bold text-stone-400">ID: {b.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {b.status}
                  </span>
                </div>

                {/* Salon info */}
                <div>
                  <h3 className="font-bold text-stone-900 text-xs">{b.salonName}</h3>
                  <p className="text-[10.5px] text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-brand-maroon shrink-0" />
                    {b.address}
                  </p>
                </div>

                {/* Date / Time */}
                <div className="bg-stone-50 p-2 rounded-xl flex items-center justify-between text-xs border border-stone-100">
                  <div className="flex items-center gap-1 font-bold text-stone-800 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-brand-maroon" />
                    <span>{b.date}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-stone-800 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-brand-maroon" />
                    <span>{b.time}</span>
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-0.5">
                  {b.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-[11px] text-stone-700">
                      <span>{item.name || item.title}</span>
                      <span className="font-bold">₹{item.price}</span>
                    </div>
                  ))}
                </div>

                {/* Live Status Progression */}
                <div className="pt-1.5 border-t border-stone-100">
                  <div className="flex items-center justify-between text-[9.5px] font-bold text-stone-400">
                    <span className="text-emerald-700">✓ Confirmed</span>
                    <span>&rarr;</span>
                    <span>Checked-In</span>
                    <span>&rarr;</span>
                    <span>Started</span>
                    <span>&rarr;</span>
                    <span>Completed</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-stone-100 flex gap-2">
                  <button
                    onClick={() => handleReschedule(b.id)}
                    className="flex-1 py-1.5 rounded-lg border border-stone-300 text-stone-700 text-[11px] font-bold hover:bg-stone-50 active:scale-95 transition-all"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => cancelBooking(b.id)}
                    className="flex-1 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50/40 text-[11px] font-bold hover:bg-red-50 active:scale-95 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          /* Past Bookings */
          pastBookings.length === 0 ? (
            <div className="text-center py-14 text-stone-400 text-xs">
              No booking history yet.
            </div>
          ) : (
            pastBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-2.5"
              >
                <div className="flex justify-between items-center pb-1.5 border-b border-stone-100">
                  <span className="text-[10px] font-bold text-stone-400">ID: {b.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-stone-900 text-xs">{b.salonName}</h3>
                  <p className="text-[10.5px] text-stone-500 mt-0.5">{b.date} at {b.time} • ₹{b.finalPaid}</p>
                </div>

                {b.userRating && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-1.5 flex items-center gap-1.5 text-[11px] text-amber-900">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="font-bold">{b.userRating}/5 Stars</span>
                    {b.userReview && <span className="text-stone-600 truncate">• {b.userReview}</span>}
                  </div>
                )}

                <div className="pt-2 border-t border-stone-100 flex gap-2">
                  <button
                    onClick={() => navigate('/customer')}
                    className="flex-1 py-1.5 rounded-lg bg-brand-maroon text-white text-[11px] font-bold active:scale-95 transition-all flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Rebook</span>
                  </button>
                  {b.status === 'Completed' && (
                    <button
                      onClick={() => setSelectedBookingForReview(b)}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-700 text-[11px] font-bold hover:bg-stone-50 active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      <span>{b.userRating ? 'Edit Review' : 'Rate'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )
        )}
      </main>

      <BottomNav />

      <RateReviewModal
        isOpen={Boolean(selectedBookingForReview)}
        onClose={() => setSelectedBookingForReview(null)}
        booking={selectedBookingForReview}
      />
    </motion.div>
  );
};
