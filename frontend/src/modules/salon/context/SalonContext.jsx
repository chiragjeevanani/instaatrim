import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { api } from '../../../shared/services/api';
import { BOOKING_STATUS } from '../../../shared/lib/bookingStatus';
import { dateKey, minutesToClock, nowMinutesOfDay } from '../../../shared/lib/time';
import { io } from 'socket.io-client';
import { requestFirebaseToken, messaging } from '../../../shared/lib/firebase';
import { onMessage } from 'firebase/messaging';
import { handleRealtimeBookingAlert, requestBrowserNotificationPermission } from '../../../shared/lib/soundNotification';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:6200/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE.replace(/\/api\/?$/, '');

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
  const { state, dispatch } = useAppData();

  const isAuthenticated = Boolean(state.partnerSession);
  const salonId = state.partnerSession?.salonId || 'sal-1';

  // Make sure salon profile always syncs directly from the backend DB 
  // on every refresh so we never lose details like 'name', 'ownerName'.
  useEffect(() => {
    if (isAuthenticated && salonId && salonId !== 'sal-1') {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:6200/api';
      fetch(`${apiBase}/salons/${salonId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            const exists = state.salons.find(s => s.id === json.data.id);
            if (!exists) {
              dispatch({ type: 'ADD_SALON', payload: json.data });
            } else {
              dispatch({ type: 'PATCH_SALON', payload: { salonId: json.data.id, patch: json.data } });
            }
          }
        })
        .catch(console.error);

      // Fetch services (filtering done via useMemo locally for robustness)
      fetch(`${apiBase}/services`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            const mapped = json.data.map(s => ({ ...s, id: s._id, name: s.title || s.name }));
            dispatch({ type: 'SET_SERVICES', payload: mapped });
          }
        })
        .catch(console.error);

      // Fetch staff for this salon
      fetch(`${apiBase}/staff/salon/${salonId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            json.data.forEach(st => {
              const exists = state.staff.find(s => s.id === st.id || s.id === st._id);
              if (!exists) {
                dispatch({ type: 'ADD_STAFF', payload: { ...st, id: st._id || st.id } });
              } else {
                dispatch({ type: 'UPDATE_STAFF', payload: { staffId: st._id || st.id, patch: st } });
              }
            });
          }
        })
        .catch(console.error);

      // Fetch stations from DB
      fetch(`${apiBase}/stations/salon/${salonId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            dispatch({ type: 'SET_STATIONS', payload: json.data.map(s => ({ ...s, id: s._id })) });
          }
        })
        .catch(console.error);

      // Fetch bookings for this salon
      api.bookings.listBySalon(salonId).catch(console.error);
      api.payouts.listBySalon(salonId).catch(console.error);
      api.reviews.listBySalon(salonId).catch(console.error);

      // Fetch offers
      api.offers.listAll().then(offers => {
        if (offers) dispatch({ type: 'SET_OFFERS', payload: offers });
      }).catch(console.error);

      // Fetch platform settings
      api.platformSettings.get().catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, salonId, dispatch]);

  const logout = useCallback(() => api.salons.logout(), []);

  const salonProfile = useMemo(() => {
    const salon = state.salons.find((s) => s.id === salonId);
    return { ...salon, openHours: salon?.openHoursLegacy };
  }, [state.salons, salonId]);

  const patchSalon = useCallback((patch) => api.salons.patch(salonId, patch).catch(() => { }), [salonId]);

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

  // Real-time socket & FCM notifications for Salon (ringtone on booking, alert on cancel)
  useEffect(() => {
    if (!isAuthenticated || !salonId || salonId === 'sal-1') return;

    // 1. Request browser notification permission
    requestBrowserNotificationPermission();

    // 2. Ensure FCM token is saved in backend
    requestFirebaseToken().then((token) => {
      if (token) {
        fetch(`${API_BASE}/salons/save-fcm-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('instaatrim_partner_token')}`
          },
          body: JSON.stringify({ token, platform: 'web' })
        }).catch(console.error);
      }
    }).catch(console.error);

    // 3. Socket.io listeners
    const socket = io(SOCKET_URL);

    socket.on('booking_created', (booking) => {
      if (String(booking.salonId) === String(salonId)) {
        console.log('[Salon Socket] New booking received:', booking);
        const mapped = { ...booking, id: booking._id || booking.id };
        dispatch({ type: 'ADD_BOOKING', payload: mapped });
        handleRealtimeBookingAlert({ type: 'BOOKING_CREATED', booking: mapped, role: 'salon' });
        showToast(`🔔 New Booking from ${mapped.customerName || 'Customer'}!`, 'success');
      }
    });

    socket.on('booking_cancelled', (booking) => {
      if (String(booking.salonId) === String(salonId)) {
        console.log('[Salon Socket] Booking cancelled:', booking);
        const mapped = { ...booking, id: booking._id || booking.id };
        dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { bookingId: mapped.id, status: 'Cancelled', patch: mapped } });
        handleRealtimeBookingAlert({ type: 'BOOKING_CANCELLED', booking: mapped, role: 'salon' });
        showToast(`⚠️ Booking #${mapped.id} was cancelled`, 'error');
      }
    });

    socket.on('booking_updated', (booking) => {
      if (String(booking.salonId) === String(salonId)) {
        const mapped = { ...booking, id: booking._id || booking.id };
        dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { bookingId: mapped.id, status: mapped.status, patch: mapped } });
      }
    });

    // 4. Foreground FCM listener
    let unsubscribeFCM = null;
    if (messaging) {
      unsubscribeFCM = onMessage(messaging, (payload) => {
        console.log('[Salon FCM Foreground]:', payload);
        const data = payload.data || {};
        const type = data.type;
        if ((type === 'BOOKING_CREATED' || type === 'BOOKING_CANCELLED') && (!data.salonId || String(data.salonId) === String(salonId))) {
          const booking = {
            _id: data.bookingId,
            id: data.bookingId,
            salonId: data.salonId,
            customerName: payload.notification?.body || data.body || 'Customer'
          };
          handleRealtimeBookingAlert({ type, booking, role: 'salon' });
        }
      });
    }

    return () => {
      socket.disconnect();
      if (typeof unsubscribeFCM === 'function') unsubscribeFCM();
    };
  }, [isAuthenticated, salonId, dispatch, showToast]);

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
  const services = useMemo(() => {
    return state.services.filter(s => s.salonId === salonId || !s.salonId || String(s.salonId) === String(salonId));
  }, [state.services, salonId]);

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
        .catch((e) => showToast(e?.message || 'Could not update service', 'error'));
    },
    [showToast]
  );

  const deleteService = useCallback(
    (serviceId) => {
      api.services
        .remove(serviceId)
        .then(() => showToast('Service removed from menu'))
        .catch((e) => showToast(e?.message || 'Could not remove service', 'error'));
    },
    [showToast]
  );

  const toggleServiceActive = useCallback(
    (serviceId) => {
      const svc = state.services.find((s) => (s.id && s.id === serviceId) || (s._id && s._id === serviceId));
      if (!svc) return;
      const next = !svc.isActive;
      api.services
        .update(serviceId, { isActive: next })
        .then(() => showToast(`Service ${next ? 'activated' : 'paused'} in menu`))
        .catch((e) => showToast(e?.message || 'Could not update service', 'error'));
    },
    [state.services, showToast]
  );

  const toggleInstantEligible = useCallback(
    (serviceId) => {
      const svc = state.services.find((s) => (s.id && s.id === serviceId) || (s._id && s._id === serviceId));
      if (!svc) return;
      const next = !svc.isInstantEligible;
      api.services
        .update(serviceId, { isInstantEligible: next })
        .then(() => showToast(`Instant Booking ${next ? 'enabled' : 'disabled'} for this service`))
        .catch((e) => showToast(e?.message || 'Could not update service', 'error'));
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
  const staff = useMemo(() => {
    const salonStaff = state.staff.filter((s) => s.salonId === salonId);
    const unique = [];
    const seen = new Set();
    for (const s of salonStaff) {
      const key = s.id || s._id;
      if (key && !seen.has(key)) {
        seen.add(key);
        unique.push(s);
      }
    }
    return unique;
  }, [state.staff, salonId]);
  const stations = useMemo(() => {
    const existing = state.stations.filter((s) => s.salonId === salonId);
    if (existing.length > 0) return existing;
    const count = salonProfile?.totalChairs || 4;
    return Array.from({ length: count }, (_, i) => ({
      id: `${salonId}-chair-${i + 1}`,
      salonId,
      name: `Chair ${i + 1}`,
      staffId: null
    }));
  }, [state.stations, salonId, salonProfile?.totalChairs]);

  const addStaff = useCallback(
    (data) => {
      api.staff
        .add(salonId, data)
        .then((st) => showToast(`Stylist "${st.name}" added to salon team`))
        .catch(() => showToast('Could not add staff member', 'error'));
    },
    [salonId, showToast]
  );

  const updateStaff = useCallback(
    (staffId, patch) => {
      api.staff
        .update(staffId, patch)
        .then(() => showToast('Staff details updated'))
        .catch(() => showToast('Could not update staff member', 'error'));
    },
    [showToast]
  );

  const removeStaff = useCallback(
    (staffId) => {
      api.staff
        .remove(staffId)
        .then(() => showToast('Staff member removed'))
        .catch(() => showToast('Could not remove staff member', 'error'));
    },
    [showToast]
  );

  const addStation = useCallback(
    (data) => {
      api.stations
        .add(salonId, data)
        .then((st) => showToast(`Station "${st.name}" added successfully`))
        .catch(() => showToast('Could not add station', 'error'));
    },
    [salonId, showToast]
  );

  const updateStation = useCallback(
    (stationId, patch) => {
      api.stations
        .update(stationId, patch)
        .then(() => showToast('Station updated'))
        .catch(() => showToast('Could not update station', 'error'));
    },
    [showToast]
  );

  const removeStation = useCallback(
    (stationId) => {
      api.stations
        .remove(stationId)
        .then(() => showToast('Station removed'))
        .catch(() => showToast('Could not remove station', 'error'));
    },
    [showToast]
  );

  // ---------------- Payouts & Settlements ----------------
  const payouts = useMemo(() => (state.payouts || []).filter((p) => p.salonId === salonId), [state.payouts, salonId]);

  const requestPayout = useCallback(
    async (amount, notes = '') => {
      try {
        const commRate = salonProfile.commissionRate || 'Pending Admin Approval';
        const rateNum = Number(String(commRate).replace(/[^0-9.]/g, ''));
        if (!Number.isFinite(rateNum) || !String(commRate).match(/[0-9]/)) {
          showToast('Commission rate is pending admin approval', 'error');
          return false;
        }
        const commDeducted = Math.round((Number(amount) * rateNum) / 100);
        const net = Number(amount) - commDeducted;

        const result = await api.payouts.request({
          salonId,
          salonName: salonProfile.name,
          bankAccount: salonProfile.accountNumber || '',
          ifsc: salonProfile.ifscCode || '',
          grossAmount: Number(amount),
          commissionRate: commRate,
          commissionPercent: rateNum,
          commissionDeducted: commDeducted,
          netAmount: net,
          notes: notes || 'Partner withdrawal request'
        });
        if (!result) throw new Error('Could not request payout');
        showToast(`Payout request for ₹${Number(amount).toLocaleString('en-IN')} submitted to Admin!`);
        return true;
      } catch (e) {
        showToast(e.message || 'Could not request payout', 'error');
        return false;
      }
    },
    [salonId, salonProfile, showToast]
  );

  // ---------------- Customer Reviews & Partner Replies ----------------
  const reviews = useMemo(() => (state.reviews || []).filter((r) => r.salonId === salonId), [state.reviews, salonId]);

  const replyReview = useCallback(
    (reviewId, replyText) => {
      api.reviews
        .reply(reviewId, replyText)
        .then(() => showToast('Your reply was posted to customer review!'))
        .catch(() => showToast('Could not post reply', 'error'));
    },
    [showToast]
  );

  // ---------------- Notifications & Broadcasts ----------------
  const notifications = useMemo(
    () =>
      (state.notifications || []).filter(
        (n) => n.audience === 'all' || (n.audience === 'salon' && (!n.audienceId || n.audienceId === salonId))
      ),
    [state.notifications, salonId]
  );

  const markNotificationRead = useCallback((notificationId) => {
    api.notifications.markRead(notificationId).catch(() => { });
  }, []);

  // ---------------- Support Tickets ----------------
  const tickets = useMemo(
    () => (state.tickets || []).filter((t) => t.salonId === salonId || t.userId === salonId),
    [state.tickets, salonId]
  );

  const createSupportTicket = useCallback(
    async (subject, category, messageText) => {
      try {
        await api.tickets.create({
          userId: salonId,
          userName: `${salonProfile.ownerName || 'Owner'} (${salonProfile.name})`,
          userRole: 'salon',
          userContact: salonProfile.mobile || '+91 98765 43210',
          salonId,
          salonName: salonProfile.name,
          category: category || 'Partner Query',
          subject: subject || 'Partner Assistance Request',
          message: messageText
        });
        showToast('Support ticket submitted to Admin Desk!');
      } catch (e) {
        showToast(e.message || 'Could not submit support ticket', 'error');
      }
    },
    [salonId, salonProfile, showToast]
  );

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
      completedToday.reduce((acc, b) => acc + (b.finalPaid || b.totalAmount), 0) +
      inServiceToday.reduce((acc, b) => acc + (b.finalPaid || b.totalAmount), 0);

    const instantBookingsCount = todayBookings.filter((b) => b.bookingMode === 'Instant').length;
    const scheduledBookingsCount = todayBookings.filter((b) => b.bookingMode === 'Scheduled').length;

    const allTimeCompleted = bookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED);
    const allTimeCancelled = bookings.filter((b) => b.status === BOOKING_STATUS.CANCELLED);
    const totalTerminal = allTimeCompleted.length + allTimeCancelled.length;
    const cancellationRate = totalTerminal > 0 ? Math.round((allTimeCancelled.length / totalTerminal) * 1000) / 10 : 0;

    const totalGmv = allTimeCompleted.reduce((sum, b) => sum + (b.finalPaid || b.totalAmount), 0);
    const totalPayoutsSettledOrPending = payouts
      .filter((p) => p.status === 'Transferred' || p.status === 'Pending' || p.status === 'Approved')
      .reduce((sum, p) => sum + p.grossAmount, 0);

    const totalSalonRevenue = allTimeCompleted.reduce((sum, b) => {
      const billValue = b.totalAmount || b.finalPaid || 0;
      return sum + (billValue - billValue * 0.50);
    }, 0);
    const availablePayout = Math.max(0, totalSalonRevenue - totalPayoutsSettledOrPending);

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
      monthGmv: totalGmv,
      availablePayout,
      nextPayoutDate: salonProfile.payoutCycle || 'Not configured'
    };
  }, [bookings, occupiedChairs, salonProfile.totalChairs, payouts]);

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
        addStation,
        updateStation,
        removeStation,
        payouts,
        reviews,
        notifications,
        platformSettings: state.platformSettings,
        tickets,
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
        toggleOfferActive,
        addStaff,
        updateStaff,
        removeStaff,
        requestPayout,
        replyReview,
        markNotificationRead,
        createSupportTicket
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
