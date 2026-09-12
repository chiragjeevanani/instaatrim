import React from 'react';
import { useSalon } from '../context/SalonContext';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  IndianRupee,
  Users,
  Repeat,
  Calendar,
  Zap,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Landmark,
  FileSpreadsheet
} from 'lucide-react';

export const SalonAnalyticsPage = () => {
  const { metrics, salonProfile, showToast } = useSalon();

  const handleRequestPayout = () => {
    showToast(`Instant payout request of ₹${metrics.availablePayout.toLocaleString()} submitted to HDFC Bank (A/C **4892)`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[480px] min-w-0 bg-[#fbfaf9] font-sans text-stone-900 antialiased min-h-screen pb-24 mx-auto flex flex-col justify-between overflow-x-hidden box-border"
    >
      <main className="p-3.5 space-y-3.5 flex-1 w-full min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[14px] font-bold text-stone-900 tracking-tight">
              Payouts &amp; Revenue Analytics
            </h1>
            <p className="text-[10.5px] text-stone-400 font-normal">
              Financial reconciliation, GMV &amp; operational metrics
            </p>
          </div>
        </div>

        {/* Payout Balance Hero Card */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 font-bold">
                <IndianRupee className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Available for Payout
                </span>
                <span className="text-xl font-bold text-stone-900 leading-tight">
                  ₹{metrics.availablePayout.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleRequestPayout}
              className="px-3 py-1.5 bg-rose-900 hover:bg-rose-950 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              Withdraw Now
            </button>
          </div>

          <div className="pt-2.5 border-t border-stone-100 grid grid-cols-2 gap-2 text-[10.5px]">
            <div>
              <span className="text-stone-400 font-medium">Next Auto-Settlement:</span>
              <p className="font-bold text-stone-800">{metrics.nextPayoutDate}</p>
            </div>
            <div>
              <span className="text-stone-400 font-medium">Bank Account:</span>
              <p className="font-bold text-stone-800">HDFC Bank (••4892)</p>
            </div>
          </div>
        </div>

        {/* Key Operational KPIs (Section 26) */}
        {/* Key Metrics - Clean & Balanced */}
        <div className="grid grid-cols-2 gap-3">
          {/* Month GMV */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
            <span className="text-[11px] font-medium text-stone-500 block">
              MTD Revenue
            </span>
            <span className="text-xl font-bold text-stone-900 mt-1 block">
              ₹{metrics.monthGmv.toLocaleString()}
            </span>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              <span>+24% this month</span>
            </p>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
            <span className="text-[11px] font-medium text-stone-500 block">
              Avg Order Value
            </span>
            <span className="text-xl font-bold text-stone-900 mt-1 block">
              ₹1,180
            </span>
            <p className="text-[11px] text-stone-400 font-normal mt-1">
              124 appointments
            </p>
          </div>

          {/* Repeat Customer Rate */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
            <span className="text-[11px] font-medium text-stone-500 block">
              Repeat Clients
            </span>
            <span className="text-xl font-bold text-stone-900 mt-1 block">
              68.4%
            </span>
            <p className="text-[11px] text-stone-400 font-normal mt-1">
              85 loyal guests
            </p>
          </div>

          {/* Cancellation Rate */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
            <span className="text-[11px] font-medium text-stone-500 block">
              Completion Rate
            </span>
            <span className="text-xl font-bold text-stone-900 mt-1 block">
              97.9%
            </span>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Only 2.1% cancellations
            </p>
          </div>
        </div>

        {/* Hourly Chair Traffic Summary */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-900">
              Station Demand by Time of Day
            </h3>
            <span className="text-[10px] text-stone-400 font-medium">30 Days</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                <span>Morning (10:00 AM – 1:00 PM)</span>
                <span className="font-semibold text-stone-800">75%</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-stone-700 rounded-full w-[75%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-amber-900 mb-1">
                <span className="font-medium">Afternoon Non-Peak (1:00 PM – 4:00 PM)</span>
                <span className="font-bold text-amber-800">35% (Slow Hours)</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-[35%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-stone-600 mb-1">
                <span>Evening Rush (4:00 PM – 8:30 PM)</span>
                <span className="font-semibold text-emerald-700">92%</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full w-[92%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-stone-900">
            Top Performing Services
          </h3>
          <div className="divide-y divide-stone-100 text-xs">
            <div className="py-2 flex items-center justify-between">
              <div>
                <p className="font-semibold text-stone-900 text-[11.5px]">HydraGlo Pore Extraction Facial</p>
                <span className="text-[10px] text-stone-400">42 bookings • 4.9 ★</span>
              </div>
              <span className="font-bold text-stone-900 text-xs">₹54,558</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <div>
                <p className="font-semibold text-stone-900 text-[11.5px]">Full Body Aromatherapy Spa</p>
                <span className="text-[10px] text-stone-400">28 bookings • 4.8 ★</span>
              </div>
              <span className="font-bold text-stone-900 text-xs">₹41,972</span>
            </div>

            <div className="py-2 flex items-center justify-between">
              <div>
                <p className="font-semibold text-stone-900 text-[11.5px]">Korean Full Arms &amp; Legs Wax</p>
                <span className="text-[10px] text-stone-400">38 bookings • 4.8 ★</span>
              </div>
              <span className="font-bold text-stone-900 text-xs">₹34,162</span>
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
};
