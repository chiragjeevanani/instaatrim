import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useAppData } from '../../../shared/store/AppDataProvider';
import { api } from '../../../shared/services/api';
import { computeDiscount, isFirstBookingForCustomer } from '../../../shared/store/selectors';

// Phase 0 note: this context used to be the sole owner of bookings,
// locations and favourites in a private useState — which is exactly why
// the salon partner panel could never see a customer's booking or vice
// versa (Defect D7 in the SRS gap audit). It is now a thin view over the
// shared `AppDataProvider` store: bookings, locations and the customer
// profile all live there, this file just exposes them in the shape pages
// already expect. Cart contents and in-progress slot selection stay local
// — they're pre-booking scratch state, not data either app needs to see.

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const { state } = useAppData();

  const user = useMemo(
    () => state.customers.find((c) => c.id === state.currentCustomerId) || state.customers[0],
    [state.customers, state.currentCustomerId]
  );

  // ---------------- Locations (shared store) ----------------
  const savedLocations = useMemo(
    () => state.locations.filter((l) => l.userId === user.id),
    [state.locations, user.id]
  );
  const currentLocation = useMemo(
    () => savedLocations.find((l) => l.isCurrent) || savedLocations[0],
    [savedLocations]
  );

  const setCurrentLocation = useCallback((loc) => {
    api.locations.setCurrent(loc.id).catch(() => {});
  }, []);

  const addLocation = useCallback(
    async (data) => {
      const loc = await api.locations.add(user.id, data);
      await api.locations.setCurrent(loc.id);
      return loc;
    },
    [user.id]
  );

  // ---------------- Cart (transient, local to this checkout session) ----------------
  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [bookingSlot, setBookingSlot] = useState({
    type: 'Scheduled',
    dateKey: null,
    date: 'Tomorrow',
    time: '11:00 AM'
  });
  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);

  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [isEliteModalOpen, setIsEliteModalOpen] = useState(false);
  const [isBookingFlowOpen, setIsBookingFlowOpen] = useState(false);
  const [preferredProduct, setPreferredProduct] = useState(null);

  // ---------------- Service Detail Modal-to-Fullscreen State ----------------
  const [activeDetailService, setActiveDetailService] = useState(null);
  const [serviceModalStage, setServiceModalStage] = useState('closed'); // 'closed' | 'modal' | 'fullscreen'

  const openServiceDetail = useCallback((service, initialStage = 'modal') => {
    setActiveDetailService(service);
    setServiceModalStage(initialStage);
  }, []);

  const closeServiceDetail = useCallback(() => {
    setServiceModalStage('closed');
    setTimeout(() => {
      setActiveDetailService(null);
    }, 280);
  }, []);

  const [toastMessage, setToastMessage] = useState(null);
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const addToCart = useCallback(
    (service, salon) => {
      setCartItems((prev) => {
        const exists = prev.find((item) => item.id === service.id);
        if (exists) {
          showToast('Service is already in your cart');
          return prev;
        }
        // Cart is scoped to one salon (Defect D2 fix) — adding a service
        // from a different salon than what's already in the cart starts a
        // fresh cart instead of silently mixing two salons into one
        // booking.
        const incomingSalonId = salon ? salon.id : service.salonId;
        const existingSalonId = prev[0]?.salonId;
        const base = existingSalonId && existingSalonId !== incomingSalonId ? [] : prev;
        if (base.length === 0 && prev.length > 0) {
          showToast(`Started a new cart for ${salon ? salon.name : service.salonName}`);
        } else {
          showToast(`Added ${service.name} to cart`);
        }
        return [
          ...base,
          {
            ...service,
            salonId: incomingSalonId,
            salonName: salon ? salon.name : service.salonName
          }
        ];
      });
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    (serviceId) => {
      setCartItems((prev) => prev.filter((item) => item.id !== serviceId));
      showToast('Removed from cart');
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setPreferredProduct(null);
  }, []);

  const applyCoupon = useCallback(
    async (code) => {
      const coupon = await api.coupons.findByCode(code);
      if (coupon) {
        if (coupon.firstBookingOnly && !isFirstBookingForCustomer(state, user.id)) {
          showToast(`${coupon.code} is valid on your first booking only`);
          return { success: false, message: 'First-booking coupon already used' };
        }
        setAppliedCoupon(coupon);
        showToast(`Applied promo coupon ${coupon.code}!`);
        return { success: true, message: `Coupon applied: ${coupon.code}` };
      }
      showToast('Invalid coupon code');
      return { success: false, message: 'Invalid or expired coupon' };
    },
    [showToast, state, user.id]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  }, [showToast]);

  const cartSummary = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);
    const originalSubtotal = cartItems.reduce((acc, item) => acc + (item.originalPrice || item.price || 0), 0);
    let discount = 0;
    if (appliedCoupon && subtotal >= (appliedCoupon.minOrder || 0)) {
      discount = computeDiscount(appliedCoupon, subtotal);
    }
    const finalAmount = Math.max(0, subtotal - discount);
    const totalSavings = originalSubtotal - finalAmount;
    return { subtotal, originalSubtotal, discount, finalAmount, totalSavings };
  }, [cartItems, appliedCoupon]);

  // ---------------- Bookings (shared store) ----------------
  const bookings = useMemo(() => state.bookings.filter((b) => b.customerId === user.id), [state.bookings, user.id]);

  const createBooking = useCallback(
    async (bookingData) => {
      const booking = await api.bookings.create({
        customerId: user.id,
        customerName: user.name || 'Customer',
        customerPhone: user.phone,
        salonId: bookingData.salonId || 'sal-1',
        salonName: bookingData.salonName || 'Luxe Glow Salon & Spa',
        address: bookingData.address || currentLocation?.area,
        bookingMode: bookingSlot.type,
        dateKey: bookingSlot.dateKey,
        time: bookingSlot.type === 'Instant' ? 'Within 15 mins' : bookingSlot.time,
        services: cartItems.length > 0 ? cartItems.map((i) => ({ id: i.id, name: i.name, price: i.price, duration: i.duration })) : bookingData.items || [],
        totalAmount: cartSummary.subtotal,
        discountAmount: cartSummary.discount,
        finalPaid: cartSummary.finalAmount,
        couponApplied: appliedCoupon ? appliedCoupon.code : null,
        preferredProduct: preferredProduct || bookingData.preferredProduct || null,
        paymentMethod: bookingData.paymentMethod || 'UPI (Google Pay)',
        paymentStatus: bookingData.paymentStatus || 'Successful',
        transactionId: bookingData.transactionId || null,
        holdId: bookingData.holdId || null,
        stationId: bookingData.stationId || null,
        staffId: bookingData.staffId || null
      });
      clearCart();
      return booking;
    },
    [user.id, user.name, user.phone, currentLocation, bookingSlot, cartItems, cartSummary, appliedCoupon, preferredProduct, clearCart]
  );

  const cancelBooking = useCallback(
    (bookingId, reason = 'Cancelled by customer') => {
      api.bookings
        .updateStatus(bookingId, 'Cancelled', { cancelReason: reason })
        .then(() => showToast(`Booking ${bookingId} cancelled`))
        .catch((e) => showToast(e.message || 'Could not cancel booking'));
    },
    [showToast]
  );

  const rescheduleBooking = useCallback(
    async (bookingId, dateKey, newTime, newDateLabel) => {
      try {
        const updated = await api.bookings.reschedule(bookingId, { dateKey, time: newTime });
        showToast(`Booking ${bookingId} rescheduled to ${newDateLabel || dateKey}, ${newTime}`);
        return updated;
      } catch (e) {
        showToast(e.message || 'Could not reschedule booking');
        throw e;
      }
    },
    [showToast]
  );

  const rateBooking = useCallback(
    async (bookingId, rating, reviewText, salonId, serviceName = '') => {
      try {
        await api.bookings.addRating(bookingId, { rating, review: reviewText });
        if (salonId) {
          await api.reviews.add(salonId, {
            customerName: user.name || 'Verified Customer',
            rating: Number(rating),
            comment: reviewText,
            service: serviceName || 'Salon Service',
            bookingId
          });
        }
        showToast('Thank you for your rating & review!');
      } catch {
        showToast('Could not submit review');
      }
    },
    [user.name, showToast]
  );

  // ---------------- Notifications & Broadcasts ----------------
  const notifications = useMemo(
    () =>
      (state.notifications || []).filter(
        (n) => n.audience === 'all' || (n.audience === 'customer' && (!n.audienceId || n.audienceId === user.id))
      ),
    [state.notifications, user.id]
  );

  const markNotificationRead = useCallback((notificationId) => {
    api.notifications.markRead(notificationId).catch(() => {});
  }, []);

  // ---------------- Support Tickets ----------------
  const createSupportTicket = useCallback(
    async (subject, category, messageText) => {
      try {
        await api.tickets.create({
          userId: user.id,
          userName: user.name || 'Customer',
          userRole: 'customer',
          userContact: user.phone ? `+91 ${user.phone}` : user.email || 'customer',
          salonId: null,
          salonName: 'InstaaTrim Customer Care',
          category: category || 'Customer Query',
          subject: subject || 'Customer Support Request',
          messages: [
            {
              sender: 'customer',
              senderName: user.name || 'Customer',
              text: messageText,
              timestamp: new Date().toISOString()
            }
          ]
        });
        showToast('Support ticket sent! Our team will respond shortly.');
      } catch (e) {
        showToast(e.message || 'Could not submit support ticket');
      }
    },
    [user, showToast]
  );

  // ---------------- Editorial Items & Elite Plan ----------------
  const skincareItems = state.skincareItems || [];
  const trendsItems = state.trendsItems || [];
  const elitePlan = state.elitePlan || {};

  // ---------------- Favourites (persisted on the customer profile) ----------------
  const favoriteSalonIds = user.favoriteSalonIds || [];

  const toggleFavorite = useCallback(
    (salonId) => {
      const exists = favoriteSalonIds.includes(salonId);
      const next = exists ? favoriteSalonIds.filter((id) => id !== salonId) : [...favoriteSalonIds, salonId];
      api.customers.updateProfile({ favoriteSalonIds: next }).catch(() => {});
      showToast(exists ? 'Removed from favorites' : 'Saved to favorites');
    },
    [favoriteSalonIds, showToast]
  );

  // ---------------- Auth ----------------
  const login = useCallback(
    (phone, name = 'Customer') => {
      api.customers
        .loginWithPhone(phone, name)
        .then(() => showToast('Logged in successfully'))
        .catch(() => showToast('Login failed, please try again'));
    },
    [showToast]
  );

  const loginWithProvider = useCallback(
    (provider, profile) => {
      api.customers
        .loginWithProvider(provider, profile)
        .then(() => showToast(`Logged in with ${provider}`))
        .catch(() => showToast('Login failed, please try again'));
    },
    [showToast]
  );

  const logout = useCallback(() => {
    api.customers
      .logout()
      .then(() => showToast('Logged out'))
      .catch(() => {});
  }, [showToast]);

  const updateProfile = useCallback(
    async (patch) => {
      try {
        const updated = await api.customers.updateProfile(patch);
        showToast('Profile updated successfully');
        return updated;
      } catch (e) {
        showToast(e.message || 'Could not update profile');
        throw e;
      }
    },
    [showToast]
  );

  return (
    <CustomerContext.Provider
      value={{
        user,
        login,
        loginWithProvider,
        logout,
        updateProfile,
        currentLocation,
        setCurrentLocation,
        savedLocations,
        addLocation,
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartSummary,
        isCartOpen,
        setIsCartOpen,
        bookingSlot,
        setBookingSlot,
        isSlotPickerOpen,
        setIsSlotPickerOpen,
        isBookingFlowOpen,
        setIsBookingFlowOpen,
        preferredProduct,
        setPreferredProduct,
        isReferModalOpen,
        setIsReferModalOpen,
        isEliteModalOpen,
        setIsEliteModalOpen,
        activeDetailService,
        serviceModalStage,
        setServiceModalStage,
        openServiceDetail,
        closeServiceDetail,
        bookings,
        createBooking,
        cancelBooking,
        rescheduleBooking,
        rateBooking,
        favoriteSalonIds,
        toggleFavorite,
        notifications,
        markNotificationRead,
        createSupportTicket,
        skincareItems,
        trendsItems,
        elitePlan,
        toastMessage,
        showToast
      }}
    >
      {children}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg backdrop-blur-md transition-all animate-bounce">
          {toastMessage}
        </div>
      )}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
