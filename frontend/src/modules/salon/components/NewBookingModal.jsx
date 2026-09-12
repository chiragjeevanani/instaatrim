import React, { useState, useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Scissors, Check, Sparkles } from 'lucide-react';

export const NewBookingModal = ({ isOpen, onClose }) => {
  const { services, createWalkInBooking, openModal, closeModal } = useSalon();

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

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [chairNumber, setChairNumber] = useState('Chair 1 (Pooja)');
  const [paymentMethod, setPaymentMethod] = useState('Pay at Salon (Cash)');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const serviceObj = services.find((s) => s.id === selectedServiceId) || services[0];
    createWalkInBooking({
      customerName: customerName || 'Walk-In Guest',
      customerPhone: customerPhone || '+91 98000 00000',
      chairNumber,
      services: [serviceObj],
      totalAmount: serviceObj.price,
      paymentMethod,
      notes
    });
    onClose();
  };

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
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center border border-stone-200/60">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 stroke-[2]" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-xs sm:text-sm">New Walk-In Booking</h3>
                <p className="text-[10px] text-stone-400 font-normal">Add offline guest to prevent double booking</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors">
              <X className="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto">
            {/* Guest Name & Phone */}
            <div className="space-y-2.5">
              <div>
                <label className="text-[10.5px] font-bold text-stone-700 block mb-1">Customer Name</label>
                <div className="flex items-center bg-white rounded-xl border border-stone-200 px-3 py-2 focus-within:border-rose-900 focus-within:ring-1 focus-within:ring-rose-900 shadow-2xs">
                  <User className="w-3.5 h-3.5 text-stone-400 mr-2 shrink-0 stroke-[2]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Kapoor"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs text-stone-800 outline-none bg-transparent font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-stone-700 block mb-1">Phone Number</label>
                <div className="flex items-center bg-white rounded-xl border border-stone-200 px-3 py-2 focus-within:border-rose-900 focus-within:ring-1 focus-within:ring-rose-900 shadow-2xs">
                  <Phone className="w-3.5 h-3.5 text-stone-400 mr-2 shrink-0 stroke-[2]" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 98260 12345"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full text-xs text-stone-800 outline-none bg-transparent font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Service Selection */}
            <div>
              <label className="text-[10.5px] font-bold text-stone-700 block mb-1">Select Service</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full bg-white text-stone-800 text-xs rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-rose-900 focus:ring-1 focus:ring-rose-900 font-medium shadow-2xs cursor-pointer"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (₹{s.price} • {s.duration})
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned Chair / Stylist */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10.5px] font-bold text-stone-700 block mb-1">Station / Chair</label>
                <select
                  value={chairNumber}
                  onChange={(e) => setChairNumber(e.target.value)}
                  className="w-full bg-white text-stone-800 text-xs rounded-xl border border-stone-200 px-2.5 py-2 outline-none font-medium shadow-2xs cursor-pointer"
                >
                  <option value="Chair 1 (Pooja)">Chair 1 (Pooja)</option>
                  <option value="Chair 2 (Kavita)">Chair 2 (Kavita)</option>
                  <option value="Chair 3 (Meena)">Chair 3 (Meena)</option>
                  <option value="Chair 4 (Express)">Chair 4 (Express)</option>
                </select>
              </div>

              <div>
                <label className="text-[10.5px] font-bold text-stone-700 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-white text-stone-800 text-xs rounded-xl border border-stone-200 px-2.5 py-2 outline-none font-medium shadow-2xs cursor-pointer"
                >
                  <option value="Pay at Salon (Cash)">Cash at Salon</option>
                  <option value="UPI QR (Counter)">UPI Counter QR</option>
                  <option value="Card Machine (POS)">POS Card Machine</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10.5px] font-bold text-stone-700 block mb-1">Notes / Preferences (Optional)</label>
              <textarea
                rows={2}
                placeholder="Special instructions, skin sensitivities, or specific staff request..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white text-xs text-stone-800 rounded-xl border border-stone-200 p-2.5 outline-none focus:border-rose-900 resize-none font-normal shadow-2xs"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-rose-900 hover:bg-rose-950 active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Confirm &amp; Seat Guest</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
