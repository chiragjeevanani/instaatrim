import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../context/CustomerContext';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { getDaySlots, getInstantAvailability } from '../../../shared/lib/availability';
import { acquireHold, releaseHold } from '../../../shared/lib/slotLock';
import { rollingDays, dateKey } from '../../../shared/lib/time';
import { X, Zap, Calendar, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

// SRS §9.1 / §9.2 / §9.3 fix: this used to render one hardcoded array of
// ten times identical for every salon, every service and every date, and
// "Instant" was always "available in 15 mins" regardless of whether the
// salon had instant booking on, was open, or had a free chair. Slot
// selection is now backed by the real availability engine and a slot is
// locked (not just remembered) the moment it's picked.
export const SlotPickerModal = ({ salonId: propSalonId }) => {
  const { isSlotPickerOpen, setIsSlotPickerOpen, bookingSlot, setBookingSlot, cartItems, showToast } = useCustomer();
  const { state } = useAppData();

  const salonId = propSalonId || cartItems[0]?.salonId;
  const salon = state.salons.find((s) => s.id === salonId);
  const staffList = useMemo(() => state.staff.filter((s) => s.salonId === salonId), [state.staff, salonId]);

  const durationMinutes = cartItems.reduce((sum, item) => sum + (item.durationMinutes || 30), 0) || 30;
  const category = cartItems[0]?.category || null;

  const days = useMemo(() => rollingDays(14), []);
  const [bookingType, setBookingType] = useState(bookingSlot.type || 'Scheduled');
  const [selectedDayKey, setSelectedDayKey] = useState(bookingSlot.dateKey || days[1]?.key || days[0]?.key);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingHold, setPendingHold] = useState(null);

  const selectedDay = days.find((d) => d.key === selectedDayKey) || days[0];

  const { slots: daySlots, reason: daySlotsReason } = useMemo(() => {
    if (!salon || !selectedDay) return { slots: [], reason: 'Loading…' };
    return getDaySlots({
      salon,
      staffList,
      durationMinutes,
      category,
      bookings: state.bookings,
      holds: state.holds,
      dateObj: selectedDay.date,
      excludeHoldId: pendingHold?.id
    });
  }, [salon, staffList, durationMinutes, category, state.bookings, state.holds, selectedDay, pendingHold]);

  const instantAvailability = useMemo(() => {
    if (!salon) return { state: 'unavailable', label: 'Unavailable', slot: null };
    return getInstantAvailability({
      salon,
      staffList,
      durationMinutes,
      category,
      bookings: state.bookings,
      holds: state.holds
    });
  }, [salon, staffList, durationMinutes, category, state.bookings, state.holds]);

  // Release any hold we took out if the modal closes without confirming.
  useEffect(() => {
    if (!isSlotPickerOpen && pendingHold) {
      releaseHold(pendingHold.id);
      setPendingHold(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSlotPickerOpen]);

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDayKey, bookingType]);

  if (!isSlotPickerOpen) return null;

  if (!salon) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsSlotPickerOpen(false)} />
          <div className="relative bg-white rounded-2xl p-5 text-center max-w-[300px] z-10">
            <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <p className="text-xs text-stone-700">Add a service from a salon first to pick a slot.</p>
          </div>
        </div>
      </AnimatePresence>
    );
  }

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      if (bookingType === 'Instant') {
        if (instantAvailability.state === 'unavailable' || !instantAvailability.slot) {
          showToast('Instant booking is not available right now — try a scheduled slot.');
          setIsConfirming(false);
          return;
        }
        const hold = await acquireHold({
          salonId,
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
        showToast(`Instant slot held for 8 minutes — ${instantAvailability.label}`);
      } else {
        if (!selectedSlot) {
          showToast('Pick a time slot first');
          setIsConfirming(false);
          return;
        }
        const hold = await acquireHold({
          salonId,
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
        showToast(`Slot held for 8 minutes — ${selectedDay.label}, ${selectedSlot.time}`);
      }
      setPendingHold(null); // ownership passes to bookingSlot / checkout now
      setIsSlotPickerOpen(false);
    } catch (e) {
      showToast('Could not hold this slot — please try another.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSlotPickerOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="relative w-full max-w-[420px] bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 z-10 space-y-3 border-t sm:border border-purple-200/80 max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Choose Appointment Slot</h3>
              <p className="text-[10px] text-stone-500">{salon.name} · {durationMinutes} min service</p>
            </div>
            <button onClick={() => setIsSlotPickerOpen(false)} className="p-1 rounded-full text-stone-500 hover:text-stone-800 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

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
              <span>Instant / Book Now</span>
            </button>
          </div>

          {bookingType === 'Instant' ? (
            <div
              className={`rounded-xl p-3 text-center space-y-1.5 border ${
                instantAvailability.state === 'unavailable' ? 'bg-stone-100 border-stone-200' : 'bg-amber-50 border-amber-200/80'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto ${
                  instantAvailability.state === 'unavailable' ? 'bg-stone-200 text-stone-500' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <h4 className={`font-bold text-xs ${instantAvailability.state === 'unavailable' ? 'text-stone-600' : 'text-amber-950'}`}>
                {instantAvailability.state === 'unavailable' ? 'Instant Booking Unavailable' : 'Real-Time Express Booking'}
              </h4>
              <p className={`text-[10.5px] leading-relaxed max-w-[260px] mx-auto ${instantAvailability.state === 'unavailable' ? 'text-stone-500' : 'text-amber-800'}`}>
                {instantAvailability.label}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div>
                <label className="text-[10.5px] font-bold text-stone-600 mb-1 block uppercase tracking-wider">Select Day</label>
                <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-0.5">
                  {days.slice(0, 8).map((d) => (
                    <button
                      key={d.key}
                      onClick={() => setSelectedDayKey(d.key)}
                      className={`py-1.5 px-1 rounded-xl text-center border transition-all ${
                        selectedDayKey === d.key
                          ? 'border-brand-maroon bg-white text-brand-maroon font-bold shadow-xs'
                          : 'border-stone-200 bg-white/70 text-stone-700 hover:bg-white'
                      }`}
                    >
                      <span className="text-[11px] font-bold block">{d.label}</span>
                      <span className="text-[9.5px] text-stone-400 block">{d.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-stone-600 mb-1 block uppercase tracking-wider">
                  Available Time Slots
                </label>
                {daySlots.length === 0 ? (
                  <div className="flex items-start gap-2 bg-stone-100 border border-stone-200 rounded-lg p-2.5">
                    <AlertCircle className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                    <p className="text-[10.5px] text-stone-600">{daySlotsReason}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
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

          <button
            onClick={handleConfirm}
            disabled={isConfirming || (bookingType === 'Instant' ? instantAvailability.state === 'unavailable' : !selectedSlot)}
            className="w-full py-2.5 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Holding slot…</span>
              </>
            ) : (
              <span>Confirm Slot</span>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
