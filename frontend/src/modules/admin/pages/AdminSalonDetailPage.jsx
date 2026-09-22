import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Percent,
  CalendarCheck2,
  Star,
  Users
} from 'lucide-react';
import { AdminTopBar } from '../components/AdminTopBar';
import { useAdmin } from '../context/AdminContext';

export const AdminSalonDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { salons, services, staff, bookings, reviews, verifySalon, rejectSalon, setSalonCommission } = useAdmin();

  const salon = salons.find((s) => s.id === id);

  const [commissionRate, setCommissionRate] = useState(salon?.commissionRate || '12% Flat');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!salon) {
    return (
      <div className="flex-1 p-8 text-white bg-[#0d0d12]">
        <div className="text-center py-20">
          <p className="text-stone-400">Salon not found.</p>
          <Link to="/admin/salons" className="text-purple-400 hover:underline mt-4 inline-block">
            Back to Salons
          </Link>
        </div>
      </div>
    );
  }

  const salonServices = services.filter((s) => s.salonId === id);
  const salonStaff = staff.filter((st) => st.salonId === id);
  const salonBookings = bookings.filter((b) => b.salonId === id);
  const salonReviews = reviews.filter((r) => r.salonId === id);

  const handleSaveCommission = () => {
    setSalonCommission(id, commissionRate);
  };

  const handleConfirmReject = () => {
    rejectSalon(id, rejectReason || 'Documents or compliance checks incomplete');
    setShowRejectModal(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d0d12]">
      <AdminTopBar
        title={salon.name}
        subtitle={`Partner Salon ID: ${salon.id} • Registered under ${salon.ownerName || 'Partner'}`}
        action={
          <Link
            to="/admin/salons"
            className="px-3 py-1.5 bg-[#181824] hover:bg-[#232333] border border-[#2d2d42] text-stone-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to directory</span>
          </Link>
        }
      />

      <div className="p-8 space-y-8 flex-1 overflow-y-auto">
        {/* Verification & Quick Action Banner */}
        <div className="p-6 rounded-2xl bg-[#14141e] border border-[#262638] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <img
              src={salon.coverImage}
              alt={salon.name}
              className="w-16 h-16 rounded-xl object-cover border border-[#2d2d40]"
            />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white">{salon.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    salon.verificationStatus === 'Live'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : salon.verificationStatus === 'Rejected'
                      ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {salon.verificationStatus || 'Pending'}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {salon.address} • Phone: {salon.phone || salon.mobile}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {salon.verificationStatus !== 'Live' && (
              <button
                onClick={() => verifySalon(id, 'Live')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
              >
                Approve & Mark Live
              </button>
            )}
            {salon.verificationStatus !== 'Rejected' && (
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/60 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Reject Application
              </button>
            )}
          </div>
        </div>

        {/* 3 Column Metadata Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Business Profile */}
          <div className="bg-[#14141e] border border-[#262638] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              Business Profile
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stone-500 block">Owner / Representative</span>
                <span className="text-white font-medium">{salon.ownerName || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Category</span>
                <span className="text-white font-medium">{salon.category}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Email</span>
                <span className="text-white font-medium">{salon.email || '—'}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Hours of Operation</span>
                <span className="text-white font-medium">{salon.openHoursLegacy || '09:30 AM - 08:30 PM'}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Instant Booking Mode</span>
                <span className="text-emerald-400 font-medium">
                  {salon.isInstantBookingEnabled ? `Enabled (${salon.instantWaitMinutes || 15}m wait)` : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Legal & Banking Compliance */}
          <div className="bg-[#14141e] border border-[#262638] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Compliance & Banking
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stone-500 block">GSTIN Registration</span>
                <span className="font-mono text-stone-200 font-semibold">{salon.gstin || '23AABCU9603R1ZM'}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Shop & Establishment License</span>
                <span className="font-mono text-stone-200 font-semibold">
                  {salon.shopActLicense || 'IND-MP-2025-8821'}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Payout Bank</span>
                <span className="text-white font-medium">{salon.bankName || 'HDFC Bank'}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Account Number & IFSC</span>
                <span className="font-mono text-stone-200 font-medium">
                  {salon.accountNumber || '••••4892'} ({salon.ifscCode || 'HDFC0001032'})
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Platform Agreement & Commission */}
          <div className="bg-[#14141e] border border-[#262638] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-2">
              <Percent className="w-4 h-4 text-pink-400" />
              Commercial Agreement
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 block mb-1">Commission Rate</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full bg-[#0d0d14] border border-[#2e2e42] rounded-lg px-3 py-1.5 text-white text-xs font-semibold focus:border-purple-500 outline-none"
                  />
                  <button
                    onClick={handleSaveCommission}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-[#232333] space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Catalog Services</span>
                  <span className="text-white font-semibold">{salonServices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Active Staff</span>
                  <span className="text-white font-semibold">{salonStaff.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Total Bookings</span>
                  <span className="text-white font-semibold">{salonBookings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Customer Rating</span>
                  <span className="text-amber-300 font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    {salon.rating || 4.8} ({salonReviews.length} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services & Staff snapshot tabs */}
        <div className="bg-[#14141e] border border-[#262638] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Offered Services ({salonServices.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {salonServices.map((srv) => (
              <div key={srv.id} className="p-3 rounded-xl bg-[#1b1b26] border border-[#262638] flex justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">{srv.name}</div>
                  <div className="text-[11px] text-stone-400">
                    {srv.category} • {srv.duration}
                  </div>
                </div>
                <div className="text-xs font-bold text-purple-300">₹{srv.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141e] border border-[#262638] rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Reject Partner Application</h3>
            <p className="text-xs text-stone-400">
              Please enter the audit finding or compliance reason for declining this salon listing.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Shop establishment license expired or invalid GSTIN..."
              className="w-full bg-[#0d0d14] border border-[#2d2d40] rounded-xl p-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
