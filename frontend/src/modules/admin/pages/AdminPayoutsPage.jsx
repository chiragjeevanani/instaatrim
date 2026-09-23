import React, { useState, useMemo } from 'react';
import {
  Wallet,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  ArrowUpRight,
  Filter,
  Building2,
  FileText,
  Send,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminPayoutsPage = () => {
  const { payouts = [], approvePayout, rejectPayout, deletePayout, theme } = useAdmin();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'Pending' | 'Approved' | 'Transferred' | 'Rejected'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [utrInput, setUtrInput] = useState('');
  const [settlementNotes, setSettlementNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Summary Metrics
  const metrics = useMemo(() => {
    let pendingCount = 0;
    let pendingAmount = 0;
    let totalSettled = 0;
    let totalCommission = 0;

    payouts.forEach((p) => {
      totalCommission += p.commissionDeducted || 0;
      if (p.status === 'Pending') {
        pendingCount += 1;
        pendingAmount += p.netAmount || 0;
      } else if (p.status === 'Transferred') {
        totalSettled += p.netAmount || 0;
      }
    });

    return {
      pendingCount,
      pendingAmount,
      totalSettled,
      totalCommission
    };
  }, [payouts]);

  // Filtered list
  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => {
      const matchesTab = activeTab === 'all' || p.status.toLowerCase() === activeTab.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.id?.toLowerCase().includes(q) ||
        p.salonName?.toLowerCase().includes(q) ||
        p.utr?.toLowerCase().includes(q) ||
        p.bankAccount?.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [payouts, activeTab, searchQuery]);

  const handleOpenApproveModal = (p) => {
    setSelectedPayout(p);
    setActionType('approve');
    setUtrInput(`UTR${Date.now().toString().slice(-8)}`);
    setSettlementNotes('Approved via Admin Banking Console');
  };

  const handleOpenRejectModal = (p) => {
    setSelectedPayout(p);
    setActionType('reject');
    setRejectionReason('Bank account verification failed or documents pending.');
  };

  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (!selectedPayout) return;

    if (actionType === 'approve') {
      await approvePayout(selectedPayout.id, utrInput, settlementNotes);
    } else if (actionType === 'reject') {
      await rejectPayout(selectedPayout.id, rejectionReason);
    }

    setSelectedPayout(null);
    setActionType(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Transferred':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Transferred
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Sparkles className="w-3 h-3" /> Approved for Batch
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-stone-700 text-stone-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen ${isLight ? 'bg-[#f7f5f9]' : 'bg-[#0d0d12]'}`}>
      <AdminTopBar
        title="Salon Payouts & Settlement Ledger"
        subtitle="Review withdrawal requests, release bank settlements, and track commission cuts"
      />

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            className={`p-5 rounded-2xl border shadow-sm ${
              isLight ? 'bg-white border-purple-100 text-stone-900' : 'bg-[#14141e] border-[#262638] text-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              <span>Pending Payouts</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold flex items-center">
              <span>₹{metrics.pendingAmount.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[11px] text-amber-500 font-medium mt-1">
              {metrics.pendingCount} request{metrics.pendingCount === 1 ? '' : 's'} awaiting clearance
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border shadow-sm ${
              isLight ? 'bg-white border-purple-100 text-stone-900' : 'bg-[#14141e] border-[#262638] text-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              <span>Settled to Partners</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold flex items-center">
              <span>₹{metrics.totalSettled.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[11px] text-stone-400 font-medium mt-1">Direct NEFT / IMPS transfers</p>
          </div>

          <div
            className={`p-5 rounded-2xl border shadow-sm ${
              isLight ? 'bg-white border-purple-100 text-stone-900' : 'bg-[#14141e] border-[#262638] text-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              <span>Commission Retained</span>
              <IndianRupee className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold flex items-center">
              <span>₹{metrics.totalCommission.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[11px] text-purple-400 font-medium mt-1">Platform revenue share cut</p>
          </div>

          <div
            className={`p-5 rounded-2xl border shadow-sm ${
              isLight ? 'bg-white border-purple-100 text-stone-900' : 'bg-[#14141e] border-[#262638] text-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              <span>Total Transactions</span>
              <Wallet className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-2xl font-bold flex items-center">
              <span>{payouts.length}</span>
            </div>
            <p className="text-[11px] text-stone-400 font-medium mt-1">Cumulative ledger entries</p>
          </div>
        </div>

        {/* Search & Tabs Filter Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#161622] border border-[#262638] text-xs">
            {['all', 'Pending', 'Approved', 'Transferred', 'Rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {tab === 'all' ? 'All Requests' : tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search by salon, ID or UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-none transition-colors ${
                isLight
                  ? 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-purple-500'
                  : 'bg-[#14141e] border-[#28283c] text-white placeholder:text-stone-500 focus:border-purple-500'
              }`}
            />
          </div>
        </div>

        {/* Payouts Table */}
        <div
          className={`rounded-2xl border overflow-hidden shadow-sm ${
            isLight ? 'bg-white border-purple-100' : 'bg-[#14141e] border-[#262638]'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={isLight ? 'bg-stone-50 border-b border-stone-200 text-stone-600' : 'bg-[#181826] border-b border-[#262638] text-stone-400'}>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Payout ID</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Partner Salon</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Bank & IFSC</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Gross / Comm.</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Net Payable</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px]">Status / UTR</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-stone-100 text-stone-800' : 'divide-[#1e1e2d] text-stone-200'}`}>
                {filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-stone-500">
                      No payout records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((p) => {
                    const isPending = p.status === 'Pending';
                    const isTransferred = p.status === 'Transferred';

                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors ${
                          isLight ? 'hover:bg-purple-50/40' : 'hover:bg-[#1a1a28]'
                        }`}
                      >
                        <td className="p-4 font-mono font-bold text-purple-400">
                          {p.id}
                          <div className="text-[10px] text-stone-500 font-normal">
                            {new Date(p.requestedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>

                        <td className="p-4 font-medium">
                          <div className="font-bold flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <span>{p.salonName}</span>
                          </div>
                          <span className="text-[10px] text-stone-500 font-mono">ID: {p.salonId}</span>
                        </td>

                        <td className="p-4">
                          <div className="font-mono text-stone-300">{p.bankAccount}</div>
                          <div className="text-[10px] text-stone-500 font-mono">IFSC: {p.ifsc}</div>
                        </td>

                        <td className="p-4">
                          <div className="font-semibold">₹{p.grossAmount.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-purple-400">
                            -₹{p.commissionDeducted} ({p.commissionRate || '12%'})
                          </div>
                        </td>

                        <td className="p-4 font-bold text-sm text-emerald-400">
                          ₹{p.netAmount.toLocaleString('en-IN')}
                        </td>

                        <td className="p-4">
                          {getStatusBadge(p.status)}
                          {p.utr && (
                            <div className="font-mono text-[10px] text-stone-400 mt-1 flex items-center gap-1">
                              <span>Ref:</span>
                              <span className="text-stone-300 font-bold">{p.utr}</span>
                            </div>
                          )}
                          {p.rejectionReason && (
                            <div className="text-[10px] text-red-400 mt-1 max-w-xs truncate" title={p.rejectionReason}>
                              {p.rejectionReason}
                            </div>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenApproveModal(p)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs cursor-pointer active:scale-95 transition-all"
                                >
                                  Approve &amp; Pay
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenRejectModal(p)}
                                  className="px-2 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 font-bold text-[11px] cursor-pointer active:scale-95 transition-all"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {!isPending && (
                              <button
                                type="button"
                                onClick={() => deletePayout(p.id)}
                                className="text-stone-500 hover:text-stone-300 p-1 text-[11px] cursor-pointer"
                                title="Remove from view"
                              >
                                Archive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Approve / Reject Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative ${
              isLight ? 'bg-white border-purple-200 text-stone-900' : 'bg-[#161622] border-[#2e2e42] text-white'
            }`}
          >
            <h3 className="text-base font-bold mb-1 flex items-center gap-2">
              {actionType === 'approve' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Clear &amp; Approve Settlement</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span>Reject Payout Request</span>
                </>
              )}
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Payout ID: <span className="font-mono text-purple-400 font-bold">{selectedPayout.id}</span> • Salon:{' '}
              <b>{selectedPayout.salonName}</b>
            </p>

            <form onSubmit={handleConfirmAction} className="space-y-4 text-xs">
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#1b1b2a] border-[#28283c]'
                }`}
              >
                <div className="flex justify-between">
                  <span className="text-stone-500">Gross Booking Earnings:</span>
                  <span className="font-semibold">₹{selectedPayout.grossAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Platform Commission:</span>
                  <span className="text-purple-400 font-semibold">-₹{selectedPayout.commissionDeducted}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-stone-700/40 text-sm font-bold">
                  <span>Net Payable to Bank:</span>
                  <span className="text-emerald-400">₹{selectedPayout.netAmount}</span>
                </div>
              </div>

              {actionType === 'approve' ? (
                <>
                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">
                      Bank Settlement Reference (UTR / IMPS Ref ID)
                    </label>
                    <input
                      type="text"
                      required
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      placeholder="e.g. UTR9402948102"
                      className={`w-full p-2.5 rounded-xl border outline-none font-mono ${
                        isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-[#101018] border-[#323248] text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">Settlement Note (Optional)</label>
                    <input
                      type="text"
                      value={settlementNotes}
                      onChange={(e) => setSettlementNotes(e.target.value)}
                      placeholder="e.g. Approved via HDFC batch upload"
                      className={`w-full p-2.5 rounded-xl border outline-none ${
                        isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-[#101018] border-[#323248] text-white'
                      }`}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Reason for Rejection</label>
                  <textarea
                    required
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide detailed explanation for salon partner..."
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-[#101018] border-[#323248] text-white'
                    }`}
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPayout(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold text-white shadow-md cursor-pointer transition-all active:scale-95 ${
                    actionType === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  {actionType === 'approve' ? 'Confirm & Mark Settled' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
