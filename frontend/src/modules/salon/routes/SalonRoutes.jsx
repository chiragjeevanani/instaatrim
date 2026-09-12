import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { SalonTopBar } from '../components/SalonTopBar';
import { SalonBottomNav } from '../components/SalonBottomNav';
import { SalonDashboardPage } from '../pages/SalonDashboardPage';
import { SalonBookingsPage } from '../pages/SalonBookingsPage';
import { SalonServicesPage } from '../pages/SalonServicesPage';
import { SalonOffersPage } from '../pages/SalonOffersPage';
import { SalonAnalyticsPage } from '../pages/SalonAnalyticsPage';
import { SalonProfilePage } from '../pages/SalonProfilePage';
import { SalonOnboardingPage } from '../pages/SalonOnboardingPage';
import { motion, AnimatePresence } from 'framer-motion';

export const SalonRoutes = () => {
  const location = useLocation();
  const { toast } = useSalon();

  const isOnboarding = location.pathname.includes('/salon/onboarding');

  return (
    <div className="min-h-screen bg-[#f8f7f5] text-stone-900 flex justify-center antialiased select-none overflow-x-hidden">
      <div className="w-full max-w-[480px] min-w-0 min-h-screen flex flex-col justify-between relative border-x border-stone-200/80 bg-white/40 shadow-sm box-border">
        {/* Top Operational Header */}
        {!isOnboarding && <SalonTopBar />}

        {/* Dynamic Route Pages */}
        <div className="flex-1 w-full min-w-0">
          <Routes>
            <Route path="/" element={<SalonDashboardPage />} />
            <Route path="/bookings" element={<SalonBookingsPage />} />
            <Route path="/services" element={<SalonServicesPage />} />
            <Route path="/offers" element={<SalonOffersPage />} />
            <Route path="/analytics" element={<SalonAnalyticsPage />} />
            <Route path="/profile" element={<SalonProfilePage />} />
            <Route path="/onboarding" element={<SalonOnboardingPage />} />
          </Routes>
        </div>

        {/* Mobile Navigation Bar */}
        {!isOnboarding && <SalonBottomNav />}

        {/* Global Operational Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg max-w-[340px] text-center pointer-events-none ${
                toast.type === 'error'
                  ? 'bg-red-900 text-white'
                  : 'bg-stone-900/95 text-white backdrop-blur-md border border-purple-300/30'
              }`}
            >
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
