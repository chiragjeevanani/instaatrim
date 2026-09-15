import React, { useState } from 'react';
import { useSalon } from '../context/SalonContext';
import { motion } from 'framer-motion';
import {
  Search,
  Zap,
  Calendar,
  Phone,
  Plus,
  Filter,
  CheckCircle2,
  Play,
  Check,
  MoreVertical,
  Clock
} from 'lucide-react';
import { BookingDetailModal } from '../components/BookingDetailModal';
import { NewBookingModal } from '../components/NewBookingModal';
import { dateKey as toDateKey, formatDateKeyFriendly } from '../../../shared/lib/time';
import { stationLabelFor } from '../../../shared/store/selectors';

export const SalonBookingsPage = () => {
  const { bookings, stations, staff, checkInCustomer, startService, completeService } = useSalon();
  const todayKey = toDateKey(new Date());

  const [activeTab, setActiveTab] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  const tabs = ['Today', 'All', 'In Progress', 'Instant (⚡)', 'Scheduled', 'Completed'];

  const filteredBookings = bookings.filter((b) => {
    // Search query filter
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerPhone.includes(searchQuery) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === 'Today') {
      return b.dateKey === todayKey;
    }
    if (activeTab === 'In Progress') {
      return b.status === 'Service Started' || b.status === 'Checked-In';
    }
    if (activeTab === 'Instant (⚡)') {
      return b.bookingMode === 'Instant';
    }
    if (activeTab === 'Scheduled') {
      return b.bookingMode === 'Scheduled';
    }
    if (activeTab === 'Completed') {
      return b.status === 'Completed';
    }
    return true;
  });

  return (
    <div
      className="w-full max-w-[480px] min-w-0 bg-transparent font-sans text-stone-900 antialiased min-h-screen pb-24 mx-auto flex flex-col justify-between overflow-x-hidden box-border"
    >
      <main className="p-3.5 space-y-3.5 flex-1 w-full min-w-0">
        {/* Top Header & Search */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[14px] font-bold text-stone-900 tracking-tight">
                Appointments Queue
              </h1>
              <p className="text-[10.5px] text-stone-400 font-normal">Real-time scheduling & station check-in</p>
            </div>
            <button
              onClick={() => setIsWalkInOpen(true)}
              className="flex items-center gap-1.5 bg-rose-900 hover:bg-rose-950 active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Walk-In</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 stroke-[2] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search client, mobile number, or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white rounded-xl text-xs text-stone-800 placeholder-stone-400 border border-stone-200/90 shadow-2xs focus:outline-none focus:ring-1 focus:ring-rose-900 font-normal"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 pb-0.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[10.5px] font-semibold px-3 py-1 rounded-full shrink-0 transition-all ${
                    isActive
                      ? 'bg-rose-900 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-2.5 pt-1">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200/80 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-2">
                <Calendar className="w-5 h-5 stroke-[2]" />
              </div>
              <p className="text-xs font-bold text-stone-800">No appointments found</p>
              <p className="text-[11px] text-stone-400 mt-0.5 font-normal">Try selecting a different filter or search term</p>
            </div>
          ) : (
            filteredBookings.map((b) => {
              const isInstant = b.bookingMode === 'Instant';
              const isInService = b.status === 'Service Started';
              const isCheckedIn = b.status === 'Checked-In';
              const isCompleted = b.status === 'Completed';

              return (
                <article
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-xs space-y-2.5 cursor-pointer hover:border-stone-300 hover:shadow-sm transition-all"
                >
                  {/* Top line: Customer & Mode */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-800 flex items-center justify-center font-bold text-xs border border-stone-200/60">
                        {b.customerName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-[13px] font-bold text-stone-900 leading-tight">
                          {b.customerName}
                        </h3>
                        <p className="text-[10px] text-stone-400 leading-tight mt-0.5 font-normal">
                          {b.customerPhone} • {stationLabelFor(b, stations, staff)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 border ${
                          isInstant
                            ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {isInstant ? <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500 stroke-[1.8]" /> : <Calendar className="w-2.5 h-2.5 stroke-[1.8]" />}
                        {b.bookingMode}
                      </span>
                      <div className="flex items-center justify-end gap-1 text-[10.5px] font-semibold text-stone-600 mt-1">
                        <Clock className="w-3 h-3 text-stone-400 stroke-[2]" />
                        <span>{b.dateKey === todayKey ? b.time : `${formatDateKeyFriendly(b.dateKey)}, ${b.time}`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booked services items */}
                  <div className="bg-stone-50 rounded-xl p-2.5 text-xs space-y-1.5 border border-stone-100">
                    {b.services.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px]">
                        <span className="font-medium text-stone-700 truncate pr-2">{s.name}</span>
                        <span className="text-stone-400 shrink-0 text-[10px]">{s.duration}</span>
                      </div>
                    ))}
                    <div className="border-t border-stone-200/70 pt-1.5 flex justify-between items-center text-[11.5px] text-stone-900">
                      <span className="text-[10px] text-stone-500 font-normal truncate pr-2">
                        {b.paymentMethod}
                      </span>
                      <span className="font-bold text-rose-900 shrink-0">₹{b.totalAmount}</span>
                    </div>
                  </div>

                  {/* Status & Action */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isInService
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : isCheckedIn
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isInService ? 'bg-rose-700 animate-pulse' : isCheckedIn ? 'bg-sky-600' : isCompleted ? 'bg-emerald-600' : 'bg-amber-500'
                        }`} />
                        {b.status}
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">({b.paymentStatus})</span>
                    </div>

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

                      {b.status === 'Completed' && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ✓ Settled
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </main>

      {/* Modals */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
      />

      <NewBookingModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
      />
    </div>
  );
};
