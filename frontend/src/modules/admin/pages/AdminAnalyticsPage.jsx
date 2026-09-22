import React from 'react';
import { BarChart3, TrendingUp, DollarSign, Store, Calendar, Award } from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminAnalyticsPage = () => {
  const { kpis, salons, bookings, services } = useAdmin();

  // Booking mode split
  const scheduledCount = bookings.filter((b) => (b.bookingMode || 'Scheduled') === 'Scheduled').length;
  const instantCount = bookings.filter((b) => b.bookingMode === 'Instant').length;
  const totalBookings = bookings.length || 1;
  const scheduledPct = Math.round((scheduledCount / totalBookings) * 100);
  const instantPct = 100 - scheduledPct;

  // Top salons by booking volume
  const salonVolumeMap = {};
  bookings.forEach((b) => {
    salonVolumeMap[b.salonName] = (salonVolumeMap[b.salonName] || 0) + 1;
  });
  const topSalons = Object.entries(salonVolumeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxVolume = topSalons[0] ? topSalons[0][1] : 1;

  // Category share
  const categoryCounts = {};
  services.forEach((s) => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const totalCatalogServices = services.length || 1;

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      <AdminTopBar
        title="Platform Analytics & Business Intelligence"
        subtitle="Network utilization, mode breakdown, category depth and partner performance"
      />

      <div className="p-8 space-y-8 flex-1 overflow-y-auto">
        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#14141e] border border-[#262638]">
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Avg Order Value (AOV)
            </div>
            <div className="text-2xl font-bold text-white mt-2">
              ₹{totalBookings > 0 ? Math.round(kpis.totalRevenue / totalBookings) : 0}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">Per completed booking session</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#14141e] border border-[#262638]">
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Instant Booking Adoption
            </div>
            <div className="text-2xl font-bold text-purple-400 mt-2">{instantPct}%</div>
            <p className="text-[11px] text-stone-500 mt-1">Walk-in instant slots vs scheduled</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#14141e] border border-[#262638]">
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Salon Verification Rate
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">
              {salons.length > 0 ? Math.round((kpis.activeSalons / salons.length) * 100) : 0}%
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {kpis.activeSalons} live of {salons.length} registered
            </p>
          </div>
        </div>

        {/* Breakdown Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Modes Bar Breakdown */}
          <div className="bg-[#14141e] border border-[#262638] rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
              Booking Channel Distribution
            </h2>
            <p className="text-xs text-stone-400 mb-6">Scheduled advance bookings vs 15-min instant walk-ins</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-stone-200">Scheduled Appointments ({scheduledCount})</span>
                  <span className="font-bold text-purple-400">{scheduledPct}%</span>
                </div>
                <div className="h-3 w-full bg-[#1e1e2c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${scheduledPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-stone-200">Instant Walk-ins ({instantCount})</span>
                  <span className="font-bold text-amber-400">{instantPct}%</span>
                </div>
                <div className="h-3 w-full bg-[#1e1e2c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${instantPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Salon Partners by Volume */}
          <div className="bg-[#14141e] border border-[#262638] rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
              Top Partners by Appointment Volume
            </h2>
            <p className="text-xs text-stone-400 mb-6">Salons with highest customer engagement</p>

            <div className="space-y-4">
              {topSalons.map(([name, count]) => {
                const pct = Math.round((count / maxVolume) * 100);
                return (
                  <div key={name}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-stone-200 truncate">{name}</span>
                      <span className="font-bold text-emerald-400">{count} bookings</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#1e1e2c] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Service Category Depth */}
        <div className="bg-[#14141e] border border-[#262638] rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
            Catalog Depth by Treatment Category
          </h2>
          <p className="text-xs text-stone-400 mb-6">Available platform services indexed by category</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sortedCategories.map(([cat, count]) => (
              <div key={cat} className="p-4 rounded-xl bg-[#1b1b26] border border-[#262638]">
                <div className="text-xs font-semibold text-stone-400">{cat}</div>
                <div className="text-xl font-bold text-white mt-1">{count} services</div>
                <div className="text-[10px] text-stone-500 mt-1">
                  {Math.round((count / totalCatalogServices) * 100)}% of catalog
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
