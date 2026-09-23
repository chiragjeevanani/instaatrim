import React from 'react';
import { useSalon } from '../context/SalonContext';
import { Bell, Check, Sparkles, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SalonNotificationSheet = ({ isOpen, onClose }) => {
  const { notifications = [], markNotificationRead } = useSalon();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm">Partner Notifications</h3>
            </div>
            <button onClick={onClose} className="p-1 text-stone-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-stone-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <span>No announcements or alerts yet.</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-colors cursor-pointer ${
                    n.isRead
                      ? 'bg-stone-50 border-stone-200/80 text-stone-600'
                      : 'bg-purple-50/70 border-purple-200 text-stone-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">{n.title}</span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-stone-700">{n.message}</p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-stone-200 bg-stone-50 text-center">
            <button
              onClick={onClose}
              className="w-full py-2 bg-stone-900 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
