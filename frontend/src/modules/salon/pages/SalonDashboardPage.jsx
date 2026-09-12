import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { motion } from 'framer-motion';
import {
  Zap,
  Calendar,
  IndianRupee,
  Users,
  Armchair,
  Clock,
  Sparkles,
  Plus,
  ChevronRight,
  CheckCircle2,
  Play,
  Check,
  AlertTriangle,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { NewBookingModal } from '../components/NewBookingModal';
import { BookingDetailModal } from '../components/BookingDetailModal';
import { OfferModal } from '../components/OfferModal';
import { StationCapacityModal } from '../components/StationCapacityModal';

export const SalonDashboardPage = () => {
  const navigate = useNavigate();
  const {
    salonProfile,
    metrics,
    bookings,
    isInstantBookingEnabled,
    instantWaitMinutes,
    occupiedChairs,
    setOccupiedChairs,
    checkInCustomer,
    startService,
    completeService,
    showToast
  } = useSalon();

  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Active bookings for today
  const activeBookings = bookings.filter(
    (b) => b.status === 'Service Started' || b.status === 'Checked-In' || b.status === 'Confirmed'
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[480px] min-w-0 bg-[#fbfaf9] font-sans text-stone-900 antialiased min-h-screen pb-24 mx-auto flex flex-col justify-between overflow-x-hidden box-border"
    >
      <main className="p-3.5 space-y-3.5 flex-1 w-full min-w-0">
        {/* Metric Cards - Clean, Spacious, Ultra-Readable Hero Cards */}
        <div className="grid grid-cols-2 gap-3" data-purpose="kpi-summary">
          {/* Today's Sales */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-stone-500">
                Today's Sales
              </span>
              <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <IndianRupee className="w-3.5 h-3.5 stroke-[2]" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl font-bold text-stone-900 tracking-tight block">
                ₹{metrics.totalRevenueToday.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              <span>+18% today</span>
            </p>
          </div>

          {/* Active Appointments */}
          <div
            onClick={() => navigate('/salon/bookings')}
            className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs cursor-pointer hover:border-stone-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-stone-500">
                Appointments
              </span>
              <div className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 stroke-[2]" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-stone-900 tracking-tight">
                {metrics.totalBookingsToday}
              </span>
              <span className="text-xs text-stone-400 font-normal">total</span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-1">
              {metrics.inServiceTodayCount} in service • {metrics.checkedInTodayCount} waiting
            </p>
          </div>

          {/* Available Chairs / Stations */}
          <div
            onClick={() => setIsCapacityModalOpen(true)}
            className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-stone-500 group-hover:text-amber-800 transition-colors">
                Station Capacity
              </span>
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <Armchair className="w-3.5 h-3.5 stroke-[2]" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-stone-900 tracking-tight">
                {occupiedChairs}/{metrics.totalChairs}
              </span>
              <span className="text-xs text-stone-400 font-normal">occupied</span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-1 flex items-center justify-between">
              <span>{metrics.availableChairs} stations ready</span>
              <span className="text-[10px] text-amber-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                Manage →
              </span>
            </p>
          </div>

          {/* Instant Demand */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-stone-500">
                Booking Mode
              </span>
              <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 stroke-[2] fill-rose-700" />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-stone-900 tracking-tight">
                {metrics.instantBookingsCount}
              </span>
              <span className="text-xs text-rose-800 font-medium">Instant</span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-1">
              {metrics.scheduledBookingsCount} advance bookings
            </p>
          </div>
        </div>

        {/* Section 25 & 42.3.4: Executive Revenue Optimizer / Empty-Chair Banner */}
        <div className="bg-stone-900 text-white rounded-2xl p-3.5 shadow-sm relative overflow-hidden border border-stone-800">
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 shadow-xs mt-0.5 font-bold">
                <Flame className="w-4 h-4 fill-stone-950 stroke-[1.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-stone-100 tracking-tight">
                    Empty-Chair Yield Alert
                  </span>
                  <span className="text-[9px] bg-white/10 text-amber-300 font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
                    AI Forecast
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 font-normal leading-relaxed mt-1">
                  Low walk-in traffic predicted from <span className="text-white font-medium">1:00 PM – 4:00 PM</span> today. 2 stations will sit idle.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/10">
            <button
              onClick={() => setIsOfferModalOpen(true)}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-bold text-[10.5px] rounded-lg transition-transform flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2]" />
              <span>Launch 25% Off Deal</span>
            </button>
            <button
              onClick={() => navigate('/salon/offers')}
              className="text-[10.5px] text-stone-300 hover:text-white px-2 py-1 transition-colors"
            >
              View Active Offers →
            </button>
          </div>
        </div>

        {/* Quick Action Navigation Bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWalkInModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-rose-900 hover:bg-rose-950 active:scale-95 text-white py-2 px-3 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.2]" />
            <span>Walk-In Booking</span>
          </button>

          <button
            onClick={() => navigate('/salon/services')}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-stone-50 active:scale-95 text-stone-800 border border-stone-200/80 py-2 px-3 rounded-xl text-xs font-semibold shadow-2xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 stroke-[2]" />
            <span>Catalog</span>
          </button>

          <button
            onClick={() => navigate('/salon/analytics')}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-stone-50 active:scale-95 text-stone-800 border border-stone-200/80 py-2 px-3 rounded-xl text-xs font-semibold shadow-2xs transition-all"
          >
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />
            <span>Payouts</span>
          </button>
        </div>

        {/* Today's Live Queue (Section 24) */}
        <div className="space-y-2.5 pt-1" data-purpose="live-queue">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <h2 className="text-[13px] font-bold text-stone-900 tracking-tight">
                Live Appointment Queue
              </h2>
              <p className="text-[10.5px] text-stone-400 font-normal">Real-time check-in and station lifecycle</p>
            </div>
            <button
              onClick={() => navigate('/salon/bookings')}
              className="text-[11px] font-bold text-rose-900 hover:text-rose-950 flex items-center gap-0.5"
            >
              <span>View All ({bookings.length})</span>
              <ChevronRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>

          {activeBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-2">
                <Check className="w-5 h-5 stroke-[2]" />
              </div>
              <p className="text-xs font-bold text-stone-800">Queue is clear</p>
              <p className="text-[11px] text-stone-400 mt-0.5">No active clients in queue right now.</p>
            </div>
          ) : (
            activeBookings.slice(0, 4).map((b) => {
              const isInstant = b.bookingMode === 'Instant';
              const isInService = b.status === 'Service Started';
              const isCheckedIn = b.status === 'Checked-In';

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs space-y-2.5 cursor-pointer hover:border-stone-300 hover:shadow-sm transition-all"
                >
                  {/* Top line: Customer Name, Booking Mode, Slot Time */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-[13px]">{b.customerName}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 border ${
                          isInstant
                            ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {isInstant ? <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500 stroke-[1.8]" /> : <Calendar className="w-2.5 h-2.5 stroke-[1.8]" />}
                        {b.bookingMode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-50 px-2 py-0.5 rounded-md border border-stone-200/60">
                      <Clock className="w-3 h-3 text-stone-400 stroke-[2]" />
                      <span>{b.time}</span>
                    </div>
                  </div>

                  {/* Services summary */}
                  <div className="text-[11px] text-stone-500 font-normal truncate">
                    {b.services.map((s) => s.name).join(', ')}
                  </div>

                  {/* Status, Price, & Action Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isInService
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : isCheckedIn
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isInService ? 'bg-rose-700 animate-pulse' : isCheckedIn ? 'bg-sky-600' : 'bg-amber-500'
                        }`} />
                        {b.status}
                      </span>
                      <span className="text-[11.5px] font-bold text-stone-900">₹{b.totalAmount}</span>
                    </div>

                    {/* Inline progression button */}
                    <div onClick={(e) => e.stopPropagation()}>
                      {b.status === 'Confirmed' && (
                        <button
                          onClick={() => checkInCustomer(b.id)}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-semibold text-[10px] rounded-lg shadow-2xs transition-transform flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 stroke-[2]" />
                          <span>Check In</span>
                        </button>
                      )}

                      {b.status === 'Checked-In' && (
                        <button
                          onClick={() => startService(b.id)}
                          className="px-2.5 py-1 bg-rose-900 hover:bg-rose-950 active:scale-95 text-white font-semibold text-[10px] rounded-lg shadow-2xs transition-transform flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-white stroke-[2]" />
                          <span>Start Service</span>
                        </button>
                      )}

                      {b.status === 'Service Started' && (
                        <button
                          onClick={() => completeService(b.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-[10px] rounded-lg shadow-2xs transition-transform flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Modals */}
      <NewBookingModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
      />

      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
      />

      <StationCapacityModal
        isOpen={isCapacityModalOpen}
        onClose={() => setIsCapacityModalOpen(false)}
      />

      <BookingDetailModal
        booking={selectedBooking}
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
      />
    </motion.div>
  );
};
