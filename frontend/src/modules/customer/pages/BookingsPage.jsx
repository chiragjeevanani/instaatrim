import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { BottomNav } from '../components/BottomNav';
import { RateReviewModal } from '../components/RateReviewModal';
import { RescheduleModal } from '../components/RescheduleModal';
import { BOOKING_STATUS, STATUS_META, toneClasses, isUpcoming } from '../../../shared/lib/bookingStatus';
import { formatDateKeyFriendly } from '../../../shared/lib/time';
import { Calendar, Clock, MapPin, Star, RotateCcw, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const PROGRESSION = [
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.CHECKED_IN,
  BOOKING_STATUS.SERVICE_STARTED,
  BOOKING_STATUS.COMPLETED
];

// Defect D6 fix: the status badge and progress strip used to be static
// markup — every upcoming booking rendered the same green "Confirmed"
// badge and the same "✓ Confirmed → Checked-In → Started → Completed"
// bar regardless of the booking's actual status.
const StatusProgress = ({ status }) => {
  if (status === BOOKING_STATUS.PENDING) {
    return <p className="text-[10px] text-amber-700 font-bold pt-1.5 border-t border-stone-100">Awaiting salon confirmation</p>;
  }
  const currentIdx = PROGRESSION.indexOf(status);
  if (currentIdx === -1) return null;
  return (
    <div className="pt-1.5 border-t border-stone-100">
      <div className="flex items-center justify-between text-[9.5px] font-bold text-stone-400">
        {PROGRESSION.map((step, idx) => (
          <React.Fragment key={step}>
            {idx > 0 && <span>&rarr;</span>}
            <span className={idx <= currentIdx ? 'text-emerald-700 flex items-center gap-0.5' : ''}>
              {idx < currentIdx && <Check className="w-2.5 h-2.5" />}
              {idx === currentIdx ? `● ${STATUS_META[step].label}` : STATUS_META[step].label}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const BookingsPage = () => {
  const navigate = useNavigate();
  const { bookings, cancelBooking } = useCustomer();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [bookingToReschedule, setBookingToReschedule] = useState(null);

  const upcomingBookings = bookings.filter((b) => isUpcoming(b.status));
  const pastBookings = bookings.filter((b) => !isUpcoming(b.status));

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
              activeTab === 'upcoming' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'history' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
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
            upcomingBookings.map((b) => {
              const meta = STATUS_META[b.status] || STATUS_META[BOOKING_STATUS.CONFIRMED];
              const canModify = b.status === BOOKING_STATUS.PENDING || b.status === BOOKING_STATUS.CONFIRMED;
              return (
                <div key={b.id} className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-2.5">
                  {/* Status & ID */}
                  <div className="flex justify-between items-center pb-1.5 border-b border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400">ID: {b.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${toneClasses(meta.tone)}`}>
                      {meta.label}
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
                      <span>{formatDateKeyFriendly(b.dateKey)}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-stone-800 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-brand-maroon" />
                      <span>{b.time}</span>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="space-y-0.5">
                    {b.services?.map((item, i) => (
                      <div key={i} className="flex justify-between text-[11px] text-stone-700">
                        <span>{item.name || item.title}</span>
                        <span className="font-bold">₹{item.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Live Status Progression — now bound to the real status */}
                  <StatusProgress status={b.status} />

                  {/* Actions */}
                  {canModify && (
                    <div className="pt-2 border-t border-stone-100 flex gap-2">
                      <button
                        onClick={() => setBookingToReschedule(b)}
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
                  )}
                </div>
              );
            })
          )
        ) : (
          /* Past Bookings */
          pastBookings.length === 0 ? (
            <div className="text-center py-14 text-stone-400 text-xs">No booking history yet.</div>
          ) : (
            pastBookings.map((b) => {
              const meta = STATUS_META[b.status] || STATUS_META[BOOKING_STATUS.COMPLETED];
              return (
                <div key={b.id} className="bg-white rounded-2xl p-3 border border-stone-200 shadow-xs space-y-2.5">
                  <div className="flex justify-between items-center pb-1.5 border-b border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400">ID: {b.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${toneClasses(meta.tone)}`}>
                      {meta.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-stone-900 text-xs">{b.salonName}</h3>
                    <p className="text-[10.5px] text-stone-500 mt-0.5">{formatDateKeyFriendly(b.dateKey)} at {b.time} • ₹{b.finalPaid}</p>
                  </div>

                  {b.rating && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-1.5 flex items-center gap-1.5 text-[11px] text-amber-900">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span className="font-bold">{b.rating}/5 Stars</span>
                      {b.review && <span className="text-stone-600 truncate">• {b.review}</span>}
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
                    {b.status === BOOKING_STATUS.COMPLETED && (
                      <button
                        onClick={() => setSelectedBookingForReview(b)}
                        className="px-2.5 py-1.5 rounded-lg border border-stone-300 text-stone-700 text-[11px] font-bold hover:bg-stone-50 active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        <span>{b.rating ? 'Edit Review' : 'Rate'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )
        )}
      </main>

      <BottomNav />

      <RateReviewModal
        isOpen={Boolean(selectedBookingForReview)}
        onClose={() => setSelectedBookingForReview(null)}
        booking={selectedBookingForReview}
      />

      {bookingToReschedule && (
        <RescheduleModal booking={bookingToReschedule} onClose={() => setBookingToReschedule(null)} />
      )}
    </motion.div>
  );
};
