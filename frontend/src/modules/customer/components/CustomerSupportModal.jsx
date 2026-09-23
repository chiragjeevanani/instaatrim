import React, { useState } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { HelpCircle, Send, X, ShieldAlert, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CustomerSupportModal = ({ isOpen, onClose }) => {
  const { createSupportTicket } = useCustomer();

  const [category, setCategory] = useState('Booking & Rescheduling');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const categories = [
    'Booking & Rescheduling',
    'Payment & Refund Dispute',
    'Salon Experience & Hygiene',
    'Elite Membership Inquiry',
    'App / Technical Support'
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
              <h3 className="font-bold text-sm text-stone-900">InstaaTrim Support Desk</h3>
              <p className="text-[10px] text-stone-500">Fast assistance &amp; dispute resolution</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-stone-600 font-semibold mb-1">Topic</label>
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
                placeholder="e.g. Refund inquiry for cancelled haircut"
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
                placeholder="Please describe how we can assist you..."
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 outline-none focus:border-brand-maroon"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-brand-maroon hover:bg-brand-darkMaroon text-white font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending Request...' : 'Send to Support'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
