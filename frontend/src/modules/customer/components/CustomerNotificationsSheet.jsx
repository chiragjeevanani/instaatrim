import React from 'react';
import { useCustomer } from '../context/CustomerContext';
import { Bell, X, Sparkles, Calendar, Tag, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CustomerNotificationsSheet = ({ isOpen, onClose }) => {
  const { notifications = [], markNotificationRead } = useCustomer();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="w-full max-w-sm bg-[#fbf9fc] h-full shadow-2xl flex flex-col justify-between overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-stone-900 text-white">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm">Notifications &amp; Alerts</h3>
            </div>
            <button onClick={onClose} className="p-1 text-stone-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-20 text-stone-400 text-xs">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <span>You have no new alerts right now.</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-colors cursor-pointer ${
                    n.isRead
                      ? 'bg-white border-stone-200/80 text-stone-600'
                      : 'bg-purple-100/60 border-purple-200 text-stone-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate text-stone-900">{n.title}</span>
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
          <div className="p-3 border-t border-purple-100 bg-white text-center">
            <button
              onClick={onClose}
              className="w-full py-2 bg-brand-maroon hover:bg-brand-darkMaroon text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
