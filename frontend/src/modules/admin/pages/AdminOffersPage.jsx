import React, { useState } from 'react';
import { Tag, CheckCircle2, XCircle, Clock, Search, AlertCircle, Percent } from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminOffersPage = () => {
  const { offers, salons, approveOffer, rejectOffer } = useAdmin();

  const [tab, setTab] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [search, setSearch] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingOfferId, setRejectingOfferId] = useState(null);

  const filteredOffers = offers.filter((o) => {
    const salon = salons.find((s) => s.id === o.salonId);
    const matchesSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.description?.toLowerCase().includes(search.toLowerCase()) ||
      salon?.name.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (tab === 'pending') return o.approvalStatus === 'pending';
    if (tab === 'approved') return o.approvalStatus === 'approved';
    if (tab === 'rejected') return o.approvalStatus === 'rejected';
    return true;
  });

  const handleOpenReject = (offerId) => {
    setRejectingOfferId(offerId);
    setRejectReason('');
  };

  const handleConfirmReject = () => {
    if (rejectingOfferId) {
      rejectOffer(rejectingOfferId, rejectReason || 'Discount threshold violates platform pricing policy');
      setRejectingOfferId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      <AdminTopBar
        title="Salon Offers & Yield Promotions"
        subtitle="Approve or decline salon-created promotions before they appear in the customer marketplace"
      />

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {/* Navigation / Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search offers or salons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#14141e] border border-[#262638] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#14141e] border border-[#262638] rounded-xl text-xs">
            {[
              { id: 'pending', label: 'Pending Approval' },
              { id: 'approved', label: 'Approved Live' },
              { id: 'rejected', label: 'Declined' },
              { id: 'all', label: 'All Deals' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  tab === t.id ? 'bg-purple-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffers.map((offer) => {
            const salon = salons.find((s) => s.id === offer.salonId);
            const isPending = offer.approvalStatus === 'pending';
            const isApproved = offer.approvalStatus === 'approved';
            const isRejected = offer.approvalStatus === 'rejected';

            return (
              <div
                key={offer.id}
                className="bg-[#14141e] border border-[#262638] rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/30 transition-all shadow-md"
              >
                <div>
                  {/* Top tag & salon */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                        {salon?.name || offer.salonId}
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">{offer.title}</h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        isApproved
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : isPending
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'bg-red-500/15 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {offer.approvalStatus || 'pending'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 mb-4">{offer.description}</p>

                  {/* Details box */}
                  <div className="bg-[#1b1b26] border border-[#242433] rounded-xl p-3 space-y-2 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Discount Offered</span>
                      <span className="text-white font-bold text-purple-300">{offer.discount}</span>
                    </div>
                    {offer.applicableDays && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">Applicable Days</span>
                        <span className="text-stone-200">{offer.applicableDays.join(', ')}</span>
                      </div>
                    )}
                    {offer.timeWindow && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">Time Window</span>
                        <span className="text-stone-200">{offer.timeWindow}</span>
                      </div>
                    )}
                    {offer.minOrderValue && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">Min Order</span>
                        <span className="text-stone-200">₹{offer.minOrderValue}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-stone-400">Redeemed Count</span>
                      <span className="text-emerald-400 font-semibold">{offer.redeemedCount || 0} times</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#232333] flex items-center justify-end gap-2">
                  {isPending && (
                    <>
                      <button
                        onClick={() => approveOffer(offer.id)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Approve Live
                      </button>
                      <button
                        onClick={() => handleOpenReject(offer.id)}
                        className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {isApproved && (
                    <button
                      onClick={() => handleOpenReject(offer.id)}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      Revoke Live Status
                    </button>
                  )}
                  {isRejected && (
                    <button
                      onClick={() => approveOffer(offer.id)}
                      className="px-3 py-1.5 bg-emerald-800/50 hover:bg-emerald-700/50 text-emerald-200 border border-emerald-700/60 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Re-approve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-16 bg-[#14141e] border border-[#262638] rounded-2xl">
            <Tag className="w-8 h-8 text-stone-600 mx-auto mb-2" />
            <p className="text-sm text-stone-400">No offers found in this category.</p>
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectingOfferId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141e] border border-[#262638] rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Decline Salon Offer</h3>
            <p className="text-xs text-stone-400">
              Provide feedback to the salon partner explaining why this promotional offer was declined.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Non-peak discount too aggressive or conflicts with platform event..."
              className="w-full bg-[#0d0d14] border border-[#2d2d40] rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingOfferId(null)}
                className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Decline Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
