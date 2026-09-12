import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { Zap, ShieldCheck } from 'lucide-react';

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

  const toggleInstant = () => {
    const nextState = !isInstantBookingEnabled;
    setIsInstantBookingEnabled(nextState);
    showToast(
      nextState
        ? `Instant Booking LIVE: Customers can book seats ready in ${instantWaitMinutes}m`
        : 'Instant Booking Paused: Only Scheduled appointments accepted'
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-[480px] mx-auto bg-white/95 backdrop-blur-md px-3.5 py-2 box-border border-b border-stone-200/80 shadow-2xs">
      {/* Top Utility Row: Salon Identity */}
      <div className="flex items-center justify-between gap-2.5 mb-1.5">
        {/* Salon Brand & Status */}
        <div
          onClick={() => navigate('/salon/profile')}
          className="flex items-center justify-between w-full cursor-pointer group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-[10px] shadow-2xs shrink-0 overflow-hidden ring-1 ring-black/5">
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
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2]" />
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsStoreOpen(!isStoreOpen);
              showToast(isStoreOpen ? 'Salon marked Closed' : 'Salon marked Open');
            }}
            className={`inline-flex items-center gap-1 text-[9.5px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-all border shrink-0 ${
              isStoreOpen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
            {isStoreOpen ? 'Open' : 'Closed'}
          </button>
        </div>
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
