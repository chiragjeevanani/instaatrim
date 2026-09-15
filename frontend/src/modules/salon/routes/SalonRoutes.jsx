import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { SalonTopBar } from '../components/SalonTopBar';
import { SalonBottomNav } from '../components/SalonBottomNav';
import { SalonLoginPage } from '../pages/SalonLoginPage';
import { SalonDashboardPage } from '../pages/SalonDashboardPage';
import { SalonBookingsPage } from '../pages/SalonBookingsPage';
import { SalonServicesPage } from '../pages/SalonServicesPage';
import { SalonOffersPage } from '../pages/SalonOffersPage';
import { SalonAnalyticsPage } from '../pages/SalonAnalyticsPage';
import { SalonProfilePage } from '../pages/SalonProfilePage';
import { SalonBusinessProfilePage } from '../pages/SalonBusinessProfilePage';
import { EditSalonProfilePage } from '../pages/EditSalonProfilePage';
import { SalonOnboardingPage } from '../pages/SalonOnboardingPage';
import { SalonRegistrationPage } from '../pages/SalonRegistrationPage';
import { AddServicePage } from '../pages/AddServicePage';
import { motion, AnimatePresence } from 'framer-motion';

// Routes reachable without a partner session — login and registration/onboarding
const PUBLIC_PATHS = ['/salon/login', '/salon/onboarding', '/salon/register'];

export const SalonRoutes = () => {
  const location = useLocation();
  const { toast, isAuthenticated } = useSalon();

  const isPublicPath = PUBLIC_PATHS.some((p) => location.pathname.startsWith(p));

  // The actual auth gate — previously every /salon/* route was reachable
  // by anyone with no credential check at all. An unauthenticated visitor
  // is sent to the login screen; a logged-in partner who lands on the
  // login screen is sent straight to their dashboard instead.
  if (!isAuthenticated && !isPublicPath) {
    return <Navigate to="/salon/login" replace />;
  }
  if (isAuthenticated && (location.pathname.startsWith('/salon/login') || location.pathname.startsWith('/salon/register'))) {
    return <Navigate to="/salon" replace />;
  }

  const isFullscreenSubpage =
    location.pathname.includes('/salon/login') ||
    location.pathname.includes('/salon/register') ||
    location.pathname.includes('/salon/onboarding') ||
    location.pathname.includes('/salon/services/new') ||
    location.pathname.includes('/salon/services/edit') ||
    location.pathname.includes('/salon/profile/edit') ||
    location.pathname.includes('/salon/profile/business');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f4fb] via-[#f3ebf8] to-[#ede1f5] text-stone-900 flex justify-center antialiased select-none">
      <div className="w-full max-w-[480px] min-w-0 min-h-screen flex flex-col relative border-x border-purple-200/50 bg-transparent shadow-sm box-border">
        {/* Top Operational Header */}
        {!isFullscreenSubpage && <SalonTopBar />}

        {/* Dynamic Route Pages */}
        <div className="flex-1 w-full min-w-0">
          <Routes>
            <Route path="/login" element={<SalonLoginPage />} />
            <Route path="/register" element={<SalonRegistrationPage />} />
            <Route path="/" element={<SalonDashboardPage />} />
            <Route path="/bookings" element={<SalonBookingsPage />} />
            <Route path="/services" element={<SalonServicesPage />} />
            <Route path="/services/new" element={<AddServicePage />} />
            <Route path="/services/edit/:id" element={<AddServicePage />} />
            <Route path="/offers" element={<SalonOffersPage />} />
            <Route path="/analytics" element={<SalonAnalyticsPage />} />
            <Route path="/profile" element={<SalonProfilePage />} />
            <Route path="/profile/business" element={<SalonBusinessProfilePage />} />
            <Route path="/profile/edit" element={<EditSalonProfilePage />} />
            <Route path="/onboarding" element={<SalonOnboardingPage />} />
          </Routes>
        </div>

        {/* Mobile Navigation Bar */}
        {!isFullscreenSubpage && <SalonBottomNav />}

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
