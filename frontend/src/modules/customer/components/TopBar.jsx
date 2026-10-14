import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { ShoppingBag, Search, MapPin, ChevronDown, Bell, Crown, Gift } from 'lucide-react';
import { CustomerNotificationsSheet } from './CustomerNotificationsSheet';

export const TopBar = ({ onSearchClick }) => {
  const navigate = useNavigate();
  const {
    currentLocation,
    setIsReferModalOpen,
    setIsEliteModalOpen,
    cartItems,
    setIsCartOpen,
    notifications = [],
    user
  } = useCustomer();
  const [query, setQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const runSearch = () => {
    if (onSearchClick) {
      onSearchClick();
      return;
    }
    const trimmed = query.trim();
    navigate(trimmed ? `/customer/salons?q=${encodeURIComponent(trimmed)}` : '/customer/salons');
  };

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 w-full max-w-[480px] mx-auto bg-[#f8f4fb]/95 backdrop-blur-md pt-2.5 px-4 pb-2.5 box-border border-b border-purple-100">
        {/* Top Utility Row: Location & Actions */}
        <div className="flex items-center justify-between gap-2 mb-2.5 w-full">
          {/* Location Selector */}
          <button
            type="button"
            className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer active:opacity-75 transition-opacity"
            data-purpose="location-picker"
            onClick={() => navigate('/customer/location')}
          >
            <span className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-brand-maroon stroke-[2]" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="flex items-center gap-0.5">
                <span className="font-bold text-[14px] tracking-tight text-stone-900 truncate">
                  {currentLocation?.area || 'Set your location'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 stroke-[2.2] shrink-0" />
              </span>
              <span className="block text-[11px] text-stone-500 truncate">
                {currentLocation?.landmark || currentLocation?.city || 'Tap to choose an address'}
              </span>
            </span>
          </button>

          {/* Action Buttons (Elite, Refer & Earn, Notifications, Cart) */}
          <div className="flex items-center gap-1.5 shrink-0" data-purpose="reward-actions">
            <button
              type="button"
              onClick={() => setIsEliteModalOpen(true)}
              className={`flex items-center gap-1 h-8 px-2.5 rounded-full text-[11px] font-bold active:scale-95 transition-transform cursor-pointer ${
                user?.is_elite
                  ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-stone-900'
                  : 'bg-[#1e1035] text-[#e1b670]'
              }`}
              aria-label={user?.is_elite ? 'Elite membership' : 'Buy Elite membership'}
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="font-serif">{user?.is_elite ? 'Elite' : 'Get Elite'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsReferModalOpen(true)}
              className="w-8 h-8 rounded-full bg-[#2e1065] text-amber-300 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
              aria-label="Refer and earn"
              title="Refer & Earn"
            >
              <Gift className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsNotifOpen(true)}
              className="relative w-8 h-8 rounded-full bg-white border border-purple-100 text-stone-700 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-brand-maroon text-white text-[9px] font-bold flex items-center justify-center border border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative w-8 h-8 rounded-full bg-brand-maroon text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                aria-label="View cart"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-amber-400 text-stone-900 text-[9px] font-extrabold flex items-center justify-center border border-white">
                  {cartItems.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Search Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch();
          }}
          className="relative w-full bg-white focus-within:bg-white transition-colors rounded-xl flex items-center h-10 px-3 border border-purple-200/70 focus-within:border-brand-maroon/40 shadow-2xs"
          data-purpose="service-search"
        >
          <Search className="w-4 h-4 text-purple-600 mr-2 shrink-0 stroke-[2]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => onSearchClick && onSearchClick()}
            type="search"
            placeholder="Search salons, haircut, facial…"
            aria-label="Search salons and services"
            className="flex-1 min-w-0 bg-transparent border-0 p-0 text-stone-800 placeholder:text-stone-400 font-normal text-[13.5px] focus:outline-none focus:ring-0"
          />
        </form>
    </header>
    <CustomerNotificationsSheet
      isOpen={isNotifOpen}
      onClose={() => setIsNotifOpen(false)}
    />
  </>
  );
};
