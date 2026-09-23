import React, { useState } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { Star, X, Check, Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ReviewModal = ({ isOpen, onClose, booking }) => {
  const { rateBooking } = useCustomer();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Clean & Sanitized', 'Great Ambiance']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const quickTags = [
    'Clean & Sanitized',
    'Great Ambiance',
    'Friendly Staff',
    'Expert Technique',
    'Painless Service',
    'Value for Money'
  ];

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const primaryService = booking.services?.[0]?.name || 'Salon Treatment';
    const tagText = selectedTags.length > 0 ? ` [${selectedTags.join(', ')}] ` : '';
    const fullComment = `${comment.trim()}${tagText}`.trim() || 'Had a wonderful salon experience!';

    await rateBooking(booking.id, rating, fullComment, booking.salonId, primaryService);
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

          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-1">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Rate Your Experience</h3>
            <p className="text-[11px] text-stone-500 font-medium">{booking.salonName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Stars */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Quick Tags */}
            <div>
              <label className="block text-stone-600 font-semibold mb-1.5 text-center text-[11px]">
                What stood out?
              </label>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {quickTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-stone-600 font-semibold mb-1">
                Your Review (Optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share helpful feedback for other customers and the salon owner..."
                className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 outline-none focus:border-brand-maroon"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-brand-maroon hover:bg-brand-darkMaroon text-white font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting Review...' : 'Submit Rating & Review'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
