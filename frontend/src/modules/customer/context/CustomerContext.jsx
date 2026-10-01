import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
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
  const { state, dispatch } = useAppData();

  // Make sure the customer app has the latest live DB data
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:6200/api';

    // Fetch all active salons
    fetch(`${API_BASE}/salons`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          // Add them to store
          // Default hours fallback for DB salons without weeklyHours
          json.data.forEach(salon => {
            const exists = state.salons.find(s => s.id === salon.id || s.id === salon._id);
            
            // Map DB openTime/closeTime to the weeklyHours structure the frontend expects
            const open = salon.openTime || '09:00 AM';
            const close = salon.closeTime || '09:00 PM';
            const dynamicHours = {
              Sunday: { open, close, closed: false },
              Monday: { open, close, closed: false },
              Tuesday: { open, close, closed: false },
              Wednesday: { open, close, closed: false },
              Thursday: { open, close, closed: false },
              Friday: { open, close, closed: false },
              Saturday: { open, close, closed: false }
            };

            const hasWeeklyHours = salon.weeklyHours && Object.keys(salon.weeklyHours).length > 0;

            const salonWithDefaults = {
              ...salon,
              id: salon._id || salon.id,
              weeklyHours: hasWeeklyHours ? salon.weeklyHours : dynamicHours,
              breaks: salon.breaks || [],
              holidays: salon.holidays || []
            };
            
            if (!exists) {
              dispatch({ type: 'ADD_SALON', payload: salonWithDefaults });
            } else {
              dispatch({ type: 'PATCH_SALON', payload: { salonId: salonWithDefaults.id, patch: salonWithDefaults } });
            }
          });
        }
      })
      .catch(console.error);

    // Fetch all services
    fetch(`${API_BASE}/services`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const mapped = json.data.map(s => ({ ...s, id: s._id, name: s.title || s.name }));
          dispatch({ type: 'SET_SERVICES', payload: mapped });
        }
      })
      .catch(console.error);

    // Fetch all staff members globally
    fetch(`${API_BASE}/staff`)
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

    // Fetch all ads
    fetch(`${API_BASE}/ads`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const mappedAds = json.data.map(a => ({ ...a, id: a._id }));
          dispatch({ type: 'SET_ADS', payload: mappedAds });
        }
      })
      .catch(console.error);

    // Fetch all categories
    fetch(`${API_BASE}/categories`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const mappedCats = json.data.map(c => ({ ...c, id: c._id }));
          dispatch({ type: 'SET_CATEGORIES', payload: mappedCats });
        }
      })
      .catch(console.error);

    // Fetch all coupons
    api.coupons.list().then(data => {
      if (Array.isArray(data)) {
        setAvailableCoupons(data.filter(c => c.isActive));
      }
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const user = useMemo(
    () => state.customers.find((c) => c.id === state.currentCustomerId) || state.customers[0] || null,
    [state.customers, state.currentCustomerId]
  );

  // ---------------- Locations (shared store) ----------------
  const savedLocations = useMemo(
    () => user ? state.locations.filter((l) => l.userId === user.id) : [],
    [state.locations, user?.id]
  );
  const currentLocation = useMemo(
    () => savedLocations.find((l) => l.isCurrent) || savedLocations[0],
    [savedLocations]
  );

  const setCurrentLocation = useCallback((loc) => {
    api.locations.setCurrent(loc.id).catch(() => { });
  }, []);

  const addLocation = useCallback(
    async (data) => {
      if (!user) throw new Error('Not logged in');
      const loc = await api.locations.add(user.id, data);
      await api.locations.setCurrent(loc.id);
      return loc;
    },
    [user?.id]
  );

  // ---------------- Cart (transient, local to this checkout session) ----------------
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('instaatrim_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('instaatrim_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isCartOpen, setIsCartOpen] = useState(() => {
    try {
      return localStorage.getItem('instaatrim_is_cart_open') === 'true';
    } catch { return false; }
  });

  const [bookingSlot, setBookingSlot] = useState(() => {
    try {
      const saved = localStorage.getItem('instaatrim_booking_slot');
      return saved ? JSON.parse(saved) : {
        type: 'Scheduled',
        dateKey: null,
        date: 'Tomorrow',
        time: '11:00 AM'
      };
    } catch {
      return {
        type: 'Scheduled',
        dateKey: null,
        date: 'Tomorrow',
        time: '11:00 AM'
      };
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('instaatrim_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('instaatrim_applied_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('instaatrim_applied_coupon');
    }
  }, [appliedCoupon]);

  useEffect(() => {
    localStorage.setItem('instaatrim_booking_slot', JSON.stringify(bookingSlot));
  }, [bookingSlot]);

  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);

  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [isEliteModalOpen, setIsEliteModalOpen] = useState(false);
  const [isBookingFlowOpen, setIsBookingFlowOpen] = useState(() => {
    try {
      return localStorage.getItem('instaatrim_is_booking_open') === 'true';
    } catch { return false; }
  });
  const [preferredProduct, setPreferredProduct] = useState(null);

  useEffect(() => {
    localStorage.setItem('instaatrim_is_cart_open', isCartOpen);
  }, [isCartOpen]);

  useEffect(() => {
    localStorage.setItem('instaatrim_is_booking_open', isBookingFlowOpen);
  }, [isBookingFlowOpen]);

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
        const incomingSalonId = salon ? salon.id : service.salonId;
        const existingSalonId = prev[0]?.salonId;
        const base = existingSalonId && existingSalonId !== incomingSalonId ? [] : prev;
        
        const exists = base.find((item) => item.id === service.id);
        if (exists) {
          return base.map(item => 
            item.id === service.id 
              ? { ...item, quantity: (item.quantity || 1) + 1 } 
              : item
          );
        }

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
            salonName: salon ? salon.name : service.salonName,
            // DB services use `duration` (in minutes as number), slot picker needs `durationMinutes`
            durationMinutes: service.durationMinutes || (typeof service.duration === 'number' ? service.duration : 30),
            quantity: 1
          }
        ];
      });
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    (serviceId) => {
      setCartItems((prev) => {
        const exists = prev.find((item) => item.id === serviceId);
        if (exists && (exists.quantity || 1) > 1) {
          return prev.map(item => 
            item.id === serviceId 
              ? { ...item, quantity: item.quantity - 1 } 
              : item
          );
        }
        showToast('Removed from cart');
        return prev.filter((item) => item.id !== serviceId);
      });
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setAppliedCoupon(null);
    setPreferredProduct(null);
    localStorage.removeItem('instaatrim_cart');
    localStorage.removeItem('instaatrim_applied_coupon');
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
    [showToast, state, user?.id]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  }, [showToast]);

  const cartSummary = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
    const originalSubtotal = cartItems.reduce((acc, item) => acc + ((item.originalPrice || item.price || 0) * (item.quantity || 1)), 0);
    let discount = 0;
    if (appliedCoupon && subtotal >= (appliedCoupon.minOrder || 0)) {
      discount = computeDiscount(appliedCoupon, subtotal);
    }
    const finalAmount = Math.max(0, subtotal - discount);
    const totalSavings = originalSubtotal - finalAmount;
    return { subtotal, originalSubtotal, discount, finalAmount, totalSavings };
  }, [cartItems, appliedCoupon]);

  // ---------------- Bookings (shared store) ----------------
  const bookings = useMemo(() => user ? state.bookings.filter((b) => b.customerId === user.id) : [], [state.bookings, user?.id]);

  const createBooking = useCallback(
    async (bookingData) => {
      if (!user) throw new Error('Not logged in');
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
        services: cartItems.length > 0 ? cartItems.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity || 1, duration: i.duration })) : bookingData.items || [],
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
    [user?.id, user?.name, user?.phone, currentLocation, bookingSlot, cartItems, cartSummary, appliedCoupon, preferredProduct, clearCart]
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
    [user?.name, showToast]
  );

  // ---------------- Notifications & Broadcasts ----------------
  const notifications = useMemo(
    () => user ? (state.notifications || []).filter(
      (n) => n.audience === 'all' || (n.audience === 'customer' && (!n.audienceId || n.audienceId === user.id))
    ) : [],
    [state.notifications, user?.id]
  );

  const markNotificationRead = useCallback((notificationId) => {
    api.notifications.markRead(notificationId).catch(() => { });
  }, []);

  // ---------------- Support Tickets ----------------
  const createSupportTicket = useCallback(
    async (subject, category, messageText) => {
      if (!user) throw new Error('Not logged in');
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
  const favoriteSalonIds = user?.favoriteSalonIds || [];

  const toggleFavorite = useCallback(
    (salonId) => {
      const exists = favoriteSalonIds.includes(salonId);
      const next = exists ? favoriteSalonIds.filter((id) => id !== salonId) : [...favoriteSalonIds, salonId];
      api.customers.updateProfile({ favoriteSalonIds: next }).catch(() => { });
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
    return api.customers
      .logout()
      .then(() => showToast('Logged out'))
      .catch(() => { });
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

  const fetchMyProfile = useCallback(async () => {
    try {
      await api.customers.fetchMyProfile();
    } catch (e) {
      // Ignore errors silently
    }
  }, []);

  return (
    <CustomerContext.Provider
      value={{
        user,
        login,
        loginWithProvider,
        logout,
        updateProfile,
        fetchMyProfile,
        currentLocation,
        setCurrentLocation,
        savedLocations,
        addLocation,
        cartItems,
        availableCoupons,
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
