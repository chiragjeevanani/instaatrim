import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { api } from '../../../shared/services/api';
import { BOOKING_STATUS } from '../../../shared/lib/bookingStatus';
import { dateKey, minutesToClock, nowMinutesOfDay } from '../../../shared/lib/time';

// Phase 0 note: this context used to own a second, independent copy of
// bookings and services with its own ID scheme (BK-####) that the customer
// app could never see (Defect D7). It now reads the same shared store the
// customer app reads, filtered to whichever salon this partner session
// belongs to — a booking created in the customer app appears here, and a
// status change made here is visible on the customer side, both without a
// page refresh.
//
// SalonRoutes now gates every route but /salon/login behind a real
// partnerSession (see api.salons.login/logout) — salonId still falls back
// to 'sal-1' here only as a defensive default for anything that somehow
// renders outside that gate; authenticated routes always have a session.

const SalonContext = createContext();

export const SalonProvider = ({ children }) => {
  const { state } = useAppData();

  const isAuthenticated = Boolean(state.partnerSession);
  const salonId = state.partnerSession?.salonId || 'sal-1';

  const logout = useCallback(() => api.salons.logout(), []);

  const salonProfile = useMemo(() => {
    const salon = state.salons.find((s) => s.id === salonId);
    return { ...salon, openHours: salon?.openHoursLegacy };
  }, [state.salons, salonId]);

  const patchSalon = useCallback((patch) => api.salons.patch(salonId, patch).catch(() => {}), [salonId]);

  // Kept as a setState-style updater so existing call sites like
  // `setSalonProfile((prev) => ({ ...prev, openHours: x }))` need no change.
  const setSalonProfile = useCallback(
    (updater) => {
      const current = state.salons.find((s) => s.id === salonId);
      const patch = typeof updater === 'function' ? updater({ ...current, openHours: current?.openHoursLegacy }) : updater;
      const { openHours, ...rest } = patch;
      patchSalon(openHours !== undefined ? { ...rest, openHoursLegacy: openHours } : rest);
    },
    [state.salons, salonId, patchSalon]
  );

  const isStoreOpen = salonProfile.isStoreOpen ?? true;
  const setIsStoreOpen = useCallback((val) => patchSalon({ isStoreOpen: val }), [patchSalon]);

  const isInstantBookingEnabled = salonProfile.isInstantBookingEnabled ?? true;
  const setIsInstantBookingEnabled = useCallback((val) => patchSalon({ isInstantBookingEnabled: val }), [patchSalon]);

  const instantWaitMinutes = salonProfile.instantWaitMinutes ?? 15;
  const setInstantWaitMinutes = useCallback((val) => patchSalon({ instantWaitMinutes: val }), [patchSalon]);

  const occupiedChairs = salonProfile.occupiedChairs ?? 0;
  const setOccupiedChairs = useCallback(
    (val) => patchSalon({ occupiedChairs: typeof val === 'function' ? val(occupiedChairs) : val }),
    [patchSalon, occupiedChairs]
  );

  // ---------------- Bookings (shared store, filtered to this salon) ----------------
  const bookings = useMemo(() => state.bookings.filter((b) => b.salonId === salonId), [state.bookings, salonId]);

  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const updateBookingStatus = useCallback(
    (bookingId, newStatus, extra = {}) => {
      api.bookings
        .updateStatus(bookingId, newStatus, extra)
        .then(() => showToast(`Booking #${bookingId} marked as ${newStatus}`))
        .catch((e) => showToast(e.message || 'Could not update booking', 'error'));
    },
    [showToast]
  );

  const checkInCustomer = useCallback((bookingId) => updateBookingStatus(bookingId, BOOKING_STATUS.CHECKED_IN), [updateBookingStatus]);
  const startService = useCallback((bookingId) => updateBookingStatus(bookingId, BOOKING_STATUS.SERVICE_STARTED), [updateBookingStatus]);
  const completeService = useCallback(
    (bookingId) => {
      api.bookings
        .updateStatus(bookingId, BOOKING_STATUS.COMPLETED, { paymentStatus: 'Successful' })
        .then(() => showToast(`Service completed for #${bookingId}. Payment confirmed.`))
        .catch((e) => showToast(e.message || 'Could not complete service', 'error'));
    },
    [showToast]
  );
  const cancelBooking = useCallback(
    (bookingId, reason = 'Salon requested cancellation') => {
      api.bookings
        .updateStatus(bookingId, BOOKING_STATUS.CANCELLED, { cancelReason: reason })
        .then(() => showToast(`Booking #${bookingId} cancelled. Customer notified.`, 'error'))
        .catch((e) => showToast(e.message || 'Could not cancel booking', 'error'));
    },
    [showToast]
  );
  const markNoShow = useCallback(
    (bookingId) => {
      api.bookings
        .updateStatus(bookingId, BOOKING_STATUS.NO_SHOW)
        .then(() => showToast(`Booking #${bookingId} marked as No Show.`, 'error'))
        .catch((e) => showToast(e.message || 'Could not update booking', 'error'));
    },
    [showToast]
  );

  const createWalkInBooking = useCallback(
    (walkInData) => {
      const services = walkInData.services || [];
      const amount = walkInData.totalAmount || services[0]?.price || 0;
      api.bookings
        .create({
          customerId: null,
          customerName: walkInData.customerName || 'Walk-In Guest',
          customerPhone: walkInData.customerPhone || '+91 99999 00000',
          salonId,
          salonName: salonProfile.name,
          address: salonProfile.area,
          bookingMode: 'Instant',
          status: BOOKING_STATUS.SERVICE_STARTED,
          dateKey: dateKey(new Date()),
          time: minutesToClock(nowMinutesOfDay()),
          services,
          totalAmount: amount,
          discountAmount: 0,
          finalPaid: amount,
          paymentMethod: walkInData.paymentMethod || 'Pay at Salon (Cash)',
          paymentStatus: 'Pending',
          notes: walkInData.notes || 'Direct walk-in customer',
          stationId: walkInData.stationId || null,
          staffId: walkInData.staffId || null
        })
        .then((booking) => showToast(`Walk-in booking created #${booking.id}`))
        .catch((e) => showToast(e.message || 'Could not create walk-in booking', 'error'));
    },
    [salonId, salonProfile.name, salonProfile.area, showToast]
  );

  // ---------------- Categories (Admin defined, dynamic) ----------------
  const categories = useMemo(() => {
    return (state.categories || []).filter((c) => c.isActive !== false);
  }, [state.categories]);

  // ---------------- Services ----------------
  const services = useMemo(() => state.services.filter((s) => s.salonId === salonId), [state.services, salonId]);

  const addService = useCallback(
    (newServiceData) => {
      api.services
        .add(salonId, newServiceData)
        .then((s) => showToast(`Service "${s.name}" added to menu`))
        .catch(() => showToast('Could not add service', 'error'));
    },
    [salonId, showToast]
  );

  const updateService = useCallback(
    (serviceId, updatedData) => {
      api.services
        .update(serviceId, updatedData)
        .then(() => showToast('Service updated successfully'))
        .catch(() => showToast('Could not update service', 'error'));
    },
    [showToast]
  );

  const deleteService = useCallback(
    (serviceId) => {
      api.services
        .remove(serviceId)
        .then(() => showToast('Service removed from menu'))
        .catch(() => showToast('Could not remove service', 'error'));
    },
    [showToast]
  );

  const toggleServiceActive = useCallback(
    (serviceId) => {
      const svc = state.services.find((s) => s.id === serviceId);
      if (!svc) return;
      const next = !svc.isActive;
      api.services
        .update(serviceId, { isActive: next })
        .then(() => showToast(`Service ${next ? 'activated' : 'paused'} in menu`))
        .catch(() => showToast('Could not update service', 'error'));
    },
    [state.services, showToast]
  );

  const toggleInstantEligible = useCallback(
    (serviceId) => {
      const svc = state.services.find((s) => s.id === serviceId);
      if (!svc) return;
      const next = !svc.isInstantEligible;
      api.services
        .update(serviceId, { isInstantEligible: next })
        .then(() => showToast(`Instant Booking ${next ? 'enabled' : 'disabled'} for this service`))
        .catch(() => showToast('Could not update service', 'error'));
    },
    [state.services, showToast]
  );

  // ---------------- Offers ----------------
  const offers = useMemo(() => state.offers.filter((o) => o.salonId === salonId), [state.offers, salonId]);

  const addOffer = useCallback(
    (offerData) => {
      api.offers
        .add(salonId, offerData)
        .then((o) => showToast(`Offer "${o.title}" submitted for approval`))
        .catch(() => showToast('Could not create offer', 'error'));
    },
    [salonId, showToast]
  );

  const toggleOfferActive = useCallback(
    (offerId) => {
      const offer = state.offers.find((o) => o.id === offerId);
      if (!offer) return;
      const next = !offer.isActive;
      api.offers
        .update(offerId, { isActive: next })
        .then(() => showToast(`Offer ${next ? 'activated' : 'paused'}`))
        .catch(() => showToast('Could not update offer', 'error'));
    },
    [state.offers, showToast]
  );

  // ---------------- Staff & Stations ----------------
  const staff = useMemo(() => state.staff.filter((s) => s.salonId === salonId), [state.staff, salonId]);
  const stations = useMemo(() => state.stations.filter((s) => s.salonId === salonId), [state.stations, salonId]);

  // ---------------- Modal-open counter (unrelated to shared store) ----------------
  const [activeModalCount, setActiveModalCount] = useState(0);
  const openModal = useCallback(() => setActiveModalCount((prev) => prev + 1), []);
  const closeModal = useCallback(() => setActiveModalCount((prev) => Math.max(0, prev - 1)), []);

  // ---------------- Metrics ----------------
  const metrics = useMemo(() => {
    const todayKey = dateKey(new Date());
    const todayBookings = bookings.filter((b) => b.dateKey === todayKey);
    const completedToday = todayBookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED);
    const inServiceToday = todayBookings.filter((b) => b.status === BOOKING_STATUS.SERVICE_STARTED);
    const checkedInToday = todayBookings.filter((b) => b.status === BOOKING_STATUS.CHECKED_IN);
    const confirmedToday = todayBookings.filter((b) => b.status === BOOKING_STATUS.CONFIRMED);
    const cancelledToday = todayBookings.filter((b) => b.status === BOOKING_STATUS.CANCELLED);

    const totalRevenueToday =
      completedToday.reduce((acc, b) => acc + b.totalAmount, 0) + inServiceToday.reduce((acc, b) => acc + b.totalAmount, 0);

    const instantBookingsCount = todayBookings.filter((b) => b.bookingMode === 'Instant').length;
    const scheduledBookingsCount = todayBookings.filter((b) => b.bookingMode === 'Scheduled').length;

    const allTimeCompleted = bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED);
    const allTimeCancelled = bookings.filter((b) => b.status === BOOKING_STATUS.CANCELLED);
    const totalTerminal = allTimeCompleted.length + allTimeCancelled.length;
    const cancellationRate = totalTerminal > 0 ? Math.round((allTimeCancelled.length / totalTerminal) * 1000) / 10 : 0;

    const customerCounts = {};
    bookings.forEach((b) => {
      if (!b.customerId) return;
      customerCounts[b.customerId] = (customerCounts[b.customerId] || 0) + 1;
    });
    const repeatCustomers = Object.values(customerCounts).filter((c) => c > 1).length;
    const newCustomersToday = todayBookings.filter((b) => customerCounts[b.customerId] === 1).length;

    return {
      totalBookingsToday: todayBookings.length,
      completedTodayCount: completedToday.length,
      inServiceTodayCount: inServiceToday.length,
      checkedInTodayCount: checkedInToday.length,
      confirmedTodayCount: confirmedToday.length,
      cancelledTodayCount: cancelledToday.length,
      totalRevenueToday,
      instantBookingsCount,
      scheduledBookingsCount,
      availableChairs: Math.max(0, (salonProfile.totalChairs || 0) - occupiedChairs),
      totalChairs: salonProfile.totalChairs || 0,
      utilizationRate: salonProfile.totalChairs ? Math.round((occupiedChairs / salonProfile.totalChairs) * 100) : 0,
      cancellationRate,
      completionRate: totalTerminal > 0 ? Math.round((allTimeCompleted.length / totalTerminal) * 1000) / 10 : 100,
      repeatCustomers,
      newCustomersToday,
      monthGmv: 142850,
      availablePayout: 28450,
      nextPayoutDate: 'Tomorrow'
    };
  }, [bookings, occupiedChairs, salonProfile.totalChairs]);

  return (
    <SalonContext.Provider
      value={{
        salonId,
        isAuthenticated,
        logout,
        salonProfile,
        setSalonProfile,
        isStoreOpen,
        setIsStoreOpen,
        isInstantBookingEnabled,
        setIsInstantBookingEnabled,
        instantWaitMinutes,
        setInstantWaitMinutes,
        occupiedChairs,
        setOccupiedChairs,
        bookings,
        services,
        categories,
        offers,
        staff,
        stations,
        metrics,
        toast,
        showToast,
        isAnyModalOpen: activeModalCount > 0,
        openModal,
        closeModal,
        updateBookingStatus,
        checkInCustomer,
        startService,
        completeService,
        cancelBooking,
        markNoShow,
        createWalkInBooking,
        addService,
        updateService,
        deleteService,
        toggleServiceActive,
        toggleInstantEligible,
        addOffer,
        toggleOfferActive
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalon = () => {
  const context = useContext(SalonContext);
  if (!context) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
};
