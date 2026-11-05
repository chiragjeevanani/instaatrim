import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { requestCurrentPosition, reverseGeocode, searchPlaces } from '../../../shared/lib/geo';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Navigation, Loader2, MapPinOff, CheckCircle2, MapPin } from 'lucide-react';

export const AddressLocationPage = () => {
  const navigate = useNavigate();
  const { currentLocation, setCurrentLocation, savedLocations, addLocation, showToast } = useCustomer();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locateState, setLocateState] = useState('idle'); // idle | locating | error
  const [locateError, setLocateError] = useState(null);

  // Debounced search for cities and localities using geocoding
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const places = await searchPlaces(searchQuery);
        setSearchResults(places);
      } catch (err) {
        console.error('Search places failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLocation = (loc) => {
    setCurrentLocation(loc, true);
    showToast(`Location set to ${loc.area || loc.city}`);
    navigate('/customer');
  };

  const handleUseCurrentLocation = async () => {
    setLocateState('locating');
    setLocateError(null);
    try {
      const { lat, lng } = await requestCurrentPosition();
      const detected = await reverseGeocode(lat, lng);

      const newLoc = {
        id: `gps-${Date.now()}`,
        area: detected.area || 'Current Area',
        city: detected.city || '',
        landmark: detected.landmark || 'Detected via GPS',
        address: detected.address || `${detected.area}, ${detected.city}`,
        pincode: detected.pincode || '',
        lat,
        lng,
        isCurrent: true,
        isGPS: true
      };

      setCurrentLocation(newLoc);

      if (typeof addLocation === 'function') {
        try {
          await addLocation(newLoc);
        } catch {}
      }

      setLocateState('idle');
      showToast(`📍 Location detected: ${newLoc.area}, ${newLoc.city}`);
      navigate('/customer');
    } catch (err) {
      setLocateState('error');
      setLocateError(err.message || 'Could not determine your location.');
    }
  };

  const otherSavedLocations = (savedLocations || []).filter(
    (l) => l.id !== currentLocation?.id && l.area !== currentLocation?.area
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full flex justify-center items-start min-h-screen lg:min-h-0 text-stone-900 antialiased select-none bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] lg:bg-none"
    >
      <div className="relative w-full max-w-[480px] lg:max-w-2xl lg:my-8 min-w-0 min-h-screen lg:min-h-0 bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] flex flex-col overflow-y-auto border-x lg:border border-purple-200/50 lg:rounded-3xl lg:shadow-sm box-border pb-8">
        
        {/* Top Header & Search Area */}
        <div className="relative z-10 w-full flex flex-col pt-3 px-3.5 lg:pt-6 lg:px-6">
          <nav className="flex items-center gap-2 mb-2.5">
            <button
              aria-label="Go back"
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 text-stone-700 hover:text-black active:scale-95 transition-transform cursor-pointer"
              type="button"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2]" />
            </button>
            <h1 className="text-sm font-bold text-stone-900 tracking-tight">Select Location / City</h1>
          </nav>

          {/* Search Bar for Any City / Area */}
          <div className="w-full relative">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 pointer-events-none stroke-[1.8]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[38px] pl-8 pr-8 text-[13px] bg-white text-stone-900 placeholder:text-stone-400 rounded-2xl border border-purple-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-maroon/20 focus:border-brand-maroon transition-all"
                placeholder="Search city, area, locality..."
                type="text"
                autoFocus
              />
              {isSearching && (
                <Loader2 className="w-3.5 h-3.5 text-brand-maroon animate-spin absolute right-3" />
              )}
            </div>
          </div>
        </div>

        {/* Live Search Results (if user types) */}
        {searchResults.length > 0 && (
          <div className="px-3.5 lg:px-6 mt-3">
            <div className="bg-white rounded-2xl border border-purple-100 shadow-md overflow-hidden divide-y divide-stone-100">
              <div className="px-3 py-2 bg-stone-50 text-[10.5px] font-bold text-stone-500 uppercase tracking-wider">
                Matching Places
              </div>
              {searchResults.map((place, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectLocation({
                    id: `place-${idx}-${Date.now()}`,
                    area: place.area,
                    city: place.city,
                    address: place.address,
                    pincode: place.pincode,
                    lat: place.lat,
                    lng: place.lng
                  })}
                  className="p-3 hover:bg-purple-50/60 active:bg-purple-100 cursor-pointer transition-colors flex items-start gap-2.5"
                >
                  <MapPin className="w-4 h-4 text-brand-maroon shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 truncate">{place.area || place.city}</p>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{place.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Use Current GPS Location Button */}
        <div className="px-3.5 lg:px-6 mt-3">
          <button
            onClick={handleUseCurrentLocation}
            disabled={locateState === 'locating'}
            className="w-full h-[44px] bg-gradient-to-r from-brand-maroon to-purple-900 hover:opacity-95 active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            type="button"
          >
            {locateState === 'locating' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Detecting precise GPS location…</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 fill-current" />
                <span>Use Current Device Location (GPS)</span>
              </>
            )}
          </button>

          <AnimatePresence>
            {locateState === 'error' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-start gap-2"
              >
                <MapPinOff className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-700 leading-snug">{locateError}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Current Active Location Display */}
        {currentLocation && (
          <div className="px-3.5 lg:px-6 mt-4">
            <div className="p-3 bg-white/90 rounded-2xl border-2 border-brand-maroon/30 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-brand-maroon/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-brand-maroon" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-brand-maroon tracking-wider">Live Active Location</span>
                    {currentLocation?.isGPS && (
                      <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.2 rounded-full">GPS Live</span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-stone-900 truncate">
                    {currentLocation.area && currentLocation.area.toLowerCase() !== (currentLocation.city || '').toLowerCase()
                      ? `${currentLocation.area}, ${currentLocation.city}`
                      : (currentLocation.landmark ? `${currentLocation.landmark}, ${currentLocation.city}` : currentLocation.city)}
                  </p>
                  <p className="text-[10.5px] text-stone-500 line-clamp-2 mt-0.5 leading-snug">{currentLocation.address}</p>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-brand-maroon shrink-0 ml-2" />
            </div>
          </div>
        )}

        {/* Saved Addresses list */}
        {otherSavedLocations.length > 0 && (
          <div className="px-3.5 lg:px-6 mt-4">
            <div className="mb-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Saved Addresses
              </span>
            </div>

            <div className="space-y-2">
              {otherSavedLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  className="p-3 rounded-xl bg-white border border-stone-200 hover:border-purple-300 cursor-pointer transition-colors flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900">{loc.area || loc.city}</p>
                    <p className="text-[10px] text-stone-500 truncate mt-0.5">{loc.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer info note */}
        <div className="mt-8 px-6 text-center">
          <p className="text-[11px] text-stone-400">
            Salons and services are dynamically displayed based on your selected city and area.
          </p>
        </div>

      </div>
    </motion.div>
  );
};
