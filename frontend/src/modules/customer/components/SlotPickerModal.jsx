import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomer } from '../context/CustomerContext';
import { mockAvailableSlots } from '../data/mockData';
import { X, Zap, Calendar, CheckCircle2 } from 'lucide-react';

export const SlotPickerModal = () => {
  const { isSlotPickerOpen, setIsSlotPickerOpen, bookingSlot, setBookingSlot, showToast } = useCustomer();

  const [bookingType, setBookingType] = useState(bookingSlot.type || 'Scheduled');
  const [selectedDate, setSelectedDate] = useState(bookingSlot.date || 'Tomorrow');
  const [selectedTime, setSelectedTime] = useState(bookingSlot.time || '11:00 AM');

  if (!isSlotPickerOpen) return null;

  const dates = [
    { label: 'Today', sub: '11 Sep' },
    { label: 'Tomorrow', sub: '12 Sep' },
    { label: 'Sunday', sub: '13 Sep' },
    { label: 'Monday', sub: '14 Sep' }
  ];

  const handleConfirm = () => {
    setBookingSlot({
      type: bookingType,
      date: selectedDate,
      time: selectedTime
    });
    showToast(bookingType === 'Instant' ? 'Instant booking selected!' : `Slot set to ${selectedDate}, ${selectedTime}`);
    setIsSlotPickerOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSlotPickerOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="relative w-full max-w-[420px] bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 z-10 space-y-3 border-t sm:border border-purple-200/80"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Choose Appointment Slot</h3>
              <p className="text-[10px] text-stone-500">Pick Instant Booking or Schedule for later</p>
            </div>
            <button
              onClick={() => setIsSlotPickerOpen(false)}
              className="p-1 rounded-full text-stone-500 hover:text-stone-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher Pills */}
          <div className="grid grid-cols-2 gap-1.5 bg-[#eaddf3] border border-purple-200/50 p-1 rounded-xl">
            <button
              onClick={() => setBookingType('Scheduled')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
                bookingType === 'Scheduled'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Scheduled Slot</span>
            </button>

            <button
              onClick={() => setBookingType('Instant')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
                bookingType === 'Instant'
                  ? 'bg-brand-maroon text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Instant / Book Now</span>
            </button>
          </div>

          {bookingType === 'Instant' ? (
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-center space-y-1.5">
              <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                <Zap className="w-4 h-4 fill-amber-500" />
              </div>
              <h4 className="font-bold text-amber-950 text-xs">Real-Time Express Booking</h4>
              <p className="text-[10.5px] text-amber-800 leading-relaxed max-w-[260px] mx-auto">
                Next verified professional is <span className="font-bold">available in 15 mins</span>. Immediate confirmation!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Date Selector */}
              <div>
                <label className="text-[10.5px] font-bold text-stone-600 mb-1 block uppercase tracking-wider">Select Day</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {dates.map((d) => (
                    <button
                      key={d.label}
                      onClick={() => setSelectedDate(d.label)}
                      className={`py-1.5 px-1 rounded-xl text-center border transition-all ${
                        selectedDate === d.label
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

              {/* Time Slots */}
              <div>
                <label className="text-[10.5px] font-bold text-stone-600 mb-1 block uppercase tracking-wider">Available Time Slots</label>
                <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {mockAvailableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-1.5 px-1 text-[11px] rounded-lg font-medium text-center border transition-all flex items-center justify-center gap-1 ${
                        selectedTime === slot
                          ? 'border-brand-maroon bg-brand-maroon text-white font-bold shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {selectedTime === slot && <CheckCircle2 className="w-3 h-3" />}
                      <span>{slot}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full py-2.5 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Confirm Slot
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
