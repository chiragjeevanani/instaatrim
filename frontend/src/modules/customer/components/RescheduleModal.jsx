import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { useCustomer } from '../context/CustomerContext';
import { getDaySlots } from '../../../shared/lib/availability';
import { rollingDays, parseDurationToMinutes } from '../../../shared/lib/time';

// Defect D5 fix: rescheduling used to write a hardcoded "Sunday, 02:00 PM"
// onto every booking regardless of what was actually free. This picks a
// real slot from the same availability engine the initial booking used.
export const RescheduleModal = ({ booking, onClose }) => {
  const { state } = useAppData();
  const { rescheduleBooking } = useCustomer();
  const days = useMemo(() => rollingDays(14), []);
  const [selectedDayKey, setSelectedDayKey] = useState(days[1]?.key);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!booking) return null;

  const salon = state.salons.find((s) => s.id === booking.salonId);
  const staffList = state.staff.filter((s) => s.salonId === booking.salonId);
  const durationMinutes = (booking.services || []).reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0) || 30;
  const category = booking.services?.[0]?.category || null;
  const selectedDay = days.find((d) => d.key === selectedDayKey) || days[0];

  const { slots, reason } = useMemo(() => {
    if (!salon) return { slots: [], reason: 'Salon not found' };
    return getDaySlots({
      salon,
      staffList,
      durationMinutes,
      category,
      bookings: state.bookings.filter((b) => b.id !== booking.id),
      holds: state.holds,
      dateObj: selectedDay.date
    });
  }, [salon, staffList, durationMinutes, category, state.bookings, state.holds, selectedDay, booking.id]);

  const handleSave = async () => {
    if (!selectedSlot) return;
    setIsSaving(true);
    await rescheduleBooking(booking.id, selectedDay.key, selectedSlot.time, selectedDay.label);
    setIsSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60" />
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          className="relative w-full max-w-[420px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 z-10 space-y-3 max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Reschedule Booking</h3>
              <p className="text-[10px] text-stone-500">{booking.salonName} · {booking.id}</p>
            </div>
            <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-[10.5px] font-bold text-stone-600 mb-1 block uppercase tracking-wider">Select Day</label>
            <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto pr-0.5">
              {days.slice(0, 8).map((d) => (
                <button
                  key={d.key}
                  onClick={() => {
                    setSelectedDayKey(d.key);
                    setSelectedSlot(null);
                  }}
                  className={`py-1.5 px-1 rounded-xl text-center border transition-all ${
                    selectedDayKey === d.key ? 'border-brand-maroon bg-rose-50 text-brand-maroon font-bold' : 'border-stone-200 bg-white text-stone-700'
                  }`}
                >
                  <span className="text-[11px] font-bold block">{d.label}</span>
                  <span className="text-[9.5px] text-stone-400 block">{d.sub}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10.5px] font-bold text-stone-600 mb-1 block uppercase tracking-wider">Available Times</label>
            {slots.length === 0 ? (
              <div className="flex items-start gap-2 bg-stone-100 border border-stone-200 rounded-lg p-2.5">
                <AlertCircle className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                <p className="text-[10.5px] text-stone-600">{reason}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-1.5 px-1 text-[11px] rounded-lg font-medium text-center border flex items-center justify-center gap-1 ${
                      selectedSlot?.time === slot.time ? 'border-brand-maroon bg-brand-maroon text-white font-bold' : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    {selectedSlot?.time === slot.time && <CheckCircle2 className="w-3 h-3" />}
                    <span>{slot.time}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!selectedSlot || isSaving}
            className="w-full py-2.5 bg-brand-maroon text-white font-bold text-xs rounded-xl disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
            <span>{isSaving ? 'Saving…' : 'Confirm New Slot'}</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
