import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import {
  Zap,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  User,
  Store,
  Clock,
  FileCheck,
  Scissors,
  LogOut,
  Sparkles,
  ExternalLink,
  Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SalonTopBar = () => {
  const navigate = useNavigate();
  const {
    salonProfile,
    isStoreOpen,
    setIsStoreOpen,
    isInstantBookingEnabled,
    setIsInstantBookingEnabled,
    instantWaitMinutes,
    setInstantWaitMinutes,
    showToast
  } = useSalon();

  const isApproved = Boolean(salonProfile?.isVerified && salonProfile?.verificationStatus === 'Live');

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const toggleInstant = () => {
    if (!isApproved) {
      showToast('Admin approval required to toggle Instant booking', 'error');
      return;
    }
    const nextState = !isInstantBookingEnabled;
    setIsInstantBookingEnabled(nextState);
    showToast(
      nextState
        ? `Instant Booking LIVE: Customers can book seats ready in ${instantWaitMinutes}m`
        : 'Instant Booking Paused: Only Scheduled appointments accepted'
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-[480px] mx-auto bg-[#f8f4fb]/95 backdrop-blur-md px-3.5 py-2 box-border border-b border-purple-100 shadow-2xs">
      {/* Top Utility Row: Salon Identity & Standard Profile Menu */}
      <div className="flex items-center justify-between gap-2 mb-1.5 relative" ref={menuRef}>
        {/* Salon Brand Button that triggers Profile Menu */}
        <button
          type="button"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="flex items-center gap-2 min-w-0 text-left p-1 -ml-1 rounded-xl hover:bg-white/80 active:scale-[0.98] transition-all cursor-pointer group"
          aria-expanded={isProfileMenuOpen}
          aria-label="Open salon profile menu"
        >
          <div className="relative w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs shrink-0 overflow-hidden ring-1 ring-purple-200/60">
            <img
              src={salonProfile.coverImage}
              alt={salonProfile.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <h1 className="font-bold text-[13px] text-stone-900 tracking-tight leading-none truncate group-hover:text-rose-900 transition-colors">
              {salonProfile.name}
            </h1>
            {isApproved ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2]" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 stroke-[2]" />
            )}
            <ChevronDown
              className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${
                isProfileMenuOpen ? 'rotate-180 text-rose-900' : ''
              }`}
            />
          </div>
        </button>

        {/* Quick Open/Closed Toggle on right */}
        {isApproved ? (
          <button
            type="button"
            onClick={() => {
              setIsStoreOpen(!isStoreOpen);
              showToast(isStoreOpen ? 'Salon marked Closed' : 'Salon marked Open');
            }}
            className={`inline-flex items-center gap-1 text-[9.5px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-all border shrink-0 ${
              isStoreOpen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'
              }`}
            />
            {isStoreOpen ? 'Open' : 'Closed'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              showToast('Salon is pending admin approval. You can open once approved.', 'info');
              navigate('/salon/onboarding');
            }}
            className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800 shrink-0 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Approval
          </button>
        )}

        {/* Standard Profile Dropdown Menu */}
        <AnimatePresence>
          {isProfileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-10 left-0 w-72 bg-white rounded-2xl shadow-xl border border-purple-100 p-2 z-50 overflow-hidden"
            >
              {/* Profile Card Summary */}
              <div className="p-2.5 bg-gradient-to-r from-purple-50 via-rose-50/40 to-purple-50 rounded-xl mb-1.5 border border-purple-100/60">
                <div className="flex items-center gap-2.5">
                  <img
                    src={salonProfile.coverImage}
                    alt={salonProfile.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-purple-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xs font-bold text-stone-900 truncate">
                      {salonProfile.name}
                    </h2>
                    <p className="text-[10px] text-stone-500 truncate">
                      {salonProfile.ownerName || 'Partner'} • {salonProfile.category}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5 text-[9.5px] font-semibold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{isStoreOpen ? 'Store is Open' : 'Store is Closed'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Links & Management Actions */}
              <div className="space-y-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/salon/profile');
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="w-3.5 h-3.5 text-stone-400 stroke-[2]" />
                    <span className="font-semibold text-[11px]">View Salon Profile</span>
                  </div>
                  <span className="text-[10px] text-stone-400">Overview</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/salon/profile/edit');
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-3.5 h-3.5 text-rose-900 stroke-[2]" />
                    <span className="font-semibold text-[11px]">Edit Details & Timings</span>
                  </div>
                  <span className="text-[9.5px] font-bold text-rose-900 bg-rose-50 px-1.5 py-0.5 rounded">
                    Edit
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/salon/onboarding');
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />
                    <span className="font-semibold text-[11px]">KYC & Bank Verification</span>
                  </div>
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/salon/services/new');
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Scissors className="w-3.5 h-3.5 text-stone-400 stroke-[2]" />
                    <span className="font-semibold text-[11px]">Add New Treatment</span>
                  </div>
                  <span className="text-[10px] text-stone-400">+ New</span>
                </button>
              </div>

              {/* Quick Store State Toggle inside dropdown */}
              <div className="mt-1 pt-1 border-t border-stone-100 px-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsStoreOpen(!isStoreOpen);
                    showToast(isStoreOpen ? 'Salon marked Closed' : 'Salon marked Open');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-stone-600 hover:bg-stone-50 rounded-lg text-[10.5px] font-semibold cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Power className={`w-3.5 h-3.5 ${isStoreOpen ? 'text-emerald-600' : 'text-stone-400'}`} />
                    <span>{isStoreOpen ? 'Accepting Customers' : 'Currently Closed'}</span>
                  </div>
                  <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                    isStoreOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {isStoreOpen ? 'Switch to Closed' : 'Open Store'}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instant Booking Master Controller Strip */}
      <div className="flex items-center justify-between bg-stone-50/90 rounded-lg px-2.5 py-1.5 border border-stone-200/70">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
            isInstantBookingEnabled ? 'bg-amber-100 text-amber-800' : 'bg-stone-200/70 text-stone-400'
          }`}>
            <Zap className={`w-3 h-3 stroke-[2] ${isInstantBookingEnabled ? 'fill-amber-500 text-amber-500' : ''}`} />
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[11px] font-bold text-stone-900 leading-none">Instant Walk-In</span>
            <span className={`text-[8.5px] font-bold px-1 py-0.2 rounded leading-tight ${
              isInstantBookingEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
            }`}>
              {isInstantBookingEnabled ? 'Active' : 'Off'}
            </span>
            <span className="text-[9.5px] text-stone-400 hidden sm:inline">•</span>
            <span className="text-[9.5px] text-stone-500 font-normal truncate">
              {isInstantBookingEnabled ? `Ready in ${instantWaitMinutes}m` : 'Scheduled only'}
            </span>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {isInstantBookingEnabled && (
            <select
              value={instantWaitMinutes}
              onChange={(e) => setInstantWaitMinutes(Number(e.target.value))}
              className="text-[9.5px] font-semibold bg-white text-stone-700 px-1.5 py-0.5 rounded border border-stone-200 shadow-2xs outline-none cursor-pointer"
            >
              <option value={10}>10m</option>
              <option value={15}>15m</option>
              <option value={20}>20m</option>
              <option value={30}>30m</option>
            </select>
          )}
          <button
            onClick={toggleInstant}
            className={`w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer relative shadow-inner ${
              isInstantBookingEnabled ? 'bg-rose-900' : 'bg-stone-300'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                isInstantBookingEnabled ? 'translate-x-3' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
