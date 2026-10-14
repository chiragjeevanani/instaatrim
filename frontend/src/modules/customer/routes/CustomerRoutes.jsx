import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { HomePage } from '../pages/HomePage';
import { AddressLocationPage } from '../pages/AddressLocationPage';
import { AuthPage } from '../pages/AuthPage';
import { SalonListingPage } from '../pages/SalonListingPage';
import { SalonProfilePage } from '../pages/SalonProfilePage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { BookingConfirmationPage } from '../pages/BookingConfirmationPage';
import { BookingsPage } from '../pages/BookingsPage';
import { AccountPage } from '../pages/AccountPage';
import { EditProfilePage } from '../pages/EditProfilePage';
import { SkincarePage } from '../pages/SkincarePage';
import { TrendsPage } from '../pages/TrendsPage';
import { PrivacyPolicyPage } from '../pages/PrivacyPolicyPage';
import { DesktopHeader, DesktopFooter } from '../components/DesktopHeader';
import { CartDrawer } from '../components/CartDrawer';
import { ReferEarnModal } from '../components/ReferEarnModal';
import { EliteModal } from '../components/EliteModal';
import { BookingFlowModal } from '../components/BookingFlowModal';
import { SlotPickerModal } from '../components/SlotPickerModal';
import { ServiceDetailModal } from '../components/ServiceDetailModal';

// The salon profile page mounts its own booking/slot modals scoped to that salon.
const SALON_PROFILE_RE = /^\/customer\/salons\/[^/]+\/?$/;

export const CustomerRoutes = () => {
  const location = useLocation();
  // Auth is a focused full-screen flow — no site chrome around it.
  const showDesktopChrome = !location.pathname.startsWith('/customer/auth');
  const isSalonProfile = SALON_PROFILE_RE.test(location.pathname);

  return (
    <div className="min-h-screen flex flex-col lg:bg-gradient-to-b lg:from-[#f8f4fb] lg:via-[#f3ebf8] lg:to-[#ede1f5]">
      {/* Desktop-only header (lg+); phones keep TopBar + BottomNav */}
      {showDesktopChrome && <DesktopHeader />}

      <div className="flex-1 w-full min-w-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/location" element={<AddressLocationPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/salons" element={<SalonListingPage />} />
          <Route path="/salons/:salonId" element={<SalonProfilePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmationPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/profile" element={<EditProfilePage />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
          <Route path="/skincare" element={<SkincarePage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          {/* Fallback to Customer Home */}
          <Route path="*" element={<Navigate to="/customer" replace />} />
        </Routes>
      </div>

      {showDesktopChrome && <DesktopFooter />}

      {/* App-wide sheets & modals, reachable from the header / bottom nav on every page */}
      <CartDrawer />
      <ReferEarnModal />
      <EliteModal />
      <ServiceDetailModal />
      {!isSalonProfile && <BookingFlowModal />}
      {!isSalonProfile && <SlotPickerModal />}
    </div>
  );
};
