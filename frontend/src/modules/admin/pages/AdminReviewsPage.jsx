import React, { useState } from 'react';
import { Star, Flag, Trash2, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminReviewsPage = () => {
  const { reviews, salons, flagReview, unflagReview, deleteReview } = useAdmin();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'flagged' | 'low'

  const filteredReviews = reviews.filter((r) => {
    const salon = salons.find((s) => s.id === r.salonId);
    const matchesSearch =
      r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      salon?.name.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'flagged') return r.isFlagged;
    if (filter === 'low') return r.rating <= 3;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      <AdminTopBar
        title="Customer Ratings & Reviews Audit"
        subtitle="Moderate platform reviews, investigate flagged feedback and maintain ratings integrity"
      />

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviews or customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#14141e] border border-[#262638] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#14141e] border border-[#262638] rounded-xl text-xs">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: 'flagged', label: 'Flagged Content' },
              { id: 'low', label: 'Low Ratings (≤ 3★)' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filter === f.id ? 'bg-purple-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredReviews.map((r) => {
            const salon = salons.find((s) => s.id === r.salonId);

            return (
              <div
                key={r.id}
                className={`p-5 rounded-2xl bg-[#14141e] border transition-all ${
                  r.isFlagged ? 'border-red-900/60 bg-red-950/10' : 'border-[#262638]'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{r.customerName}</span>
                      <span className="text-stone-500 text-xs">• for</span>
                      <span className="font-semibold text-purple-300 text-xs">{salon?.name || r.salonId}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Service: {r.service || 'Salon Service'} • {r.date}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Stars */}
                    <div className="flex items-center gap-1 bg-[#1b1b26] px-2.5 py-1 rounded-lg border border-[#2c2c40]">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-white">{r.rating}.0</span>
                    </div>

                    {r.isFlagged && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Flagged: {r.flagReason || 'Audit needed'}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-stone-200 bg-[#191924] p-3 rounded-xl border border-[#232333]">
                  "{r.comment}"
                </p>

                {r.reply && (
                  <div className="mt-2 pl-4 border-l-2 border-purple-500/50 text-[11px] text-stone-400">
                    <span className="font-semibold text-purple-300">Partner Reply:</span> {r.reply}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-[#232333] flex justify-end gap-2">
                  {r.isFlagged ? (
                    <button
                      onClick={() => unflagReview(r.id)}
                      className="px-3 py-1 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Clear Flag
                    </button>
                  ) : (
                    <button
                      onClick={() => flagReview(r.id, 'Policy violation suspected')}
                      className="px-3 py-1 bg-[#1f1f2e] hover:bg-amber-950/40 text-stone-400 hover:text-amber-300 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Flag Review
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(r.id)}
                    className="px-3 py-1 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/50 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Delete Content
                  </button>
                </div>
              </div>
            );
          })}

          {filteredReviews.length === 0 && (
            <div className="text-center py-16 bg-[#14141e] border border-[#262638] rounded-2xl">
              <Star className="w-8 h-8 text-stone-600 mx-auto mb-2" />
              <p className="text-sm text-stone-400">No reviews found matching filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
