import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';

export const RateReviewModal = ({ isOpen, onClose, booking }) => {
  const { rateBooking } = useCustomer();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  if (!isOpen || !booking) return null;

  const quickTags = [
    'Super Hygienic',
    'Polite Staff',
    'Painless Waxing',
    'Great Ambience',
    'Value for Money',
    'Prompt Service'
  ];

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    const fullReview = selectedTags.length > 0
      ? `${review ? review + ' ' : ''}[${selectedTags.join(', ')}]`
      : review;
    rateBooking(booking.id, rating, fullReview);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-[380px] bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] rounded-2xl shadow-2xl p-4 z-10 space-y-3 border border-purple-200/80"
        >
          <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Rate Experience</h3>
              <p className="text-[10px] text-stone-500">{booking.salonName}</p>
            </div>
            <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Star rating picker - Compact */}
          <div className="flex justify-center items-center gap-1.5 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 focus:outline-none active:scale-90 transition-transform"
              >
                <Star
                  className={`w-6 h-6 ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <span className="text-[10.5px] font-bold text-stone-700 block">What went well?</span>
            <div className="flex flex-wrap gap-1">
              {quickTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-[10.5px] px-2 py-0.5 rounded-full border transition-all ${
                      isSelected
                        ? 'bg-white border-brand-maroon text-brand-maroon font-bold shadow-xs'
                        : 'bg-white/60 border-stone-200 text-stone-700 hover:bg-white'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            rows="2"
            placeholder="Share your feedback (optional)..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full text-xs p-2 bg-white border border-stone-300/80 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-maroon placeholder:text-stone-400"
          />

          <button
            onClick={handleSubmit}
            className="w-full py-2.5 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Submit Review
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
