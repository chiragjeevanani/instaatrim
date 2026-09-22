import React from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  CalendarCheck2,
  Store,
  Clock,
  TrendingUp,
  Tag,
  ArrowRight,
  ShieldAlert,
  Percent,
  CheckCircle2,
  Users
} from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminDashboardPage = () => {
  const { kpis, bookings, salons, offers, tickets, approveOffer, rejectOffer, verifySalon } = useAdmin();

  // Recent 6 bookings
  const recentBookings = bookings.slice(0, 6);

  // Pending salons
  const pendingSalonsList = salons.filter((s) => s.verificationStatus === 'Pending' || !s.isVerified);

  // Pending offers
  const pendingOffersList = offers.filter((o) => o.approvalStatus === 'pending');

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      <AdminTopBar
        title="Super Admin Overview"
        subtitle="Platform health, live volume, revenue metrics and pending verification approvals"
      />

      <div className="p-8 space-y-8 flex-1 overflow-y-auto">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* GMV */}
          <div className="bg-[#14141d] border border-[#232333] rounded-2xl p-5 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total GMV</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">₹{kpis.totalRevenue.toLocaleString()}</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +18.4%
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Gross Booking Value across network</p>
          </div>

          {/* Platform Commission */}
          <div className="bg-[#14141d] border border-[#232333] rounded-2xl p-5 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Net Commission</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">₹{kpis.platformCommission.toLocaleString()}</span>
              <span className="text-xs font-medium text-stone-400">12% avg rate</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Platform retained earnings</p>
          </div>

          {/* Bookings */}
          <div className="bg-[#14141d] border border-[#232333] rounded-2xl p-5 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total Bookings</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <CalendarCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{kpis.totalBookings}</span>
              <span className="text-xs font-medium text-stone-400">{kpis.completedBookings} completed</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Scheduled + instant reservations</p>
          </div>

          {/* Salons Network */}
          <div className="bg-[#14141d] border border-[#232333] rounded-2xl p-5 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Active Salons</span>
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-400 flex items-center justify-center">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{kpis.activeSalons}</span>
              {kpis.pendingSalons > 0 && (
                <span className="text-xs font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/15">
                  {kpis.pendingSalons} pending
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Verified partner locations</p>
          </div>
        </div>

        {/* Action Center: Pending items */}
        {(pendingSalonsList.length > 0 || pendingOffersList.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Salons */}
            {pendingSalonsList.length > 0 && (
              <div className="bg-[#14141d] border border-amber-900/40 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Partner Verification Queue ({pendingSalonsList.length})
                    </h2>
                  </div>
                  <Link to="/admin/salons?filter=pending" className="text-xs text-purple-400 hover:underline">
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {pendingSalonsList.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-[#1b1b26] border border-[#282838] flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{s.name}</div>
                        <div className="text-xs text-stone-400">
                          {s.ownerName} • {s.area || s.address}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => verifySalon(s.id, 'Live')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Approve Live
                        </button>
                        <Link
                          to={`/admin/salons/${s.id}`}
                          className="px-2.5 py-1.5 bg-[#252535] hover:bg-[#303045] text-stone-300 rounded-lg text-xs font-medium transition-colors"
                        >
                          Audit
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Offers */}
            {pendingOffersList.length > 0 && (
              <div className="bg-[#14141d] border border-purple-900/40 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Offers Awaiting Approval ({pendingOffersList.length})
                    </h2>
                  </div>
                  <Link to="/admin/offers" className="text-xs text-purple-400 hover:underline">
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {pendingOffersList.slice(0, 3).map((o) => {
                    const salon = salons.find((s) => s.id === o.salonId);
                    return (
                      <div
                        key={o.id}
                        className="p-3 rounded-xl bg-[#1b1b26] border border-[#282838] flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{o.title}</div>
                          <div className="text-xs text-stone-400">
                            {salon?.name || o.salonId} • <span className="text-purple-400 font-medium">{o.discount}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveOffer(o.id)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectOffer(o.id, 'Discount threshold exceeds policy')}
                            className="px-2.5 py-1.5 bg-red-950/40 text-red-300 hover:bg-red-900/50 border border-red-800/50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Bookings Feed */}
        <div className="admin-table-card bg-[#14141d] border border-[#232333] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Live Platform Bookings</h2>
              <p className="text-xs text-stone-400">Real-time appointments flowing across all salons</p>
            </div>
            <Link
              to="/admin/bookings"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>View All ({bookings.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="admin-table-header border-y border-[#232333] bg-[#111119] text-stone-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6 font-semibold">Booking ID</th>
                  <th className="py-3.5 px-4 font-semibold">Customer</th>
                  <th className="py-3.5 px-4 font-semibold">Salon</th>
                  <th className="py-3.5 px-4 font-semibold">Mode & Slot</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2c]">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="admin-table-row hover:bg-[#191924] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-purple-300">{b.id}</td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{b.customerName || 'Customer'}</div>
                      <div className="text-[11px] text-stone-500">{b.customerPhone || '—'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-stone-200">{b.salonName}</div>
                      <div className="text-[11px] text-stone-500">{b.address?.split(',')[0]}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-300 border border-stone-700 mr-2">
                        {b.bookingMode || 'Scheduled'}
                      </span>
                      <span className="text-stone-300">{b.time}</span>
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
                    <td className="py-4 px-6 text-right font-bold text-white">
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
