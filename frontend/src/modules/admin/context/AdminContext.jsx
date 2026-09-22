import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { api } from '../../../shared/services/api';
import { ADMIN_CREDENTIALS } from '../../../shared/data/seed';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { state } = useAppData();

  const isAuthenticated = Boolean(state.adminSession);
  const adminSession = state.adminSession;

  // Theme state: 'dark' | 'light' (defaults to 'dark', persists to localStorage)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('instaatrim_admin_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('instaatrim_admin_theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Auth methods
  const login = useCallback(async (email, password) => {
    try {
      const session = await api.admin.login(email, password);
      showToast(`Welcome back, ${session.name}!`, 'success');
      return session;
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
      throw err;
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    await api.admin.logout();
    showToast('Logged out of Admin Panel', 'info');
  }, [showToast]);

  // Global store entities
  const salons = state.salons;
  const bookings = state.bookings;
  const offers = state.offers;
  const coupons = state.coupons;
  const reviews = state.reviews;
  const customers = state.customers;
  const tickets = state.tickets;
  const notifications = state.notifications;
  const services = state.services;
  const staff = state.staff;
  const advertisements = state.advertisements || [];
  const brandPartners = state.brandPartners || [];
  const midPageCampaign = state.midPageCampaign || {};

  // KPIs
  const kpis = useMemo(() => {
    const totalRevenue = bookings.reduce((sum, b) => {
      if (b.status === 'Completed' || b.paymentStatus === 'Successful') {
        return sum + (b.finalPaid || b.totalAmount || 0);
      }
      return sum;
    }, 0);

    const platformCommission = Math.round(totalRevenue * 0.12);
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter((b) => b.status === 'Completed').length;
    const activeSalons = salons.filter((s) => s.verificationStatus === 'Live').length;
    const pendingSalons = salons.filter((s) => s.verificationStatus === 'Pending' || !s.isVerified).length;
    const pendingOffers = offers.filter((o) => o.approvalStatus === 'pending').length;
    const openTickets = tickets.filter((t) => t.status === 'Open').length;
    const totalCustomers = customers.length;

    return {
      totalRevenue,
      platformCommission,
      totalBookings,
      completedBookings,
      activeSalons,
      pendingSalons,
      pendingOffers,
      openTickets,
      totalCustomers
    };
  }, [bookings, salons, offers, tickets, customers]);

  // Salon actions
  const verifySalon = useCallback(async (salonId, status = 'Live') => {
    try {
      await api.salons.verify(salonId, status);
      showToast(`Salon status updated to "${status}"`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update salon status', 'error');
    }
  }, [showToast]);

  const rejectSalon = useCallback(async (salonId, reason) => {
    try {
      await api.salons.reject(salonId, reason);
      showToast('Salon application rejected', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to reject salon', 'error');
    }
  }, [showToast]);

  const setSalonCommission = useCallback(async (salonId, rate) => {
    try {
      await api.salons.setCommission(salonId, rate);
      showToast(`Commission updated to ${rate}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update commission', 'error');
    }
  }, [showToast]);

  const toggleSalonActive = useCallback(async (salonId) => {
    try {
      const next = await api.salons.toggleActive(salonId);
      showToast(`Salon is now ${next ? 'Active' : 'Offline'}`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to toggle salon state', 'error');
    }
  }, [showToast]);

  // Offer actions
  const approveOffer = useCallback(async (offerId) => {
    try {
      await api.offers.approve(offerId);
      showToast('Offer approved and activated', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to approve offer', 'error');
    }
  }, [showToast]);

  const rejectOffer = useCallback(async (offerId, reason) => {
    try {
      await api.offers.reject(offerId, reason);
      showToast('Offer rejected', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to reject offer', 'error');
    }
  }, [showToast]);

  // Coupon actions
  const createCoupon = useCallback(async (data) => {
    try {
      const c = await api.coupons.create(data);
      showToast(`Coupon ${c.code} created successfully`, 'success');
      return c;
    } catch (err) {
      showToast(err.message || 'Failed to create coupon', 'error');
      throw err;
    }
  }, [showToast]);

  const updateCoupon = useCallback(async (couponId, patch) => {
    try {
      await api.coupons.update(couponId, patch);
      showToast('Coupon updated', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update coupon', 'error');
    }
  }, [showToast]);

  const deleteCoupon = useCallback(async (couponId) => {
    try {
      await api.coupons.remove(couponId);
      showToast('Coupon deleted', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete coupon', 'error');
    }
  }, [showToast]);

  // Review actions
  const flagReview = useCallback(async (reviewId, reason) => {
    try {
      await api.reviews.flag(reviewId, reason);
      showToast('Review flagged for content audit', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to flag review', 'error');
    }
  }, [showToast]);

  const unflagReview = useCallback(async (reviewId) => {
    try {
      await api.reviews.unflag(reviewId);
      showToast('Review unflagged', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to unflag review', 'error');
    }
  }, [showToast]);

  const deleteReview = useCallback(async (reviewId) => {
    try {
      await api.reviews.remove(reviewId);
      showToast('Review removed from platform', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to remove review', 'error');
    }
  }, [showToast]);

  // Ticket actions
  const updateTicketStatus = useCallback(async (ticketId, status) => {
    try {
      await api.tickets.updateStatus(ticketId, status);
      showToast(`Ticket status changed to ${status}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update ticket status', 'error');
    }
  }, [showToast]);

  const replyTicket = useCallback(async (ticketId, text) => {
    try {
      const message = {
        sender: 'admin',
        senderName: 'InstaaTrim Support Team',
        text,
        sentAt: new Date().toISOString()
      };
      await api.tickets.addMessage(ticketId, message);
      showToast('Reply sent', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to send reply', 'error');
    }
  }, [showToast]);

  // Broadcast notification
  const sendBroadcastNotification = useCallback(async ({ title, message, audience = 'all' }) => {
    try {
      await api.notifications.create({
        title,
        message,
        audience,
        audienceId: null,
        type: 'broadcast',
        time: 'Just now'
      });
      showToast(`Broadcast notification dispatched to "${audience}"`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to send notification', 'error');
    }
  }, [showToast]);

  // Ads & Banners actions
  const createAd = useCallback(async (data) => {
    try {
      const ad = await api.ads.createAd(data);
      showToast(`Ad for "${ad.brand || 'Brand'}" created successfully`, 'success');
      return ad;
    } catch (err) {
      showToast(err.message || 'Failed to create ad', 'error');
      throw err;
    }
  }, [showToast]);

  const updateAd = useCallback(async (id, patch) => {
    try {
      await api.ads.updateAd(id, patch);
      showToast('Advertisement updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update ad', 'error');
      throw err;
    }
  }, [showToast]);

  const deleteAd = useCallback(async (id) => {
    try {
      await api.ads.deleteAd(id);
      showToast('Advertisement removed', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete ad', 'error');
      throw err;
    }
  }, [showToast]);

  const toggleAdActive = useCallback(async (id) => {
    try {
      const updated = await api.ads.toggleAdActive(id);
      showToast(`Ad is now ${updated?.isActive ? 'active' : 'paused'}`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to toggle ad status', 'error');
    }
  }, [showToast]);

  const createBrandPartner = useCallback(async (data) => {
    try {
      const bp = await api.ads.createBrandPartner(data);
      showToast(`Brand partner "${bp.name}" added successfully`, 'success');
      return bp;
    } catch (err) {
      showToast(err.message || 'Failed to create brand partner', 'error');
      throw err;
    }
  }, [showToast]);

  const updateBrandPartner = useCallback(async (id, patch) => {
    try {
      await api.ads.updateBrandPartner(id, patch);
      showToast('Brand partner updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update brand partner', 'error');
      throw err;
    }
  }, [showToast]);

  const deleteBrandPartner = useCallback(async (id) => {
    try {
      await api.ads.deleteBrandPartner(id);
      showToast('Brand partner removed', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete brand partner', 'error');
      throw err;
    }
  }, [showToast]);

  const toggleBrandPartnerActive = useCallback(async (id) => {
    try {
      const updated = await api.ads.toggleBrandPartnerActive(id);
      showToast(`Brand partner is now ${updated?.isActive ? 'active' : 'paused'}`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to toggle brand partner status', 'error');
    }
  }, [showToast]);

  const updateMidCampaign = useCallback(async (patch) => {
    try {
      await api.ads.updateMidCampaign(patch);
      showToast('Mid-page campaign banner updated', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update campaign banner', 'error');
      throw err;
    }
  }, [showToast]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      adminSession,
      defaultCredentials: ADMIN_CREDENTIALS,
      theme,
      toggleTheme,
      toast,
      showToast,
      login,
      logout,
      salons,
      bookings,
      offers,
      coupons,
      reviews,
      customers,
      tickets,
      notifications,
      services,
      staff,
      kpis,
      verifySalon,
      rejectSalon,
      setSalonCommission,
      toggleSalonActive,
      approveOffer,
      rejectOffer,
      createCoupon,
      updateCoupon,
      deleteCoupon,
      flagReview,
      unflagReview,
      deleteReview,
      updateTicketStatus,
      replyTicket,
      sendBroadcastNotification,
      advertisements,
      brandPartners,
      midPageCampaign,
      createAd,
      updateAd,
      deleteAd,
      toggleAdActive,
      createBrandPartner,
      updateBrandPartner,
      deleteBrandPartner,
      toggleBrandPartnerActive,
      updateMidCampaign
    }),
    [
      isAuthenticated,
      adminSession,
      theme,
      toggleTheme,
      toast,
      showToast,
      login,
      logout,
      salons,
      bookings,
      offers,
      coupons,
      reviews,
      customers,
      tickets,
      notifications,
      services,
      staff,
      advertisements,
      brandPartners,
      midPageCampaign,
      kpis,
      verifySalon,
      rejectSalon,
      setSalonCommission,
      toggleSalonActive,
      approveOffer,
      rejectOffer,
      createCoupon,
      updateCoupon,
      deleteCoupon,
      flagReview,
      unflagReview,
      deleteReview,
      updateTicketStatus,
      replyTicket,
      sendBroadcastNotification,
      createAd,
      updateAd,
      deleteAd,
      toggleAdActive,
      createBrandPartner,
      updateBrandPartner,
      deleteBrandPartner,
      toggleBrandPartnerActive,
      updateMidCampaign
    ]
  );

  return (
    <AdminContext.Provider value={value}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-3 transition-all ${
            toast.type === 'error'
              ? 'bg-red-950/90 text-red-200 border-red-800/80 backdrop-blur-md'
              : toast.type === 'info'
              ? 'bg-blue-950/90 text-blue-200 border-blue-800/80 backdrop-blur-md'
              : 'bg-stone-900/95 text-purple-200 border-purple-800/60 backdrop-blur-md'
          }`}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          <span>{toast.message}</span>
        </div>
      )}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
