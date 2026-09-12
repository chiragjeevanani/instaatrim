import React, { createContext, useContext, useState, useMemo } from 'react';
import { mockLocations, mockCoupons, mockInitialBookings } from '../data/mockData';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  // Auth state
  const [user, setUser] = useState({
    isLoggedIn: true,
    name: 'Ananya Sharma',
    phone: '7000792773',
    email: 'ananya.sharma@example.com',
    isElite: true,
    referralCode: 'ANANYA50'
  });

  // Location state
  const [savedLocations, setSavedLocations] = useState(mockLocations);
  const [currentLocation, setCurrentLocation] = useState(mockLocations[0]);

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(mockCoupons[0]); // Default ELITE10
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Booking process slot selection
  const [bookingSlot, setBookingSlot] = useState({
    type: 'Scheduled', // 'Scheduled' or 'Instant'
    date: 'Tomorrow',
    time: '11:00 AM'
  });
  const [isSlotPickerOpen, setIsSlotPickerOpen] = useState(false);

  // Other global modals
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [isEliteModalOpen, setIsEliteModalOpen] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState(mockInitialBookings);

  // Favorites state
  const [favoriteSalonIds, setFavoriteSalonIds] = useState(['sal-1']);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Cart operations
  const addToCart = (service, salon) => {
    setCartItems((prev) => {
      // If service already in cart, don't duplicate
      const exists = prev.find((item) => item.id === service.id);
      if (exists) {
        showToast('Service is already in your cart');
        return prev;
      }
      showToast(`Added ${service.name} to cart`);
      return [
        ...prev,
        {
          ...service,
          salonId: salon ? salon.id : service.salonId,
          salonName: salon ? salon.name : service.salonName
        }
      ];
    });
  };

  const removeFromCart = (serviceId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== serviceId));
    showToast('Removed from cart');
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Coupon operations
  const applyCoupon = (code) => {
    const coupon = mockCoupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
    if (coupon) {
      setAppliedCoupon(coupon);
      showToast(`Applied promo coupon ${coupon.code}!`);
      return { success: true, message: `Coupon applied: ${coupon.code}` };
    }
    showToast('Invalid coupon code');
    return { success: false, message: 'Invalid or expired coupon' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  // Financial calculations
  const cartSummary = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);
    const originalSubtotal = cartItems.reduce(
      (acc, item) => acc + (item.originalPrice || item.price || 0),
      0
    );
    let discount = 0;

    if (appliedCoupon && subtotal >= (appliedCoupon.minOrder || 0)) {
      if (appliedCoupon.discountPercent) {
        const calculated = (subtotal * appliedCoupon.discountPercent) / 100;
        discount = Math.min(calculated, appliedCoupon.maxDiscount || calculated);
      } else if (appliedCoupon.flatDiscount) {
        discount = appliedCoupon.flatDiscount;
      }
    }

    const finalAmount = Math.max(0, subtotal - discount);
    const totalSavings = originalSubtotal - finalAmount;

    return {
      subtotal,
      originalSubtotal,
      discount,
      finalAmount,
      totalSavings
    };
  }, [cartItems, appliedCoupon]);

  // Booking actions
  const createBooking = (bookingData) => {
    const newId = `IT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newBooking = {
      id: newId,
      salonId: bookingData.salonId || 'sal-1',
      salonName: bookingData.salonName || 'Luxe Glow Salon & Spa',
      address: bookingData.address || currentLocation.area,
      bookingType: bookingSlot.type,
      status: 'Confirmed',
      date: bookingSlot.type === 'Instant' ? 'Today (Instant)' : bookingSlot.date,
      time: bookingSlot.type === 'Instant' ? 'Within 15 mins' : bookingSlot.time,
      items: cartItems.length > 0 ? [...cartItems] : (bookingData.items || []),
      totalAmount: cartSummary.subtotal,
      discountAmount: cartSummary.discount,
      finalPaid: cartSummary.finalAmount,
      couponApplied: appliedCoupon ? appliedCoupon.code : null,
      paymentMethod: bookingData.paymentMethod || 'UPI (Google Pay)',
      paymentStatus: 'Successful',
      bookedAt: new Date().toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    };

    setBookings((prev) => [newBooking, ...prev]);
    clearCart();
    return newBooking;
  };

  const cancelBooking = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
    showToast(`Booking ${bookingId} cancelled`);
  };

  const rescheduleBooking = (bookingId, newDate, newTime) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              date: newDate,
              time: newTime,
              status: 'Confirmed'
            }
          : b
      )
    );
    showToast(`Booking ${bookingId} rescheduled`);
  };

  const rateBooking = (bookingId, rating, review) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              userRating: rating,
              userReview: review
            }
          : b
      )
    );
    showToast('Thank you for your rating & review!');
  };

  // Favorites
  const toggleFavorite = (salonId) => {
    setFavoriteSalonIds((prev) => {
      const exists = prev.includes(salonId);
      if (exists) {
        showToast('Removed from favorites');
        return prev.filter((id) => id !== salonId);
      } else {
        showToast('Saved to favorites');
        return [...prev, salonId];
      }
    });
  };

  // Auth actions
  const login = (phone, name = 'Customer') => {
    setUser({
      isLoggedIn: true,
      name: name,
      phone: phone,
      email: `${phone}@instatrim.com`,
      isElite: true,
      referralCode: `TRIM${phone.slice(-4)}`
    });
    showToast('Logged in successfully');
  };

  const logout = () => {
    setUser({
      isLoggedIn: false,
      name: '',
      phone: '',
      email: '',
      isElite: false,
      referralCode: ''
    });
    showToast('Logged out');
  };

  return (
    <CustomerContext.Provider
      value={{
        user,
        login,
        logout,
        currentLocation,
        setCurrentLocation,
        savedLocations,
        setSavedLocations,
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
        isReferModalOpen,
        setIsReferModalOpen,
        isEliteModalOpen,
        setIsEliteModalOpen,
        bookings,
        createBooking,
        cancelBooking,
        rescheduleBooking,
        rateBooking,
        favoriteSalonIds,
        toggleFavorite,
        toastMessage,
        showToast
      }}
    >
      {children}
      {/* Toast popup */}
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
