import React, { useState, useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scissors, Zap, Check, IndianRupee, Clock } from 'lucide-react';

export const ServiceModal = ({ isOpen, onClose, editingService }) => {
  const { addService, updateService } = useSalon();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Waxing');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('45 mins');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [isInstantEligible, setIsInstantEligible] = useState(true);

  useEffect(() => {
    if (editingService) {
      setName(editingService.name || '');
      setCategory(editingService.category || 'Waxing');
      setDescription(editingService.description || '');
      setDuration(editingService.duration || '45 mins');
      setPrice(editingService.price || '');
      setOriginalPrice(editingService.originalPrice || '');
      setIsInstantEligible(editingService.isInstantEligible ?? true);
    } else {
      setName('');
      setCategory('Waxing');
      setDescription('');
      setDuration('45 mins');
      setPrice('');
      setOriginalPrice('');
      setIsInstantEligible(true);
    }
  }, [editingService, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const servicePayload = {
      name,
      category,
      description,
      duration,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Math.round(Number(price) * 1.4),
      isInstantEligible
    };

    if (editingService) {
      updateService(editingService.id, servicePayload);
    } else {
      addService(servicePayload);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative w-full max-w-[440px] bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col z-10 overflow-hidden border-t sm:border border-purple-200/80"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-white/90 border-b border-purple-200/60 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-purple-100 text-brand-maroon flex items-center justify-center">
                <Scissors className="w-3.5 h-3.5 stroke-[1.8]" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 text-xs sm:text-sm">
                  {editingService ? 'Edit Service Details' : 'Add New Service'}
                </h3>
                <p className="text-[10px] text-stone-500 font-normal">Manage catalog pricing &amp; express availability</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:text-stone-800">
              <X className="w-4 h-4 stroke-[1.8]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-3.5 space-y-2.5 overflow-y-auto">
            {/* Service Name */}
            <div>
              <label className="text-[10px] font-medium text-stone-600 block mb-1">Service Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Lotus Crystal Radiance Facial"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white text-xs text-stone-800 rounded-xl border border-stone-300 p-2 outline-none focus:border-brand-maroon font-normal"
              />
            </div>

            {/* Category & Duration */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-medium text-stone-600 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white text-xs text-stone-800 rounded-xl border border-stone-300 p-2 outline-none font-normal"
                >
                  <option value="Waxing">Waxing</option>
                  <option value="Facial">Facial</option>
                  <option value="Spa">Spa &amp; Massage</option>
                  <option value="Body Polishing">Body Polishing</option>
                  <option value="Mani-Pedi">Mani-Pedi</option>
                  <option value="Hair Studio">Hair Studio</option>
                  <option value="Cleanup">Clean-Up</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-medium text-stone-600 block mb-1">Estimated Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-white text-xs text-stone-800 rounded-xl border border-stone-300 p-2 outline-none font-normal"
                >
                  <option value="30 mins">30 mins</option>
                  <option value="45 mins">45 mins</option>
                  <option value="1 hr">1 hr</option>
                  <option value="1 hr 15 mins">1 hr 15 mins</option>
                  <option value="1 hr 30 mins">1 hr 30 mins</option>
                  <option value="2 hrs">2 hrs</option>
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-medium text-stone-600 block mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  required
                  min="50"
                  placeholder="e.g. 799"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-white text-xs text-stone-800 rounded-xl border border-stone-300 p-2 outline-none focus:border-brand-maroon font-normal"
                />
              </div>

              <div>
                <label className="text-[10px] font-medium text-stone-600 block mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1299"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full bg-white text-xs text-stone-800 rounded-xl border border-stone-300 p-2 outline-none font-normal"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-medium text-stone-600 block mb-1">Description &amp; Inclusions</label>
              <textarea
                rows={2}
                placeholder="Product formulations, benefits, steps included..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white text-xs text-stone-800 rounded-xl border border-stone-300 p-2 outline-none focus:border-brand-maroon resize-none font-normal"
              />
            </div>

            {/* Section 42.6: Instant Booking Eligibility Switch */}
            <div className="bg-white rounded-xl p-2.5 border border-purple-100 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isInstantEligible ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-400'}`}>
                  <Zap className={`w-3 h-3 stroke-[1.8] ${isInstantEligible ? 'fill-amber-500 text-amber-500' : ''}`} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-stone-800 block leading-tight">
                    Instant Booking Eligible
                  </span>
                  <p className="text-[9.5px] text-stone-500 leading-tight mt-0.5 font-normal">
                    Show in "Ready Now in 15 mins" express bookings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInstantEligible(!isInstantEligible)}
                className={`w-8 h-[18px] rounded-full p-0.5 transition-colors cursor-pointer relative ${
                  isInstantEligible ? 'bg-brand-maroon' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                    isInstantEligible ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-2 bg-brand-maroon hover:bg-brand-darkMaroon active:scale-[0.985] text-white font-medium text-[11px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 mt-2"
            >
              <Check className="w-3.5 h-3.5 stroke-[2]" />
              <span>{editingService ? 'Save Changes' : 'Add to Catalog'}</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
