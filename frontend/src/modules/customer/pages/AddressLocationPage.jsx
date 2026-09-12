import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { mockLocations } from '../data/mockData';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Navigation } from 'lucide-react';

export const AddressLocationPage = () => {
  const navigate = useNavigate();
  const { currentLocation, setCurrentLocation, savedLocations, showToast } = useCustomer();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = savedLocations.filter(
    (loc) =>
      loc.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (loc) => {
    setCurrentLocation(loc);
    showToast(`Location set to ${loc.area}`);
    navigate('/customer');
  };

  const handleUseCurrentLocation = () => {
    const defaultCurrent = mockLocations[0];
    setCurrentLocation(defaultCurrent);
    showToast('Detected location: South Tukoganj');
    navigate('/customer');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full flex justify-center items-start min-h-screen text-stone-900 antialiased select-none bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5]"
    >
      <div className="relative w-full max-w-[480px] min-w-0 min-h-screen bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] flex flex-col justify-between overflow-hidden border-x border-purple-200/50 box-border">
        {/* Background Illustration Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-85">
          <img
            alt="Isometric City Illustration"
            className="w-full h-full object-cover object-bottom"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlTjjswxFLsYZZVJgio9zBctRsC7XV7377gRTnXT8Yj5t1GJ9j_1Dmp41EU_V_gKu0BKtvxDPSHOYD5O8m3ikijcWiiz6JXbhuIAmkqSDwKgJEhjzsYJsC2gi7cHHWK_bKjaGZAivzyHA4Av_6NOkzjSgDyRMvguCAARr8DxdX9359ZdeaZlWFM51htJvVrzWvqlPX2QmGipTsawAdKbvzLuMnJqyZOsQ7M2_b7CgpJi9ggNXpitZM8InyjAJbGFBflJw"
          />
          {/* Soft Gradient Mask for seamless blend */}
          <div className="absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-[#f8f4fb] via-[#f8f4fb]/90 to-transparent"></div>
        </div>

        {/* Top Header & Search Area */}
        <div className="relative z-10 w-full flex flex-col pt-3 px-3.5">
          {/* Header Nav - Compact & Slender */}
          <nav className="flex items-center gap-2 mb-2.5">
            <button
              aria-label="Go back"
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 text-stone-700 hover:text-black active:scale-95 transition-transform"
              type="button"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2]" />
            </button>
            <h1 className="text-sm font-bold text-stone-900 tracking-tight">Add Address</h1>
          </nav>

          {/* Search Bar - Styled identically to Home page search bar */}
          <div className="w-full relative">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 pointer-events-none stroke-[1.8]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[34px] pl-8 pr-3 text-[12px] bg-[#eaddf3] text-stone-900 placeholder:text-stone-500 rounded-2xl border border-purple-200/60 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all"
                placeholder="Search area, street name..."
                type="text"
              />
            </div>
          </div>

          {/* Search Suggestions dropdown */}
          {searchQuery && (
            <div className="mt-2 bg-white/95 backdrop-blur-md rounded-xl p-2 border border-stone-200 shadow-md space-y-1 z-30">
              {filteredLocations.length === 0 ? (
                <p className="text-xs text-stone-500 p-2 text-center">No location found matching "{searchQuery}"</p>
              ) : (
                filteredLocations.map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => handleSelectLocation(loc)}
                    className="p-2 rounded-lg hover:bg-stone-50 cursor-pointer text-left transition-colors"
                  >
                    <p className="text-xs font-bold text-stone-900">{loc.area}</p>
                    <p className="text-[10px] text-stone-500 truncate">{loc.address}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Subtitle Notice */}
          {!searchQuery && (
            <div className="mt-3.5 text-center flex flex-col items-center px-2">
              <p className="text-[11px] text-stone-500 font-medium">
                You don't have any saved address
              </p>
              <h2 className="text-xs font-bold text-stone-800 tracking-tight mt-0.5">
                Add your address now to continue
              </h2>
            </div>
          )}
        </div>

        {/* Center Pin & Detected Location */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-6 pointer-events-none px-4">
          <div className="relative flex flex-col items-center animate-bounce duration-1000">
            {/* Slender Royal Violet Pin */}
            <svg className="w-8 h-8 text-brand-maroon drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
              <path
                clipRule="evenodd"
                d="M11.54 22.351A2.42 2.42 0 018.66 21.05C6.037 17.514 3.75 13.902 3.75 10.5a8.25 8.25 0 1116.5 0c0 3.402-2.287 7.014-4.91 10.55a2.42 2.42 0 01-2.88 1.301zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                fillRule="evenodd"
              ></path>
            </svg>
            <div className="w-5 h-1 bg-black/20 rounded-full blur-[1px] mt-0.5"></div>
          </div>

          {/* Detected Location Badge - Compact & Clean */}
          <div className="mt-2.5 bg-white/95 backdrop-blur-md py-2 px-3.5 rounded-xl border border-stone-200/80 shadow-sm text-center max-w-[260px]">
            <h3 className="font-bold text-stone-900 text-[11.5px] leading-tight">
              {currentLocation?.area || 'South Tukoganj'}
            </h3>
            <p className="text-[9.5px] text-stone-500 leading-tight mt-0.5">
              {currentLocation?.address || 'South Tukoganj, Indore, Madhya Pradesh, 452001, India'}
            </p>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="relative z-20 w-full px-4 pb-5 pt-2 bg-gradient-to-t from-[#ede1f5] via-[#ede1f5]/90 to-transparent">
          <button
            onClick={handleUseCurrentLocation}
            className="w-full h-[38px] bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            data-purpose="use-current-location-button"
            type="button"
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
            <span>Use Current Location</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
