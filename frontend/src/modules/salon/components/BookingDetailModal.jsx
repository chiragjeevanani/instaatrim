import React, { useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  Calendar,
  User,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  UserX,
  CreditCard
} from 'lucide-react';
import { formatDateKeyFriendly } from '../../../shared/lib/time';
import { stationLabelFor } from '../../../shared/store/selectors';

export const BookingDetailModal = ({ booking, isOpen, onClose }) => {
  const { checkInCustomer, startService, completeService, cancelBooking, markNoShow, stations, staff, openModal, closeModal } = useSalon();

  // Prevent background scrolling and notify context when modal is open
  useEffect(() => {
    if (isOpen) {
      openModal();
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        closeModal();
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const isInstant = booking.bookingMode === 'Instant';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[440px] bg-[#fbfaf9] rounded-2xl shadow-elevated max-h-[85vh] flex flex-col z-10 overflow-hidden border border-stone-200/90"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200/80 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900 tracking-wider">
                #{booking.id}
              </span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                  isInstant
                    ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                    : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {isInstant ? <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500 stroke-[1.8]" /> : <Calendar className="w-2.5 h-2.5 stroke-[1.8]" />}
                {booking.bookingMode}
              </span>
            </div>

            <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors">
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-3.5 space-y-3 overflow-y-auto flex-1 overscroll-contain">
            {/* Status Highlight Banner */}
            <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[9.5px] font-bold text-stone-400 uppercase tracking-wider block">
                  Current Status
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    booking.status === 'Service Started'
                      ? 'bg-rose-700 animate-pulse'
                      : booking.status === 'Checked-In'
                      ? 'bg-sky-600'
                      : booking.status === 'Completed'
                      ? 'bg-emerald-600'
                      : booking.status === 'Cancelled' || booking.status === 'No Show'
                      ? 'bg-red-500'
                      : 'bg-amber-500'
                  }`} />
                  <span className="text-xs font-bold text-stone-900">{booking.status}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9.5px] font-bold text-stone-400 uppercase tracking-wider block">
                  Slot / Time
                </span>
                <span className="text-xs font-bold text-stone-900">{formatDateKeyFriendly(booking.dateKey)}, {booking.time}</span>
              </div>
            </div>

            {/* Customer Contact Card */}
            <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-xs border border-stone-200">
                    {booking.customerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 leading-tight">
                      {booking.customerName}
                    </h4>
                    <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5 font-normal">
                      <Phone className="w-2.5 h-2.5 text-stone-400 stroke-[2]" />
                      {booking.customerPhone}
                    </p>
                  </div>
                </div>

                <a
                  href={`tel:${booking.customerPhone}`}
                  className="px-2.5 py-1 bg-stone-100 text-stone-800 hover:bg-stone-200 rounded-lg text-[10px] font-semibold flex items-center gap-1 border border-stone-200 transition-colors"
                >
                  <Phone className="w-2.5 h-2.5 stroke-[2]" />
                  Call
                </a>
              </div>

              {booking.notes && (
                <div className="pt-2 border-t border-stone-100 text-[10.5px] text-stone-600 font-normal">
                  <span className="font-semibold text-stone-800">Client Note: </span>
                  {booking.notes}
                </div>
              )}
            </div>

            {/* Booked Services List */}
            <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-xs space-y-2">
              <span className="text-[9.5px] font-bold text-stone-400 uppercase tracking-wider block">
                Services Ordered
              </span>
              <div className="divide-y divide-stone-100">
                {booking.services.map((item, i) => (
                  <div key={i} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="text-[11.5px] font-bold text-stone-900">{item.name}</p>
                      <span className="text-[10px] text-stone-400 font-normal">{item.duration}</span>
                    </div>
                    <span className="text-xs font-bold text-stone-900">₹{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-900">
                <span className="font-medium text-stone-500">Total Amount</span>
                <span className="text-xs font-bold text-rose-900">₹{booking.totalAmount}</span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-stone-100 font-normal">
                <span>Payment Mode:</span>
                <span className="font-semibold text-stone-700 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-stone-400 stroke-[2]" />
                  {booking.paymentMethod} ({booking.paymentStatus})
                </span>
              </div>
            </div>

            {/* Station / Chair Assigned */}
            <div className="bg-white rounded-xl p-3 border border-stone-200/80 shadow-xs flex items-center justify-between text-xs">
              <span className="text-stone-500 font-normal text-[11px]">Assigned Station:</span>
              <span className="font-bold text-stone-900 text-xs">{stationLabelFor(booking, stations, staff)}</span>
            </div>

            {/* Operational Action Buttons (Section 24 Lifecycle) */}
            <div className="pt-1.5 space-y-2">
              {booking.status === 'Confirmed' && (
                <button
                  onClick={() => {
                    checkInCustomer(booking.id);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-[0.985] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Mark Customer Checked-In</span>
                </button>
              )}

              {booking.status === 'Checked-In' && (
                <button
                  onClick={() => {
                    startService(booking.id);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-rose-900 hover:bg-rose-950 active:scale-[0.985] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white stroke-[2]" />
                  <span>Start Service Now</span>
                </button>
              )}

              {booking.status === 'Service Started' && (
                <button
                  onClick={() => {
                    completeService(booking.id);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.985] text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Mark Completed &amp; Settle Bill</span>
                </button>
              )}

              {booking.status !== 'Completed' && booking.status !== 'Cancelled' && booking.status !== 'No Show' && (
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    onClick={() => {
                      markNoShow(booking.id);
                      onClose();
                    }}
                    className="py-2 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 font-semibold text-[10.5px] rounded-xl border border-stone-200 transition-all flex items-center justify-center gap-1"
                  >
                    <UserX className="w-3.5 h-3.5 text-stone-500 stroke-[2]" />
                    <span>Mark No-Show</span>
                  </button>

                  <button
                    onClick={() => {
                      cancelBooking(booking.id, 'Salon partner canceled appointment');
                      onClose();
                    }}
                    className="py-2 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 font-semibold text-[10.5px] rounded-xl border border-rose-200/80 transition-all flex items-center justify-center gap-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 stroke-[2]" />
                    <span>Cancel Booking</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
