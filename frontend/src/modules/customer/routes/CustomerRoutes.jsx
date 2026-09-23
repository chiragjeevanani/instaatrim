import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

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
export const CustomerRoutes = () => {
  return (
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
      {/* Fallback to Customer Home */}
      <Route path="*" element={<Navigate to="/customer" replace />} />
    </Routes>
  );
};
