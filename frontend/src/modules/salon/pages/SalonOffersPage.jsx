import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { motion } from 'framer-motion';
import {
  Tag,
  Plus,
  Clock,
  Calendar,
  Percent,
  Sparkles,
  Flame,
  CheckCircle2,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { OfferModal } from '../components/OfferModal';

export const SalonOffersPage = () => {
  const { offers, toggleOfferActive } = useSalon();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      className="w-full max-w-[480px] min-w-0 bg-transparent font-sans text-stone-900 antialiased min-h-screen pb-24 mx-auto flex flex-col justify-between overflow-x-hidden box-border"
    >
      <main className="p-3.5 space-y-3.5 flex-1 w-full min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[14px] font-bold text-stone-900 tracking-tight">
              Dynamic Pricing &amp; Flash Deals
            </h1>
            <p className="text-[10.5px] text-stone-400 font-normal">
              Automated yield management for slow periods
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-rose-900 hover:bg-rose-950 active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Create Offer</span>
          </button>
        </div>

        {/* Informative Banner on Empty-Chair Model */}
        <div className="bg-stone-900 text-white rounded-2xl p-4 shadow-sm space-y-2.5 relative overflow-hidden border border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xs shrink-0">
              <Flame className="w-4 h-4 fill-stone-950 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-stone-100">
                Empty Station Monetization
              </h2>
              <p className="text-[10px] text-amber-300 font-medium">
                Turn idle salon capacity into high-margin revenue
              </p>
            </div>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed font-normal">
            Salons lose up to 35% margin from unfilled chairs between 12 PM - 4 PM. Target those exact slots with automated dynamic discounts.
          </p>
          <div className="flex items-center gap-4 pt-1 border-t border-white/10 text-[10px] text-stone-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[2]" />
              Auto-Applies at Checkout
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400 stroke-[2]" />
              +28% Seat Occupancy
            </span>
          </div>
        </div>

        {/* Offers List */}
        <div className="space-y-2.5 pt-1">
          <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-1">
            Active Campaigns ({offers.length})
          </h3>

          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white rounded-2xl p-3.5 border transition-all shadow-xs space-y-3 ${
                offer.isActive ? 'border-stone-200/80' : 'border-stone-200 opacity-60'
              }`}
            >
              {/* Top row: Title, Discount Badge, Toggle */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-rose-100">
                    <Tag className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-stone-900 leading-tight">
                        {offer.title}
                      </h4>
                      <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold px-1.5 py-0.5 rounded">
                        {offer.discount}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-stone-400 mt-1 leading-tight font-normal">
                      {offer.description}
                    </p>
                  </div>
                </div>

                {/* Switch */}
                <button
                  onClick={() => toggleOfferActive(offer.id)}
                  className={`w-8 h-[18px] rounded-full p-0.5 transition-colors cursor-pointer relative shrink-0 shadow-inner ${
                    offer.isActive ? 'bg-rose-900' : 'bg-stone-300'
                  }`}
                  title={offer.isActive ? 'Pause offer' : 'Activate offer'}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                      offer.isActive ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Slot and Criteria Chips */}
              <div className="bg-stone-50 rounded-xl p-2.5 text-[10.5px] space-y-1.5 border border-stone-100">
                <div className="flex items-center justify-between text-stone-600 font-normal">
                  <span className="flex items-center gap-1.5 font-medium text-stone-500">
                    <Clock className="w-3 h-3 text-rose-900 stroke-[2] shrink-0" />
                    <span>Time Window:</span>
                  </span>
                  <span className="font-bold text-stone-900">{offer.timeWindow}</span>
                </div>

                <div className="flex items-center justify-between text-stone-600 font-normal">
                  <span className="flex items-center gap-1.5 font-medium text-stone-500">
                    <Calendar className="w-3 h-3 text-stone-400 stroke-[2] shrink-0" />
                    <span>Applicable Days:</span>
                  </span>
                  <span className="truncate max-w-[200px] text-right font-semibold text-stone-700">
                    {offer.applicableDays.map((d) => d.slice(0, 3)).join(', ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-stone-600 font-normal">
                  <span className="font-medium text-stone-500">Min. Order Value:</span>
                  <span className="font-bold text-stone-900">₹{offer.minOrderValue}</span>
                </div>
              </div>

              {/* Performance / Redemption stat */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[10px] text-stone-400 font-normal">
                <span>Total Redemptions:</span>
                <span className="font-bold text-rose-900">
                  {offer.redeemedCount} Bookings Filled
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Offer Creation Modal */}
      <OfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
