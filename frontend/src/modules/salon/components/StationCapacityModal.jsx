import React, { useEffect } from 'react';
import { useSalon } from '../context/SalonContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Armchair, Plus, Minus, Info } from 'lucide-react';

export const StationCapacityModal = ({ isOpen, onClose }) => {
  const { occupiedChairs, setOccupiedChairs, metrics, showToast, openModal, closeModal } = useSalon();

  // Prevent background scrolling and notify context when modal is open
  useEffect(() => {
    if (isOpen) {
      openModal();
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        closeModal();
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalChairs = metrics.totalChairs || 4;
  const availableChairs = Math.max(0, totalChairs - occupiedChairs);

  const handleOccupy = () => {
    if (occupiedChairs < totalChairs) {
      setOccupiedChairs(occupiedChairs + 1);
      showToast(`1 station occupied (${occupiedChairs + 1}/${totalChairs} in use)`);
    }
  };

  const handleRelease = () => {
    if (occupiedChairs > 0) {
      setOccupiedChairs(occupiedChairs - 1);
      showToast(`1 station freed (${availableChairs + 1} stations ready)`);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Centered Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[420px] bg-[#fbfaf9] rounded-2xl shadow-elevated max-h-[88vh] flex flex-col z-10 overflow-hidden border border-stone-200/90"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-stone-200/80 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
                <Armchair className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-xs sm:text-[13px] leading-tight">Station Capacity</h3>
                <p className="text-[10px] text-stone-500 leading-tight">Live chair & stylist availability</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>

          {/* Scrollable Modal Content */}
          <div className="p-3 space-y-2.5 overflow-y-auto flex-1 overscroll-contain">
            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl p-2.5 border border-stone-200/80 text-center">
                <span className="text-[10px] font-medium text-stone-500 block">Occupied Chairs</span>
                <span className="text-xl font-bold text-stone-900 mt-0.5 block leading-tight">
                  {occupiedChairs} <span className="text-[11px] text-stone-400 font-normal">/ {totalChairs}</span>
                </span>
                <span className="text-[9px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded-full inline-block mt-0.5">
                  {Math.round((occupiedChairs / totalChairs) * 100)}% load
                </span>
              </div>

              <div className="bg-white rounded-xl p-2.5 border border-stone-200/80 text-center">
                <span className="text-[10px] font-medium text-stone-500 block">Ready For Service</span>
                <span className="text-xl font-bold text-emerald-600 mt-0.5 block leading-tight">
                  {availableChairs} <span className="text-[11px] text-stone-400 font-normal">free</span>
                </span>
                <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded-full inline-block mt-0.5">
                  Instant ready
                </span>
              </div>
            </div>

            {/* Stepper Control */}
            <div className="bg-white rounded-xl p-2.5 border border-stone-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-stone-900">Adjust Occupancy</span>
                <span className="text-[10px] text-stone-400">Live Counter</span>
              </div>

              <div className="flex items-center justify-between bg-stone-50 rounded-lg p-1.5 border border-stone-200/70">
                <button
                  type="button"
                  onClick={handleRelease}
                  disabled={occupiedChairs <= 0}
                  className="w-8 h-8 rounded-md bg-white hover:bg-stone-100 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-stone-800 flex items-center justify-center border border-stone-200 shadow-2xs font-bold transition-all cursor-pointer"
                  title="Free 1 chair"
                >
                  <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                <div className="text-center">
                  <div className="text-base font-bold text-stone-900 leading-tight">
                    {occupiedChairs} of {totalChairs}
                  </div>
                  <span className="text-[9.5px] text-stone-500">Occupied Stations</span>
                </div>

                <button
                  type="button"
                  onClick={handleOccupy}
                  disabled={occupiedChairs >= totalChairs}
                  className="w-8 h-8 rounded-md bg-rose-900 hover:bg-rose-950 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center shadow-2xs font-bold transition-all cursor-pointer"
                  title="Occupy 1 chair"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Individual Chair Visualizer */}
            <div className="bg-white rounded-xl p-2.5 border border-stone-200/80">
              <span className="text-[11px] font-bold text-stone-900 block mb-1.5">Station Overview</span>
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: totalChairs }).map((_, idx) => {
                  const isOccupied = idx < occupiedChairs;
                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                        isOccupied
                          ? 'bg-rose-50/60 border-rose-200/80'
                          : 'bg-emerald-50/50 border-emerald-200/80'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 shadow-2xs bg-white border border-stone-200/60">
                          <Armchair className={`w-3 h-3 stroke-[2] ${isOccupied ? 'text-rose-700' : 'text-emerald-600'}`} />
                        </div>
                        <span className="font-bold text-[11px] text-stone-900 leading-tight">
                          Station {idx + 1}
                        </span>
                      </div>
                      <div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded leading-tight inline-block ${
                          isOccupied ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isOccupied ? '● Occupied' : '● Ready'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-start gap-1.5 bg-stone-100/70 p-2 rounded-lg text-[10px] text-stone-600 leading-tight">
              <Info className="w-3 h-3 text-stone-500 shrink-0 mt-0.5" />
              <span>Available stations directly power customer-side Instant Walk-in dispatch.</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
