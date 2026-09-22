import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  ShieldAlert,
  Percent,
  Power,
  Store,
  ExternalLink
} from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminSalonsPage = () => {
  const { salons, verifySalon, rejectSalon, toggleSalonActive, setSalonCommission } = useAdmin();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All'); // All | Pending | Live | Rejected
  const [editingCommissionId, setEditingCommissionId] = useState(null);
  const [commissionInput, setCommissionInput] = useState('');

  const filteredSalons = salons.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
      s.area?.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'Pending') return s.verificationStatus === 'Pending' || !s.isVerified;
    if (filter === 'Live') return s.verificationStatus === 'Live';
    if (filter === 'Rejected') return s.verificationStatus === 'Rejected';
    return true;
  });

  const handleStartEditCommission = (salon) => {
    setEditingCommissionId(salon.id);
    setCommissionInput(salon.commissionRate || '12% Flat');
  };

  const handleSaveCommission = (salonId) => {
    if (commissionInput.trim()) {
      setSalonCommission(salonId, commissionInput.trim());
    }
    setEditingCommissionId(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      <AdminTopBar
        title="Salon Partner Directory"
        subtitle="Manage onboarding, business verifications, commission percentages and active status"
      />

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by salon name, owner, area or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#14141e] border border-[#262638] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="admin-filter-bar flex items-center gap-1.5 p-1 bg-[#14141e] border border-[#262638] rounded-xl text-xs">
            {['All', 'Live', 'Pending', 'Rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Salons Table */}
        <div className="admin-table-card bg-[#14141e] border border-[#262638] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="admin-table-header border-b border-[#232333] bg-[#111119] text-stone-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5 font-semibold">Salon & Partner</th>
                  <th className="py-3.5 px-4 font-semibold">Category & City</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Store Status</th>
                  <th className="py-3.5 px-4 font-semibold">Commission</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e2c]">
                {filteredSalons.map((salon) => {
                  const isLive = salon.verificationStatus === 'Live';
                  const isPending = salon.verificationStatus === 'Pending' || (!isLive && salon.verificationStatus !== 'Rejected');
                  const isRejected = salon.verificationStatus === 'Rejected';

                  return (
                    <tr key={salon.id} className="admin-table-row hover:bg-[#191924] transition-colors">
                      {/* Salon info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={salon.coverImage}
                            alt={salon.name}
                            className="w-10 h-10 rounded-lg object-cover border border-[#2c2c3e]"
                          />
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-2">
                              {salon.name}
                              <span className="font-mono text-[10px] text-purple-400 font-normal">({salon.id})</span>
                            </div>
                            <div className="text-[11px] text-stone-400">
                              Owner: <span className="text-stone-200">{salon.ownerName || 'Partner'}</span> • {salon.phone || salon.mobile}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & City */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-stone-200">{salon.category}</div>
                        <div className="text-[11px] text-stone-400">{salon.area || salon.locationCity}</div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-4 px-4">
                        {isLive && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3" /> Live & Verified
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </td>

                      {/* Store Status Toggle */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleSalonActive(salon.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            salon.isStoreOpen ?? true
                              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/50'
                              : 'bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-700'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{salon.isStoreOpen ?? true ? 'Online' : 'Offline'}</span>
                        </button>
                      </td>

                      {/* Commission rate */}
                      <td className="py-4 px-4">
                        {editingCommissionId === salon.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={commissionInput}
                              onChange={(e) => setCommissionInput(e.target.value)}
                              className="w-24 bg-[#0d0d14] border border-purple-500 rounded px-2 py-1 text-xs text-white"
                            />
                            <button
                              onClick={() => handleSaveCommission(salon.id)}
                              className="px-2 py-1 bg-purple-600 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditCommission(salon)}
                            className="text-stone-300 hover:text-purple-300 font-medium underline-offset-2 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <span>{salon.commissionRate || '12% Flat'}</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right space-x-2">
                        {isPending && (
                          <>
                            <button
                              onClick={() => verifySalon(salon.id, 'Live')}
                              className="admin-btn-approve px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-transparent"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectSalon(salon.id, 'Documents not matching')}
                              className="admin-btn-reject px-2.5 py-1 bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800/50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {isLive && (
                          <button
                            onClick={() => verifySalon(salon.id, 'Pending')}
                            className="admin-btn-revert px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-transparent"
                          >
                            Revert
                          </button>
                        )}
                        <Link
                          to={`/admin/salons/${salon.id}`}
                          className="admin-btn-details inline-flex items-center gap-1 px-3 py-1 bg-[#232333] hover:bg-purple-600 text-white rounded-lg text-xs font-medium transition-colors border border-transparent"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
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
