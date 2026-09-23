import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import {
  ArrowLeft,
  IndianRupee,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText,
  ChevronRight,
  ShieldCheck,
  Send,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SalonPayoutsPage = () => {
  const navigate = useNavigate();
  const { salonProfile, payouts = [], metrics, requestPayout } = useSalon();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableBalance = metrics.availablePayout || 28450;
  const commissionRate = salonProfile.commissionRate || '12%';
  const rateNum = Number(commissionRate.replace(/\D/g, '')) || 12;

  const numericAmount = Number(requestAmount) || 0;
  const estimatedCommission = Math.round((numericAmount * rateNum) / 100);
  const estimatedNet = Math.max(0, numericAmount - estimatedCommission);

  const handleOpenModal = () => {
    setRequestAmount(String(availableBalance));
    setNotes('');
    setIsRequestModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (numericAmount < 500) return;
    setIsSubmitting(true);
    await requestPayout(numericAmount, notes);
    setIsSubmitting(false);
    setIsRequestModalOpen(false);
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
            <h1 className="text-base font-bold text-stone-900 leading-tight">Earnings &amp; Payouts</h1>
            <p className="text-[10px] text-stone-500">{salonProfile.name}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
          KYC Verified
        </span>
      </header>

      <main className="p-4 flex-1 space-y-4">
        {/* Wallet Balance Hero Card */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-850 to-purple-950 p-5 text-white shadow-lg border border-purple-900/40">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px]">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              Settlement Wallet
            </span>
            <span className="text-purple-300 font-mono text-[11px]">{commissionRate} Comm. Rate</span>
          </div>

          <div className="mt-2">
            <div className="text-3xl font-extrabold tracking-tight text-white flex items-center">
              <span>₹{availableBalance.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-[11px] text-stone-300 mt-1">Available balance ready for withdrawal</p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="text-[11px] text-stone-400">
              <span>Payout Schedule: </span>
              <span className="text-stone-200 font-semibold">{metrics.nextPayoutDate}</span>
            </div>

            <button
              onClick={handleOpenModal}
              disabled={availableBalance < 500}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-stone-950 text-xs font-extrabold rounded-xl shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              Request Payout
            </button>
          </div>
        </div>

        {/* Bank Account Verification Info Card */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-maroon flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 flex items-center gap-1">
                <span>{salonProfile.bankName || 'HDFC Bank'}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-[11px] font-mono text-stone-600 mt-0.5">
                A/C: {salonProfile.accountNumber || '•••• •••• 4892'}
              </p>
              <p className="text-[10px] text-stone-500 font-mono">IFSC: {salonProfile.ifscCode || 'HDFC0001032'}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-lg">
            Primary
          </span>
        </div>

        {/* Payout History List */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <h2 className="text-xs font-bold text-stone-700 uppercase tracking-wider">Settlement History</h2>
            <span className="text-[11px] text-stone-400">{payouts.length} transfers</span>
          </div>

          <div className="space-y-2.5">
            {payouts.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-stone-200/80 text-stone-400 text-xs">
                No payout transactions yet.
              </div>
            ) : (
              payouts.map((p) => {
                const isTransferred = p.status === 'Transferred';
                const isPending = p.status === 'Pending';

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-purple-700">{p.id}</span>
                        <span className="text-[10px] text-stone-400">
                          • {new Date(p.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isTransferred
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isPending
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                      <div>
                        <div className="text-[11px] text-stone-500">
                          Gross: ₹{p.grossAmount} (-₹{p.commissionDeducted} fee)
                        </div>
                        {p.utr && (
                          <div className="text-[10px] font-mono text-stone-600 mt-0.5">
                            Bank Ref: <b>{p.utr}</b>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-stone-900 block">
                          ₹{p.netAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[9px] text-stone-400">Net transferred</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Payout Request Modal */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4 text-xs relative"
            >
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">Request Withdrawal</h3>
                  <p className="text-[10px] text-stone-500">Payout to verified bank account</p>
                </div>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-3.5">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1">
                    Withdrawal Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="500"
                    max={availableBalance}
                    required
                    value={requestAmount}
                    onChange={(e) => setRequestAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 outline-none focus:border-brand-maroon"
                  />
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    Available: ₹{availableBalance.toLocaleString('en-IN')} (Min ₹500)
                  </span>
                </div>

                <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100 space-y-1 text-[11px]">
                  <div className="flex justify-between text-stone-600">
                    <span>Withdrawal Gross:</span>
                    <span>₹{numericAmount}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Platform Commission ({commissionRate}):</span>
                    <span className="text-purple-700">-₹{estimatedCommission}</span>
                  </div>
                  <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-purple-200/60 text-xs">
                    <span>Net Transfer Amount:</span>
                    <span className="text-emerald-700">₹{estimatedNet}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1">
                    Withdrawal Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Festival weekend payout"
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || numericAmount < 500}
                  className="w-full py-2.5 rounded-xl bg-brand-maroon hover:bg-brand-darkMaroon text-white font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Payout Request'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
