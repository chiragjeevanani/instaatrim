import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { requestCurrentPosition, nearestKnownLocality } from '../../../shared/lib/geo';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Navigation, Loader2, MapPinOff, Plus, CheckCircle2, MapPin } from 'lucide-react';

// SRS §6.2 fix: this page used to be titled "Add Address" while having no
// way to add one — "Use Current Location" just assigned a hardcoded mock
// entry, and there was no manual City / Area / Landmark / PIN form at all.
// It now requests real device location with proper permission-state
// handling, and offers a genuine manual-entry form.
export const AddressLocationPage = () => {
  const navigate = useNavigate();
  const { currentLocation, setCurrentLocation, savedLocations, addLocation, showToast } = useCustomer();
  const [searchQuery, setSearchQuery] = useState('');
  const [locateState, setLocateState] = useState('idle'); // idle | locating | error
  const [locateError, setLocateError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ area: '', landmark: '', city: 'Indore', pincode: '' });
  const [formErrors, setFormErrors] = useState({});

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

  const handleUseCurrentLocation = async () => {
    setLocateState('locating');
    setLocateError(null);
    try {
      const { lat, lng } = await requestCurrentPosition();
      const nearest = nearestKnownLocality(lat, lng);
      const newLoc = await addLocation({
        area: nearest.area,
        address: `Near ${nearest.area}, ${nearest.city}, ${nearest.pincode} (from device location)`,
        landmark: 'Detected via GPS',
        city: nearest.city,
        pincode: nearest.pincode,
        lat,
        lng
      });
      setLocateState('idle');
      showToast(`Detected location: ${newLoc.area}`);
      navigate('/customer');
    } catch (err) {
      setLocateState('error');
      setLocateError(err.message || 'Could not determine your location.');
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.area.trim()) errors.area = 'Area is required';
    if (!form.city.trim()) errors.city = 'City is required';
    if (!/^\d{6}$/.test(form.pincode.trim())) errors.pincode = 'Enter a valid 6-digit PIN code';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddManualAddress = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const newLoc = await addLocation({
      area: form.area.trim(),
      landmark: form.landmark.trim(),
      city: form.city.trim(),
      pincode: form.pincode.trim(),
      address: `${form.area.trim()}${form.landmark ? ', ' + form.landmark.trim() : ''}, ${form.city.trim()}, ${form.pincode.trim()}`
    });
    showToast(`Address saved: ${newLoc.area}`);
    setIsFormOpen(false);
    setForm({ area: '', landmark: '', city: 'Indore', pincode: '' });
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
      <div className="relative w-full max-w-[480px] min-w-0 min-h-screen bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] flex flex-col overflow-y-auto border-x border-purple-200/50 box-border pb-8">
        {/* Top Header & Search Area */}
        <div className="relative z-10 w-full flex flex-col pt-3 px-3.5">
          <nav className="flex items-center gap-2 mb-2.5">
            <button
              aria-label="Go back"
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 text-stone-700 hover:text-black active:scale-95 transition-transform cursor-pointer"
              type="button"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2]" />
            </button>
            <h1 className="text-sm font-bold text-stone-900 tracking-tight">Your Addresses</h1>
          </nav>

          {/* Search Bar */}
          <div className="w-full relative">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 pointer-events-none stroke-[1.8]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[34px] pl-8 pr-3 text-[12px] bg-[#eaddf3] text-stone-900 placeholder:text-stone-500 rounded-2xl border border-purple-200/60 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all"
                placeholder="Search saved addresses..."
                type="text"
              />
            </div>
          </div>
        </div>

        {/* Use current location */}
        <div className="px-3.5 mt-3">
          <button
            onClick={handleUseCurrentLocation}
            disabled={locateState === 'locating'}
            className="w-full h-[42px] bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
            type="button"
          >
            {locateState === 'locating' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Getting your location…</span>
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5 fill-current" />
                <span>Use Current Location</span>
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

        {/* Saved addresses list */}
        <div className="px-3.5 mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              {searchQuery ? 'Search Results' : 'Saved Addresses'}
            </span>
            <button
              onClick={() => setIsFormOpen((v) => !v)}
              className="flex items-center gap-1 text-[10.5px] font-bold text-brand-maroon active:opacity-70"
              type="button"
            >
              <Plus className="w-3 h-3" />
              Add New
            </button>
          </div>

          <AnimatePresence>
            {isFormOpen && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddManualAddress}
                className="bg-white rounded-xl border border-stone-200 shadow-xs p-3 mb-3 space-y-2 overflow-hidden"
              >
                <div>
                  <label htmlFor="addr-area" className="text-[10px] font-bold text-stone-500 block mb-1">Area *</label>
                  <input
                    id="addr-area"
                    value={form.area}
                    onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                    placeholder="e.g. Vijay Nagar"
                    className="w-full h-9 px-2.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-maroon"
                  />
                  {formErrors.area && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.area}</p>}
                </div>
                <div>
                  <label htmlFor="addr-landmark" className="text-[10px] font-bold text-stone-500 block mb-1">Landmark</label>
                  <input
                    id="addr-landmark"
                    value={form.landmark}
                    onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))}
                    placeholder="e.g. Near C21 Mall"
                    className="w-full h-9 px-2.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-maroon"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="addr-city" className="text-[10px] font-bold text-stone-500 block mb-1">City *</label>
                    <input
                      id="addr-city"
                      value={form.city}
                      onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      className="w-full h-9 px-2.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-maroon"
                    />
                    {formErrors.city && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="addr-pin" className="text-[10px] font-bold text-stone-500 block mb-1">PIN Code *</label>
                    <input
                      id="addr-pin"
                      value={form.pincode}
                      inputMode="numeric"
                      maxLength={6}
                      onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, '') }))}
                      className="w-full h-9 px-2.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-maroon"
                    />
                    {formErrors.pincode && <p className="text-[10px] text-red-600 mt-0.5">{formErrors.pincode}</p>}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full h-9 bg-stone-900 text-white text-xs font-bold rounded-lg mt-1 active:scale-[0.98] transition-transform"
                >
                  Save Address
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            {filteredLocations.length === 0 ? (
              <p className="text-xs text-stone-500 p-3 text-center bg-white/60 rounded-xl border border-dashed border-stone-300">
                {searchQuery ? `No saved address matches "${searchQuery}"` : 'No saved addresses yet — add one above.'}
              </p>
            ) : (
              filteredLocations.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  className={`p-3 rounded-xl bg-white border cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                    currentLocation?.id === loc.id ? 'border-brand-maroon shadow-xs' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-stone-900">{loc.area}</p>
                      {currentLocation?.id === loc.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-maroon shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-stone-500 truncate mt-0.5">{loc.address}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Decorative footer strip — keeps the page from ending in bare empty space when the address list is short */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 py-8 text-center min-h-[140px]">
          <div className="w-11 h-11 rounded-2xl bg-white/70 border border-purple-200/60 flex items-center justify-center shadow-xs">
            <MapPin className="w-5 h-5 text-brand-maroon" />
          </div>
          <p className="text-[11px] text-stone-500 max-w-[220px] leading-relaxed">
            We use your address to show salons that are actually nearby and estimate accurate travel time.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
