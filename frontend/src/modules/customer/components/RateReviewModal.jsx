import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Sparkles, Check } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';

export const RateReviewModal = ({ isOpen, onClose, booking }) => {
  const { rateBooking } = useCustomer();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  // Requirement Fields
  const [serviceQuality, setServiceQuality] = useState('Excellent');
  const [waitingTime, setWaitingTime] = useState('As Expected');
  const [valueForMoney, setValueForMoney] = useState('Good');
  const [bookingExperience, setBookingExperience] = useState('Easy');
  const [wouldRecommend, setWouldRecommend] = useState('Yes');
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);

    const serviceName = booking.services?.[0]?.name || 'Salon Treatment';
    const fullReviewSummary = suggestions.trim() || `Quality: ${serviceQuality}, Value: ${valueForMoney}`;

    await rateBooking(
      booking.id,
      rating,
      fullReviewSummary,
      booking.salonId,
      serviceName,
      {
        serviceQuality,
        waitingTime,
        valueForMoney,
        bookingExperience,
        wouldRecommend,
        suggestions: suggestions.trim()
      }
    );

    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-2xl p-5 z-10 space-y-4 border border-stone-200/80 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Customer Feedback</h3>
                <p className="text-[11px] text-stone-500">{booking.salonName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* 1. Overall Experience (1-5 stars) */}
            <div className="bg-stone-50/80 p-3 rounded-2xl border border-stone-100 text-center space-y-1.5">
              <label className="block text-stone-800 font-bold text-xs">
                ⭐ Overall Experience: Rate 1–5 stars
              </label>
              <div className="flex justify-center items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-[10.5px] font-semibold text-amber-700">
                {rating === 5 && 'Outstanding Experience!'}
                {rating === 4 && 'Very Good Service'}
                {rating === 3 && 'Average Experience'}
                {rating === 2 && 'Below Expectations'}
                {rating === 1 && 'Poor Experience'}
              </p>
            </div>

            {/* 2. Salon Service Quality */}
            <div className="space-y-1.5">
              <label className="block text-stone-700 font-semibold text-[11px]">
                Salon Service Quality
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['Excellent', 'Good', 'Average', 'Poor'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setServiceQuality(opt)}
                    className={`py-1.5 px-1 rounded-xl text-[10.5px] font-semibold border transition-all text-center cursor-pointer ${
                      serviceQuality === opt
                        ? 'bg-brand-maroon text-white border-brand-maroon shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Waiting Time */}
            <div className="space-y-1.5">
              <label className="block text-stone-700 font-semibold text-[11px]">
                Waiting Time
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['As Expected', 'Less Than Expected', 'More Than Expected'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setWaitingTime(opt)}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-semibold border transition-all text-center cursor-pointer ${
                      waitingTime === opt
                        ? 'bg-brand-maroon text-white border-brand-maroon shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Value for Money */}
            <div className="space-y-1.5">
              <label className="block text-stone-700 font-semibold text-[11px]">
                Value for Money
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['Excellent', 'Good', 'Average', 'Poor'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setValueForMoney(opt)}
                    className={`py-1.5 px-1 rounded-xl text-[10.5px] font-semibold border transition-all text-center cursor-pointer ${
                      valueForMoney === opt
                        ? 'bg-brand-maroon text-white border-brand-maroon shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Booking Experience */}
            <div className="space-y-1.5">
              <label className="block text-stone-700 font-semibold text-[11px]">
                Booking Experience
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Easy', 'Average', 'Difficult'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setBookingExperience(opt)}
                    className={`py-1.5 px-2 rounded-xl text-[10.5px] font-semibold border transition-all text-center cursor-pointer ${
                      bookingExperience === opt
                        ? 'bg-brand-maroon text-white border-brand-maroon shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Would You Recommend DrimStyle? */}
            <div className="space-y-1.5">
              <label className="block text-stone-700 font-semibold text-[11px]">
                Would You Recommend DrimStyle?
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Yes', 'Maybe', 'No'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setWouldRecommend(opt)}
                    className={`py-1.5 px-2 rounded-xl text-[10.5px] font-semibold border transition-all text-center cursor-pointer ${
                      wouldRecommend === opt
                        ? 'bg-brand-maroon text-white border-brand-maroon shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* 7. Suggestions: Optional text box */}
            <div className="space-y-1.5">
              <label className="block text-stone-700 font-semibold text-[11px]">
                Suggestions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Share any comments or suggestions to improve service..."
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-brand-maroon placeholder:text-stone-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Feedback...' : 'Submit Feedback'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
