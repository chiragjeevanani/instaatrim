import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { HelpCircle, Send, X, ShieldAlert, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SalonSupportModal = ({ isOpen, onClose }) => {
  const { createSupportTicket } = useSalon();

  const [category, setCategory] = useState('Payout & Billing');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories = [
    'Payout & Billing',
    'Booking Issue / No-Show',
    'Menu & Service Edits',
    'KYC & Account Verification',
    'Emergency Technical Support'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    await createSupportTicket(subject.trim(), category, message.trim());
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4 text-xs relative"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-brand-maroon flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">Partner Help Desk</h3>
              <p className="text-[10px] text-stone-500">Submit ticket directly to Admin HQ</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-stone-600 font-semibold mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 outline-none focus:border-brand-maroon"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-600 font-semibold mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Discrepancy in weekly settlement calculation"
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 outline-none focus:border-brand-maroon"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-semibold mb-1">Message Details</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or query for the InstaaTrim support desk..."
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 outline-none focus:border-brand-maroon"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-brand-maroon hover:bg-brand-darkMaroon text-white font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
