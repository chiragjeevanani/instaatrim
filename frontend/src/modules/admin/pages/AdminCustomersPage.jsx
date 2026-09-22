import React, { useState } from 'react';
import { Search, UserCheck, Phone, Mail, Award, Calendar } from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminCustomersPage = () => {
  const { customers, bookings } = useAdmin();
  const [search, setSearch] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      <AdminTopBar
        title="Customer Directory"
        subtitle="Registered clients, VIP Elite Club statuses and booking frequencies"
      />

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        <div className="flex justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customers by name, phone or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#14141e] border border-[#262638] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="admin-table-header border-b border-[#232333] bg-[#111119] text-stone-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5 font-semibold">Customer ID</th>
                  <th className="py-3.5 px-4 font-semibold">Name & Tier</th>
                  <th className="py-3.5 px-4 font-semibold">Contact Info</th>
                  <th className="py-3.5 px-4 font-semibold">Auth Method</th>
                  <th className="py-3.5 px-4 font-semibold">Referral Code</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Lifetime Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2c]">
                {filteredCustomers.map((c) => {
                  const customerBookingsCount = bookings.filter(
                    (b) => b.customerId === c.id || b.customerPhone === c.phone
                  ).length;

                  return (
                    <tr key={c.id} className="admin-table-row hover:bg-[#191924] transition-colors">
                      <td className="py-4 px-5 font-mono text-purple-300 font-semibold">{c.id}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{c.name || 'Anonymous User'}</span>
                          {c.isElite && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500/20 to-purple-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Award className="w-2.5 h-2.5" /> Elite VIP
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-stone-300">
                        <div>{c.phone ? `+91 ${c.phone}` : '—'}</div>
                        <div className="text-[11px] text-stone-500">{c.email || '—'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-300 uppercase tracking-wider">
                          {c.authProvider || 'OTP'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-stone-400">{c.referralCode || '—'}</td>
                      <td className="py-4 px-5 text-right font-bold text-white">
                        {customerBookingsCount > 0 ? `${customerBookingsCount} bookings` : '1 booking'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
