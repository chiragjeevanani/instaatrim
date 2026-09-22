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
    <header className="sticky top-0 z-40 w-full max-w-[480px] mx-auto bg-[#faf9f6]/95 backdrop-blur-md pt-2 px-3.5 pb-2 box-border border-b border-stone-200/70 shadow-2xs">
      {/* Top Utility Row: Location & Badges */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5 w-full">
        {/* Location Selector - Slender, delicate, compact */}
        <div
          className="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer active:opacity-75 transition-opacity"
          data-purpose="location-picker"
          onClick={() => navigate('/customer/location')}
        >
          <MapPin className="w-3.5 h-3.5 text-stone-900 shrink-0 stroke-[2]" />
          <div className="truncate leading-none">
            <div className="flex items-center gap-1">
              <span className="font-bold text-[13px] tracking-tight text-stone-900 truncate">
                {currentLocation?.area ? `${currentLocation.area.slice(0, 15)}` : 'South Tukoganj'}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-500 stroke-[2]" />
            </div>
            <p className="text-[9.5px] font-medium text-stone-500 truncate mt-0.5">
              {currentLocation?.landmark || 'Corporate House, Indore'}
            </p>
          </div>
        </div>

        {/* Action Badges (Refer & Earn, Buy Elite, Cart Indicator) */}
        <div className="flex items-center gap-1.5 shrink-0" data-purpose="reward-actions">
          <button
            type="button"
            onClick={() => setIsEliteModalOpen(true)}
            className="flex items-center justify-center bg-[#1e2329] hover:bg-stone-800 text-white px-3 h-[28px] rounded-full border border-stone-700/60 active:scale-95 transition-transform cursor-pointer shadow-2xs"
          >
            <span className="text-[11px] font-serif font-black text-amber-400">Elite</span>
          </button>

          {/* Cart Icon (if items in cart) */}
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 bg-[#1e2329] hover:bg-stone-800 text-white rounded-full shadow-2xs active:scale-95 transition-transform cursor-pointer"
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

      {/* Search Input Bar - Sleek luxury neutral */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch();
        }}
        className="relative w-full bg-stone-200/70 hover:bg-stone-200/90 focus-within:bg-white focus-within:ring-1 focus-within:ring-stone-400 transition-all rounded-xl flex items-center h-[34px] px-2.5 text-xs border border-stone-300/60 shadow-2xs"
        data-purpose="service-search"
      >
        <Search className="w-3.5 h-3.5 text-stone-500 mr-2 shrink-0 stroke-[2]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => onSearchClick && onSearchClick()}
          type="search"
          placeholder="Search for 'Haircut', 'Beard Trim', 'Facial', 'Spa'..."
          aria-label="Search salons and services"
          className="flex-1 min-w-0 bg-transparent border-0 p-0 text-stone-900 placeholder:text-stone-500 font-medium text-[11.5px] focus:outline-none focus:ring-0"
        />
      </form>
    </header>
  );
};
