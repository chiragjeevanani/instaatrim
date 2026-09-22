import React, { useState } from 'react';
import { Search, CalendarCheck2, Clock, CheckCircle2, AlertCircle, Filter } from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminBookingsPage = () => {
  const { bookings, salons } = useAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      b.salonName?.toLowerCase().includes(search.toLowerCase()) ||
      b.customerPhone?.includes(search);

    if (!matchesSearch) return false;
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (modeFilter !== 'All' && (b.bookingMode || 'Scheduled') !== modeFilter) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      <AdminTopBar
        title="Global Platform Bookings"
        subtitle="End-to-end appointment ledger across all partner salons and customers"
      />

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, customer name, phone, or salon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#14141e] border border-[#262638] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Mode filter */}
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-[#14141e] border border-[#262638] rounded-xl px-3 py-2 text-stone-300 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Modes</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Instant">Instant (Walk-in)</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#14141e] border border-[#262638] rounded-xl px-3 py-2 text-stone-300 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In-Service">In-Service</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings Ledger Table */}
        <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="admin-table-header border-b border-[#232333] bg-[#111119] text-stone-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5 font-semibold">Booking ID</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Salon Partner</th>
                  <th className="py-3.5 px-4 font-semibold">Mode & Slot</th>
                  <th className="py-3.5 px-4 font-semibold">Services</th>
                  <th className="py-3.5 px-4 font-semibold">Payment</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2c]">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="admin-table-row hover:bg-[#191924] transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-purple-300">{b.id}</td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{b.customerName || 'Ananya Sharma'}</div>
                      <div className="text-[11px] text-stone-500">{b.customerPhone || '7000792773'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-stone-200">{b.salonName}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{b.salonId}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-300 border border-stone-700 mr-2">
                        {b.bookingMode || 'Scheduled'}
                      </span>
                      <span className="text-stone-300">{b.time}</span>
                    </td>
                    <td className="py-4 px-4 max-w-[200px] truncate text-stone-300">
                      {b.services?.map((s) => s.name).join(', ') || 'Custom Treatment'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-stone-200">{b.paymentMethod || 'Online UPI'}</div>
                      <div
                        className={`text-[10px] font-semibold ${
                          b.paymentStatus === 'Successful' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {b.paymentStatus || 'Pending'}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          b.status === 'Completed'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : b.status === 'In-Service'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                            : b.status === 'Cancelled'
                            ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right font-bold text-white">
                      ₹{(b.finalPaid || b.totalAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
