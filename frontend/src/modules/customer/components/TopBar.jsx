import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { ShoppingBag, Search, MapPin, ChevronDown } from 'lucide-react';

export const TopBar = ({ onSearchClick }) => {
  const navigate = useNavigate();
  const { currentLocation, setIsReferModalOpen, setIsEliteModalOpen, cartItems, setIsCartOpen } = useCustomer();
  const [query, setQuery] = useState('');

  const runSearch = () => {
    if (onSearchClick) {
      onSearchClick();
      return;
    }
    const trimmed = query.trim();
    navigate(trimmed ? `/customer/salons?q=${encodeURIComponent(trimmed)}` : '/customer/salons');
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-[480px] mx-auto bg-[#f8f4fb]/95 backdrop-blur-md pt-1.5 px-3.5 pb-1 box-border border-b border-purple-100">
      {/* Top Utility Row: Location & Badges */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5 w-full">
        {/* Location Selector - Slender, delicate, compact */}
        <div
          className="flex items-center gap-1 flex-1 min-w-0 cursor-pointer active:opacity-75 transition-opacity"
          data-purpose="location-picker"
          onClick={() => navigate('/customer/location')}
        >
          <MapPin className="w-3.5 h-3.5 text-brand-maroon shrink-0 stroke-[1.8]" />
          <div className="truncate leading-none">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[13px] tracking-tight text-stone-800 truncate">
                {currentLocation?.area ? `${currentLocation.area.slice(0, 13)}..` : 'South Tukoga..'}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-500 stroke-[2]" />
            </div>
            <p className="text-[9.5px] font-normal text-stone-500 truncate mt-0.5">
              {currentLocation?.landmark || 'Corporate House'}
            </p>
          </div>
        </div>

        {/* Action Badges (Refer & Earn, Buy Elite, Cart Indicator) */}
        <div className="flex items-center gap-1.5 shrink-0" data-purpose="reward-actions">
          {/* Refer & Earn */}
          <button
            type="button"
            onClick={() => setIsReferModalOpen(true)}
            className="flex items-center gap-1 bg-[#2e1065] text-white px-2 py-0.5 h-[26px] rounded-full text-left active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center text-[8px] text-stone-900 font-bold shrink-0">
              👑
            </div>
            <span className="text-[8px] font-semibold leading-tight text-purple-100">
              Refer &amp;<br />Earn
            </span>
          </button>

          {/* Buy Elite */}
          <button
            type="button"
            onClick={() => setIsEliteModalOpen(true)}
            className="flex flex-col items-center justify-center bg-[#1e1035] text-white px-2.5 h-[26px] rounded-full border border-purple-800/40 active:scale-95 transition-transform min-w-[38px] cursor-pointer"
          >
            <span className="text-[7.5px] text-purple-300 font-normal leading-none">Buy</span>
            <span className="text-[11px] font-serif font-bold text-[#e1b670] leading-none mt-0.5">Elite</span>
          </button>

          {/* Cart Icon (if items in cart) */}
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-1 bg-brand-maroon text-white rounded-full shadow-xs active:scale-95 transition-transform cursor-pointer"
              title="View Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="absolute -top-1 -right-1 bg-amber-400 text-stone-900 text-[8px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                {cartItems.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input Bar - Ultra-slim matching reference */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
        className="relative w-full bg-[#eaddf3] hover:bg-[#e2d2ed] focus-within:bg-[#e2d2ed] transition-colors rounded-xl flex items-center h-[34px] px-2.5 text-xs border border-purple-200/50"
        data-purpose="service-search"
      >
        <Search className="w-3.5 h-3.5 text-purple-600 mr-2 shrink-0 stroke-[1.8]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => onSearchClick && onSearchClick()}
          type="search"
          placeholder="Search for 'Body Polishing'"
          aria-label="Search salons and services"
          className="flex-1 min-w-0 bg-transparent border-0 p-0 text-stone-800 placeholder:text-stone-500 font-normal text-[11.5px] focus:outline-none focus:ring-0"
        />
      </form>
    </header>
  );
};
