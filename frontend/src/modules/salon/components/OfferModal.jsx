import React, { useState, useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Percent, IndianRupee, Check, Clock, Calendar } from 'lucide-react';

export const OfferModal = ({ isOpen, onClose }) => {
  const { addOffer, openModal, closeModal } = useSalon();

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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(25);
  const [timeWindow, setTimeWindow] = useState('01:00 PM - 04:00 PM');
  const [selectedDays, setSelectedDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday']);
  const [minOrderValue, setMinOrderValue] = useState(799);

  if (!isOpen) return null;

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const discountText = discountType === 'percentage' ? `${discountValue}% OFF` : `₹${discountValue} Flat OFF`;
    addOffer({
      title: title || 'Non-Peak Hours Discount',
      description: description || `Special dynamic pricing for ${timeWindow} slots.`,
      discount: discountText,
      discountType,
      discountValue: Number(discountValue),
      applicableDays: selectedDays,
      timeWindow,
      minOrderValue: Number(minOrderValue)
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[440px] bg-[#fbfaf9] rounded-2xl shadow-elevated max-h-[85vh] flex flex-col z-10 overflow-hidden border border-stone-200/90"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-200/60">
                <Tag className="w-3.5 h-3.5 text-amber-600 stroke-[2]" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-xs sm:text-sm">Create Flash Offer</h3>
                <p className="text-[10px] text-stone-400 font-normal">Target empty chairs during low-demand hours</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors">
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1 overscroll-contain">
            {/* Offer Title */}
            <div>
              <label className="text-[10.5px] font-bold text-stone-700 block mb-1">Deal Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Afternoon Glow Happy Hours"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white text-xs text-stone-800 rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-rose-900 focus:ring-1 focus:ring-rose-900 font-medium shadow-2xs"
              />
            </div>

            {/* Discount Configuration */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10.5px] font-bold text-stone-700 block mb-1">Discount Type</label>
                <div className="grid grid-cols-2 gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`py-1 text-[10.5px] font-bold rounded-lg transition-all ${
                      discountType === 'percentage' ? 'bg-white text-rose-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    % Off
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('flat')}
                    className={`py-1 text-[10.5px] font-bold rounded-lg transition-all ${
                      discountType === 'flat' ? 'bg-white text-rose-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    ₹ Flat
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-stone-700 block mb-1">
                  Discount {discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  max={discountType === 'percentage' ? 90 : 2000}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full bg-white text-xs text-stone-800 rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-rose-900 focus:ring-1 focus:ring-rose-900 font-medium shadow-2xs"
                />
              </div>
            </div>

            {/* Non-Peak Hours Window */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10.5px] font-bold text-stone-700 block mb-1">Time Slot Window</label>
                <select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  className="w-full bg-white text-stone-800 text-xs rounded-xl border border-stone-200 px-2.5 py-2 outline-none font-medium shadow-2xs cursor-pointer"
                >
                  <option value="01:00 PM - 04:00 PM">1 PM - 4 PM (Afternoon Non-Peak)</option>
                  <option value="12:00 PM - 03:00 PM">12 PM - 3 PM (Mid-Day)</option>
                  <option value="09:30 AM - 11:30 AM">9:30 AM - 11:30 AM (Early Bird)</option>
                  <option value="07:00 PM - 08:30 PM">7 PM - 8:30 PM (Evening Closing)</option>
                </select>
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-stone-700 block mb-1">Min. Bill Value (₹)</label>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="w-full bg-white text-xs text-stone-800 rounded-xl border border-stone-200 px-3 py-2 outline-none font-medium shadow-2xs"
                />
              </div>
            </div>

            {/* Applicable Days Selector */}
            <div>
              <label className="text-[10.5px] font-bold text-stone-700 block mb-1.5">Applicable Days</label>
              <div className="flex flex-wrap gap-1.5">
                {daysList.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-rose-900 text-white border-rose-900 shadow-2xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10.5px] font-bold text-stone-700 block mb-1">Customer Promo Note</label>
              <textarea
                rows={2}
                placeholder="e.g. Valid only on appointments booked within this specific time slot to fill empty afternoon stations."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white text-xs text-stone-800 rounded-xl border border-stone-200 p-2.5 outline-none resize-none font-normal shadow-2xs"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 bg-rose-900 hover:bg-rose-950 active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Launch Flash Offer</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
