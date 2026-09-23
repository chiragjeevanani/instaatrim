import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import {
  ArrowLeft,
  Star,
  MessageSquare,
  Send,
  CheckCircle,
  ThumbsUp,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export const SalonReviewsPage = () => {
  const navigate = useNavigate();
  const { salonProfile, reviews = [], replyReview } = useSalon();

  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleOpenReply = (review) => {
    setActiveReplyId(review.id);
    setReplyText(review.reply || '');
  };

  const handleSendReply = (reviewId) => {
    if (!replyText.trim()) return;
    replyReview(reviewId, replyText.trim());
    setActiveReplyId(null);
    setReplyText('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-[480px] min-w-0 bg-[#faf7fc] font-sans text-stone-900 antialiased min-h-screen pb-24 mx-auto flex flex-col justify-between overflow-x-hidden box-border shadow-md"
    >
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#faf7fc]/95 backdrop-blur-md px-4 py-3 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/salon/profile')}
            className="p-1 rounded-full text-stone-700 hover:bg-stone-200 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-stone-900 leading-tight">Customer Reviews</h1>
            <p className="text-[10px] text-stone-500">{salonProfile.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span className="text-xs font-bold text-amber-900">{salonProfile.rating || 4.8}</span>
        </div>
      </header>

      <main className="p-4 flex-1 space-y-4">
        {/* Rating Overview Card */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-3xl font-extrabold text-stone-900">{salonProfile.rating || 4.8}</span>
            <div className="flex items-center gap-1 mt-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-[10px] text-stone-500 mt-1">Based on {reviews.length} customer ratings</p>
          </div>

          <div className="text-right space-y-1 text-[11px] text-stone-500">
            <div className="flex items-center gap-1.5 justify-end">
              <span>Verified Bookings</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-[10px] text-purple-700 font-semibold">
              Instant feedback sync with Admin
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/80 text-stone-400 text-xs">
              No customer reviews yet.
            </div>
          ) : (
            reviews.map((r) => {
              const isReplying = activeReplyId === r.id;

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900 block">{r.customerName}</span>
                      {r.service && (
                        <span className="text-[10px] text-stone-500 font-medium">{r.service}</span>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-0.5 justify-end text-amber-500">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3 h-3 ${
                              idx < r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[9.5px] text-stone-400">{r.date || 'Recent'}</span>
                    </div>
                  </div>

                  <p className="text-stone-700 leading-relaxed text-[11px]">{r.comment}</p>

                  {/* Existing Owner Reply */}
                  {r.reply && !isReplying && (
                    <div className="bg-purple-50/70 rounded-xl p-2.5 border border-purple-100/80 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-brand-maroon">
                        <span>Salon Response:</span>
                        <button
                          onClick={() => handleOpenReply(r)}
                          className="text-[9.5px] text-purple-700 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-stone-600 text-[10.5px] leading-snug">{r.reply}</p>
                    </div>
                  )}

                  {/* Reply Input Box */}
                  {isReplying ? (
                    <div className="pt-2 border-t border-stone-100 space-y-2">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a polite response to this customer..."
                        className="w-full p-2 rounded-xl border border-stone-300 text-xs text-stone-900 outline-none focus:border-brand-maroon"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveReplyId(null)}
                          className="px-3 py-1 rounded-lg text-stone-500 hover:text-stone-800 text-[11px] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReply(r.id)}
                          className="px-3 py-1 bg-brand-maroon text-white font-bold text-[11px] rounded-lg shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Post Reply</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    !r.reply && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => handleOpenReply(r)}
                          className="flex items-center gap-1 text-[11px] font-bold text-brand-maroon hover:text-brand-darkMaroon cursor-pointer"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Reply to Customer</span>
                        </button>
                      </div>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </motion.div>
  );
};
