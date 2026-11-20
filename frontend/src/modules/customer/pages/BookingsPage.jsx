import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { BottomNav } from '../components/BottomNav';
import { RateReviewModal } from '../components/RateReviewModal';
import { RescheduleModal } from '../components/RescheduleModal';
import { BOOKING_STATUS, STATUS_META, toneClasses, isUpcoming } from '../../../shared/lib/bookingStatus';
import { formatDateKeyFriendly } from '../../../shared/lib/time';
import { Calendar, Clock, MapPin, Star, RotateCcw, Check, Sparkles } from 'lucide-react';
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

// Service line priced exactly like the cart (new bookings); older bookings show the saved price.
const ServiceLines = ({ b }) => {
  const shown = b.billBreakdown?.items || [];
  if (!b.services?.length) return null;
  return (
    <div className="space-y-1">
      {b.services.map((item, i) => {
        const s = shown.find((x) => x.id && x.id === item.id) || shown[i] || null;
        return (
          <div key={i} className="text-[11px] text-stone-700">
            <div className="flex justify-between gap-2">
              <span className="min-w-0">{item.name || item.title}{(item.quantity || 1) > 1 ? ` × ${item.quantity}` : ''}</span>
              <span className="shrink-0 flex items-baseline gap-1">
                <span className="font-bold">₹{s ? s.price : item.price}</span>
                {s && Number(s.cutPrice) > Number(s.price) && <span className="text-[10px] text-stone-400 line-through">₹{s.cutPrice}</span>}
                {s?.discountLabel && <span className="text-[9px] font-bold text-emerald-700">{s.discountLabel}</span>}
              </span>
            </div>
            {s && Number(s.offerSavings) > 0 && (
              <p className="text-[9.5px] text-amber-700 font-semibold">
                ₹{s.offerSavings} off now + ₹{Number(s.offerCashback) || 0} in wallet after service
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Same Bill Breakdown rows as the cart, read from the saved booking.
// New bookings carry `billBreakdown` (cart snapshot); older ones fall back to the saved amounts.
const BookingBill = ({ b }) => {
  const n = (v) => Number(v) || 0;
  const bb = b.billBreakdown || null;
  const total = n(b.totalAmount);
  const coupon = Math.round(n(b.discountAmount));
  const instant = n(b.instantDiscount);
  const wallet = n(b.walletRedeemed);
  const stylistFee = n(b.stylistFee);
  const paid = n(b.finalPaid ?? b.totalAmount);
  const cashback = n(b.walletCashback);
  const free = <span className="text-emerald-600 font-bold">FREE</span>;
  const cancelled = b.status === 'Cancelled' || b.status === 'No-Show' || b.status === 'No Show';

  const rows = [];
  if (bb) {
    rows.push({ label: 'Item Total', value: `₹${n(bb.itemTotal)}` });
    if (n(bb.offerInstantDiscount) > 0) rows.push({ label: 'Instant Discount (50% of offer)', value: `-₹${n(bb.offerInstantDiscount)}`, green: true });
    if (instant > 0) rows.push({ label: `Instant Discount${n(bb.instantDiscountPercent) > 0 ? ` (${n(bb.instantDiscountPercent)}%)` : ''}`, value: `-₹${instant}`, green: true });
    if (wallet > 0) rows.push({ label: `Wallet Redeemed${n(bb.walletRedeemPercent) > 0 ? ` (${n(bb.walletRedeemPercent)}% of balance)` : ''}`, value: `-₹${wallet}`, green: true });
    if (coupon > 0) rows.push({ label: `Coupon Savings${b.couponApplied ? ` (${b.couponApplied})` : ''}`, value: `-₹${coupon}`, green: true });
    rows.push({ label: 'Safety & Hygiene Kit', value: n(bb.safetyHygieneFee) > 0 ? `₹${n(bb.safetyHygieneFee)}` : free });
    if (stylistFee > 0) rows.push({ label: `Stylist Fee${b.staffName ? ` (${b.staffName})` : ''}`, value: `₹${stylistFee}` });
    rows.push({ label: 'Platform Convenience Fee', value: n(bb.convenienceFee) > 0 ? `₹${n(bb.convenienceFee)}` : free });
    rows.push({ label: `Taxes & GST (${n(bb.taxRatePercent)}%)`, value: `₹${n(bb.taxAmount)}` });
  } else {
    // older booking: only the saved totals are known → fees & taxes shown together
    const taxesFees = Math.max(0, Math.round(paid - (total - coupon - instant - wallet + stylistFee)));
    rows.push({ label: 'Item Total', value: `₹${total}` });
    if (instant > 0) rows.push({ label: 'Instant Discount', value: `-₹${instant}`, green: true });
    if (wallet > 0) rows.push({ label: 'Wallet Redeemed', value: `-₹${wallet}`, green: true });
    if (coupon > 0) rows.push({ label: `Coupon Savings${b.couponApplied ? ` (${b.couponApplied})` : ''}`, value: `-₹${coupon}`, green: true });
    if (stylistFee > 0) rows.push({ label: `Stylist Fee${b.staffName ? ` (${b.staffName})` : ''}`, value: `₹${stylistFee}` });
    if (taxesFees > 0) rows.push({ label: 'Taxes & fees', value: `₹${taxesFees}` });
  }

  const offerCb = bb ? n(bb.offerWalletCashback) : 0;
  return (
    <div className="pt-2 border-t border-stone-100 space-y-1">
      <h5 className="text-[11px] font-bold text-stone-800">Bill Breakdown</h5>
      {rows.map((r) => (
        <div key={r.label} className={`flex justify-between gap-2 text-[11px] ${r.green ? 'text-emerald-600 font-medium' : 'text-stone-600'}`}>
          <span className="min-w-0">{r.label}</span>
          <span className="shrink-0">{r.value}</span>
        </div>
      ))}
      <div className="border-t border-stone-200 pt-1 flex justify-between font-black text-xs text-stone-900">
        <span>{cancelled ? 'Total' : /salon|cod/i.test(b.paymentMethod || '') && b.status !== 'Completed' ? 'To Pay at Salon' : 'Total Paid'}</span>
        <span>₹{paid}</span>
      </div>
      {cashback > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2 text-[10.5px] text-amber-900 space-y-0.5">
          <div className="flex justify-between gap-2 font-bold">
            <span className="min-w-0">
              Wallet Cashback{' '}
              {b.cashbackCredited ? '(credited ✓)' : cancelled ? '(not applicable — booking cancelled)' : '(after service)'}
            </span>
            <span className="shrink-0 text-amber-700">+₹{cashback}</span>
          </div>
          {offerCb > 0 && (
            <>
              <div className="flex justify-between text-amber-800"><span>• Offer cashback (50% of offer)</span><span>₹{offerCb}</span></div>
              {cashback - offerCb > 0 && (
                <div className="flex justify-between text-amber-800">
                  <span>• DrimStyle cashback{n(bb.walletCashbackPercent) > 0 ? ` (${n(bb.walletCashbackPercent)}% of bill)` : ''}</span>
                  <span>₹{cashback - offerCb}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
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
    <div
      className="w-full max-w-[480px] min-w-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] min-h-screen pb-20 mx-auto border-x border-purple-200/50 lg:max-w-5xl lg:px-6 lg:bg-none lg:min-h-0 lg:pb-12 lg:border-x-0 flex flex-col justify-between overflow-x-hidden box-border"
    >
      {/* Header */}
      <header className="sticky top-0 lg:static z-30 bg-[#f8f4fb]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none lg:px-0 lg:pt-8 lg:pb-5 lg:border-0 px-4 pt-3.5 pb-3 border-b border-purple-100">
        <h1 className="text-lg lg:text-[26px] font-bold text-stone-900 tracking-tight">My Bookings</h1>
        <p className="text-xs lg:text-[13px] text-stone-500">Manage appointments or view history</p>

        {/* Tab Switcher - Compact */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#eaddf3] border border-purple-200/50 p-1 rounded-xl mt-2 lg:mt-5 lg:max-w-sm">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'upcoming' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'history' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            History ({pastBookings.length})
          </button>
        </div>
      </header>

      {/* Bookings List */}
      <main className="p-4 lg:p-0 flex-1 space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-5 lg:content-start">
        {activeTab === 'upcoming' ? (
          upcomingBookings.length === 0 ? (
            <div className="text-center py-14 lg:col-span-2">
              <Calendar className="w-10 h-10 text-stone-400 mx-auto mb-1.5" />
              <h3 className="font-bold text-xs text-stone-700">No upcoming appointments</h3>
              <p className="text-[11px] text-stone-500 mt-0.5">Ready for a pampering session?</p>
              <button
                onClick={() => navigate('/customer')}
                className="mt-4 px-5 py-2.5 bg-brand-maroon text-white font-bold text-[13px] rounded-xl shadow-xs"
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
                  <ServiceLines b={b} />

                  {b.preferredProduct && (
                    <div className="flex items-center gap-1.5 text-[10px] text-purple-900 bg-purple-50 px-2 py-1 rounded-lg border border-purple-200/50">
                      <Sparkles className="w-3 h-3 text-brand-maroon shrink-0" />
                      <span className="truncate">Treatment formulation: <strong className="text-brand-maroon">{b.preferredProduct}</strong></span>
                    </div>
                  )}

                  <BookingBill b={b} />

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

                  {/* Services */}
                  <ServiceLines b={b} />

                  <BookingBill b={b} />

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
    </div>
  );
};
