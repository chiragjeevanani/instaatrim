import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { InfoSheet } from '../../../shared/components/InfoSheet';
import {
  ShieldCheck,
  Store,
  Calendar,
  IndianRupee,
  Tag,
  Building2,
  FileCheck,
  HelpCircle,
  ChevronRight,
  ArrowLeftRight,
  Phone,
  Mail,
  MessageCircle,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

// The salon OWNER's own account hub — identity, quick access and
// settings. Previously "Profile" in the bottom nav opened the salon's
// public business listing (what a customer sees), with nothing here
// for the owner themselves: no identity header, no settings, no way
// back to the customer app. That content still exists — it's one tap
// away at "Salon Business Listing" — this page is what an owner
// actually expects behind a Profile tab.
export const SalonProfilePage = () => {
  const navigate = useNavigate();
  const { salonProfile, metrics, logout } = useSalon();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/salon/login', { replace: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[480px] min-w-0 bg-transparent font-sans text-stone-900 antialiased min-h-screen pb-24 mx-auto flex flex-col justify-between overflow-x-hidden box-border"
    >
      {/* Owner Identity Header */}
      <header className="bg-stone-900 text-white px-4 pt-4 pb-3.5 rounded-b-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-rose-900/25 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 text-stone-950 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            {salonProfile.ownerName ? salonProfile.ownerName.charAt(0) : 'O'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight truncate">
                {salonProfile.ownerName || 'Salon Owner'}
              </h1>
              <span className="bg-emerald-600 text-white font-black text-[8.5px] px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" />
                Partner
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-tight mt-0.5">{salonProfile.mobile}</p>
            <p className="text-[10px] text-stone-400 truncate leading-tight">{salonProfile.email}</p>
          </div>
        </div>

        {/* Salon identity strip */}
        <div
          onClick={() => navigate('/salon/profile/business')}
          className="mt-3 bg-stone-800/90 rounded-xl p-2.5 border border-rose-400/25 flex items-center justify-between cursor-pointer hover:bg-stone-800 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-rose-400/20 text-rose-300 flex items-center justify-center shrink-0">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-rose-200 block leading-tight truncate">{salonProfile.name}</span>
              <p className="text-[9.5px] text-stone-300 leading-tight">{salonProfile.verificationStatus} • {salonProfile.category} Salon</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        </div>
      </header>

      <main className="p-3.5 flex-1 space-y-3">
        {/* Quick Shortcut Tiles */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div
            onClick={() => navigate('/salon/bookings')}
            className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-900 flex items-center justify-center mx-auto mb-1">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10.5px] font-bold text-stone-800 block">
              Bookings ({metrics.totalBookingsToday})
            </span>
          </div>

          <div
            onClick={() => navigate('/salon/analytics')}
            className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-1">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10.5px] font-bold text-stone-800 block">Payouts</span>
          </div>

          <div
            onClick={() => navigate('/salon/offers')}
            className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-1">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10.5px] font-bold text-stone-800 block">Flash Deals</span>
          </div>
        </div>

        {/* Detailed Options Group */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden text-xs">
          <div
            onClick={() => navigate('/salon/profile/business')}
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-3.5 h-3.5 text-rose-900" />
              <div>
                <p className="font-bold text-stone-900 text-xs">Salon Business Listing</p>
                <p className="text-[10px] text-stone-500">Public profile, hours, amenities &amp; reviews</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </div>

          <div
            onClick={() => navigate('/salon/onboarding')}
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-3.5 h-3.5 text-rose-900" />
              <div>
                <p className="font-bold text-stone-900 text-xs">Documents &amp; Bank KYC</p>
                <p className="text-[10px] text-stone-500">Verification status &amp; settlement account</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </div>

          <div
            onClick={() => setIsSupportOpen(true)}
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-3.5 h-3.5 text-rose-900" />
              <div>
                <p className="font-bold text-stone-900 text-xs">Partner Support</p>
                <p className="text-[10px] text-stone-500">Help with bookings, payouts &amp; your account</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </div>

          <div
            onClick={() => navigate('/customer')}
            className="p-3 flex items-center justify-between cursor-pointer bg-rose-50/50 hover:bg-rose-100/60 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-rose-900" />
              <div>
                <p className="font-bold text-stone-900 text-xs">Switch to Customer App</p>
                <p className="text-[10px] text-stone-500">Book as a customer instead</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-rose-700" />
          </div>
        </div>

        {/* Log Out */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full py-2.5 bg-white border border-stone-300 rounded-xl font-bold text-xs text-stone-700 hover:bg-stone-50 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60"
        >
          <LogOut className="w-3.5 h-3.5 text-stone-500" />
          <span>{isLoggingOut ? 'Logging out…' : 'Log Out'}</span>
        </button>
      </main>

      <InfoSheet
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        icon={<HelpCircle className="w-4 h-4" />}
        title="Partner Support"
      >
        <div className="flex items-center gap-2.5 bg-white/70 rounded-xl p-2.5 border border-purple-100">
          <Phone className="w-3.5 h-3.5 text-brand-maroon shrink-0" />
          <span>Partner Helpline: <b>1800-200-8811</b> (9 AM – 9 PM, all days)</span>
        </div>
        <div className="flex items-center gap-2.5 bg-white/70 rounded-xl p-2.5 border border-purple-100">
          <Mail className="w-3.5 h-3.5 text-brand-maroon shrink-0" />
          <span>partners@instaatrim.com</span>
        </div>
        <div className="flex items-center gap-2.5 bg-white/70 rounded-xl p-2.5 border border-purple-100">
          <MessageCircle className="w-3.5 h-3.5 text-brand-maroon shrink-0" />
          <span>Payout, booking or listing issues — our partner success team responds within 24 hours.</span>
        </div>
      </InfoSheet>
    </motion.div>
  );
};
