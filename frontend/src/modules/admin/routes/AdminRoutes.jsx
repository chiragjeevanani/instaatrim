import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { AdminSalonsPage } from '../pages/AdminSalonsPage';
import { AdminSalonDetailPage } from '../pages/AdminSalonDetailPage';
import { AdminCategoriesPage } from '../pages/AdminCategoriesPage';
import { AdminPromotionsPage } from '../pages/AdminPromotionsPage';
import { AdminOffersPage } from '../pages/AdminOffersPage';
import { AdminBookingsPage } from '../pages/AdminBookingsPage';
import { AdminCustomersPage } from '../pages/AdminCustomersPage';
import { AdminCouponsPage } from '../pages/AdminCouponsPage';
import { AdminAdsPage } from '../pages/AdminAdsPage';
import { AdminReviewsPage } from '../pages/AdminReviewsPage';
import { AdminTicketsPage } from '../pages/AdminTicketsPage';
import { AdminNotificationsPage } from '../pages/AdminNotificationsPage';
import { AdminAnalyticsPage } from '../pages/AdminAnalyticsPage';
import { AdminPayoutsPage } from '../pages/AdminPayoutsPage';
import { AdminPlatformSettingsPage } from '../pages/AdminPlatformSettingsPage';
import { AdminEditorialPage } from '../pages/AdminEditorialPage';

export const AdminRoutes = () => {
  return (
    <Routes>
      {/* Public Login */}
      <Route path="login" element={<AdminLoginPage />} />

      {/* Protected Admin Shell */}
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="salons" element={<AdminSalonsPage />} />
        <Route path="salons/:id" element={<AdminSalonDetailPage />} />
        <Route path="payouts" element={<AdminPayoutsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="promotions" element={<AdminPromotionsPage />} />
        <Route path="editorial" element={<AdminEditorialPage />} />
        <Route path="offers" element={<AdminOffersPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="ads" element={<AdminAdsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="tickets" element={<AdminTicketsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="settings" element={<AdminPlatformSettingsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
      </Route>

      {/* Fallback to admin root */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};
