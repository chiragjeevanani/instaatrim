import React, { createContext, useContext, useState, useMemo } from 'react';

const SalonContext = createContext();

// Initial Mock Bookings for the Salon Partner (Section 24 & 42.1)
const initialSalonBookings = [
  {
    id: 'BK-1082',
    customerName: 'Priya Mehta',
    customerPhone: '+91 98261 44552',
    bookingMode: 'Instant', // 'Instant' or 'Scheduled'
    slotTime: 'Today, 02:30 PM',
    status: 'In-Service', // 'Confirmed' | 'Checked-In' | 'In-Service' | 'Completed' | 'Cancelled' | 'No-Show'
    chairNumber: 'Chair 1 (Pooja)',
    services: [
      { id: 'srv-4', name: 'HydraGlo Pore Extraction & Vitamin C Facial', price: 1299, duration: '1 hr 20 mins' }
    ],
    totalAmount: 1299,
    paymentMethod: 'UPI (Prepaid)',
    paymentStatus: 'Paid',
    createdAt: '15 mins ago',
    notes: 'Sensitive skin near cheekbones'
  },
  {
    id: 'BK-1083',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 70007 92773',
    bookingMode: 'Scheduled',
    slotTime: 'Today, 03:30 PM',
    status: 'Checked-In',
    chairNumber: 'Chair 2 (Kavita)',
    services: [
      { id: 'srv-1', name: 'Full Arms + Full Legs + Underarms Korean Wax', price: 899, duration: '1 hr 15 mins' }
    ],
    totalAmount: 899,
    paymentMethod: 'Pay at Salon',
    paymentStatus: 'Pending',
    createdAt: '1 hour ago',
    notes: 'Elite VIP Member (10% discount applied)'
  },
  {
    id: 'BK-1084',
    customerName: 'Sneha Verma',
    customerPhone: '+91 94250 88912',
    bookingMode: 'Instant',
    slotTime: 'Today, 04:15 PM',
    status: 'Confirmed',
    chairNumber: 'Unassigned',
    services: [
      { id: 'srv-2', name: 'Full Arms, Underarms & Full Legs - Rica Tin Wax', price: 949, duration: '1 hr 5 mins' }
    ],
    totalAmount: 949,
    paymentMethod: 'UPI (Prepaid)',
    paymentStatus: 'Paid',
    createdAt: '10 mins ago',
    notes: 'Arriving in 15 mins via auto'
  },
  {
    id: 'BK-1085',
    customerName: 'Rhea Sen',
    customerPhone: '+91 98110 33491',
    bookingMode: 'Scheduled',
    slotTime: 'Today, 05:00 PM',
    status: 'Confirmed',
    chairNumber: 'Chair 3 (Meena)',
    services: [
      { id: 'srv-7', name: 'Organic Body Glow Polish with Italy Towel', price: 1599, duration: '1 hr 30 mins' }
    ],
    totalAmount: 1599,
    paymentMethod: 'Credit Card (Online)',
    paymentStatus: 'Paid',
    createdAt: '3 hours ago',
    notes: 'Requested quiet ambience'
  },
  {
    id: 'BK-1080',
    customerName: 'Tanvi Joshi',
    customerPhone: '+91 91112 55431',
    bookingMode: 'Scheduled',
    slotTime: 'Today, 11:30 AM',
    status: 'Completed',
    chairNumber: 'Chair 1 (Pooja)',
    services: [
      { id: 'srv-1', name: 'Full Arms + Full Legs Korean Wax', price: 899, duration: '1 hr 15 mins' }
    ],
    totalAmount: 899,
    paymentMethod: 'UPI (Prepaid)',
    paymentStatus: 'Paid',
    createdAt: 'Yesterday',
    rating: 5,
    review: 'Super clean hygiene kits and gentle wax!'
  },
  {
    id: 'BK-1081',
    customerName: 'Divya Agarwal',
    customerPhone: '+91 97550 22199',
    bookingMode: 'Scheduled',
    slotTime: 'Today, 01:00 PM',
    status: 'Completed',
    chairNumber: 'Chair 2 (Kavita)',
    services: [
      { id: 'srv-4', name: 'HydraGlo Pore Extraction Facial', price: 1299, duration: '1 hr 20 mins' }
    ],
    totalAmount: 1299,
    paymentMethod: 'Pay at Salon (Cash)',
    paymentStatus: 'Paid',
    createdAt: 'Yesterday',
    rating: 5,
    review: 'Skin feels glowing right after the treatment.'
  }
];

// Initial Service Catalog (Section 22 & 42.6)
const initialSalonServices = [
  {
    id: 'srv-1',
    name: 'Full Arms + Full Legs + Underarms Korean Wax',
    category: 'Waxing',
    description: 'Painless exfoliation and wax using premium Korean rice formulation.',
    duration: '1 hr 15 mins',
    price: 899,
    originalPrice: 1699,
    isActive: true,
    isInstantEligible: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZBlBxKt0xyzhEhUPfe5XA9QUMAyD4Kc5Z8Ac20UXPiLYNDfmMbu3kutGCqFeJ1MezdsjhrVxQ6l10j15ESWWlylwGZ5qWRX81L7bhnWztaKhZSONBPdpRHi7ut9nG71DdHnZ864mt-HIGHJuRivm0ol0bSfuiipj5J3hhzoUSR6D0PruAUZq2ktBi6pv4RKeP5TLP1s_A-ns4ph8rNysuvnojzdWTeYemd7GfvL6Mwn0hbvuNmtFcUg'
  },
  {
    id: 'srv-2',
    name: 'Full Arms, Underarms & Full Legs - Rica Tin Wax',
    category: 'Waxing',
    description: 'Colophony-free Italian Rica wax enriched with soothing aloe vera.',
    duration: '1 hr 5 mins',
    price: 949,
    originalPrice: 1599,
    isActive: true,
    isInstantEligible: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT2-qmkDPyTCRCPqQ1oFZDagJ24-4JioCelc6lnduoDA_nuoEFMw4sOp7WshO1GkGOpeC-YFPssVcIXqwkmjk-PK-a4WrYKtnqMW-MbWmXQrcbeP7AmADilWdhKH2lEJ1Pzmz_EVkMw08bC2DQC20QtlXeapo-6d_XlYWoJetpl8nPEZnoEDs2902KXuGGAPvzFNbyi5_rPUW2AaTR71Boh7kRypaMujfm1lOxzA5cL_2EQbsq-CTwWw'
  },
  {
    id: 'srv-4',
    name: 'HydraGlo Pore Extraction & Vitamin C Facial',
    category: 'Facial',
    description: 'Vacuum extraction of impurities followed by deep hyaluronic acid infusion.',
    duration: '1 hr 20 mins',
    price: 1299,
    originalPrice: 2200,
    isActive: true,
    isInstantEligible: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKOZvsFacJMzTEx78j1kJJGV9xWdwRp3-fNcdJELVxA84BL49qmSzZQFwfF_DwDPSujw7BeLRcD36407W6shCprJc3SSww_wPfLk-c9i22zEkrsXoLx12PYtglXJKNFcLoUe4fTw5sx5jls1407Q8MD3OFTg_bFRv_-WLEWbUHkDje49n770wAyt2dzq-gAFGTR9XgwR3mBKrdOwU3d91eojLJ6B5YQGtJnz0tQ8gtpjEm672xqwnp-w'
  },
  {
    id: 'srv-7',
    name: 'Organic Body Glow Polish with Italy Towel',
    category: 'Body Polishing',
    description: 'Complete body gentle scrub, dead skin renewal, and cocoa butter nourish.',
    duration: '1 hr 30 mins',
    price: 1599,
    originalPrice: 2799,
    isActive: true,
    isInstantEligible: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuvH0PSye-kqWkkDkxUI2vr7mAEKKImPzyUF4pvQrb433vt7IFo3hgvC3j9VVX_GHfIV2OVm2S9kGt8x4YsLR4ip5cPVnYY_DkHuCd0sXtZT7slRgiWw6KnWAsweqcZ_JbxTSFuFpUK8GzUlaYc-qC9TwfmewDG0V81T9O43GL8Qkp4ywpeFwTYHyYScmKyKoDdD69hcQQB1tiV7LJcj-2Y13QiUFiqIYF2uAJk5u5PhqywjM_PbeUjQ'
  },
  {
    id: 'srv-8',
    name: 'Deluxe Rose Infusion Manicure & Herbal Pedicure',
    category: 'Mani-Pedi',
    description: 'Dead sea salt soak, cuticles cleanup, exfoliation and foot reflexology.',
    duration: '1 hr 10 mins',
    price: 799,
    originalPrice: 1299,
    isActive: true,
    isInstantEligible: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfMK9naozyIj48N91MtrPUpqgBGrpXDKMUQKJmYVlCbDpjifHwUuZC2YE62fmqKLUk6mCyYfVk2natSfNKpyIt8pJ-_KzBh5Mezas8H_zI4z4LoQBe9WUwJRzb-ZP-4GnjQCNiKOyNC7LM0CEPvVuI7uCttqRMUTYncCPbH-C2MObHO_w3x_WgCYooAYnwegoOUSt5eTFNQtV_lK6csFdp_-QZSUdrlwZebAiaomCnWpKHJSCkl1XRKA'
  },
  {
    id: 'srv-9',
    name: 'Full Body Aromatherapy Spa & Deep Scalp Massage',
    category: 'Spa',
    description: 'Essential oils relaxation therapy targeting muscle tension and stress.',
    duration: '1 hr 30 mins',
    price: 1499,
    originalPrice: 2499,
    isActive: true,
    isInstantEligible: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCI1eXwjP7Q3TbNQwdRp5_XXuFTWcdTW-WZ6OkgsDHGazFAJAGPRuJl_ovbxK3IbzoF0fEbYyuZ_RF0DTJTbX8jRKlJDmIPJFNJprZS1TNyuBjeshScz6lsao4So_cuWvyS292wBNtldqs5q1e6bv-SgQcT5cH3ojThS7lx53dZ1Jz3WOLyx3xgtVnMgs40TwubWvVuU2fnqWo5EzUsM7FKUBZmRjzthtn-RktNjNrH3hJW5V8OSPZ6_Q'
  }
];

// Initial Flash Offers for Empty-Chair Utilization (Section 25)
const initialOffers = [
  {
    id: 'off-1',
    title: 'Happy Hours Non-Peak Special',
    description: 'Fill empty afternoon slots between 1 PM - 4 PM on weekdays.',
    discount: '25% OFF',
    discountType: 'percentage',
    discountValue: 25,
    applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    timeWindow: '01:00 PM - 04:00 PM',
    minOrderValue: 799,
    isActive: true,
    redeemedCount: 14
  },
  {
    id: 'off-2',
    title: 'Weekend Morning Kickoff',
    description: 'Early bird discount for morning appointments before 11:30 AM.',
    discount: '₹150 Flat OFF',
    discountType: 'flat',
    discountValue: 150,
    applicableDays: ['Saturday', 'Sunday'],
    timeWindow: '09:30 AM - 11:30 AM',
    minOrderValue: 999,
    isActive: true,
    redeemedCount: 8
  }
];

export const SalonProvider = ({ children }) => {
  // Salon Partner Details (Section 20)
  const [salonProfile, setSalonProfile] = useState({
    id: 'sal-1',
    name: 'Luxe Glow Salon & Spa',
    ownerName: 'Shalini Verma',
    mobile: '+91 98260 11223',
    email: 'contact@luxeglow.in',
    category: 'Women',
    area: 'South Tukoganj',
    address: 'Plot 14, Opposite Treasure Island, South Tukoganj, Indore, MP 452001',
    openHours: '09:30 AM - 08:30 PM',
    rating: 4.8,
    reviewsCount: 320,
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    amenities: ['AC & Ambient Music', 'Sanitized Kits', 'Beverage Service', 'Valet Parking', 'Card/UPI Accepted'],
    verificationStatus: 'Verified & Live',
    totalChairs: 4
  });

  // Master Instant Booking Toggle (Section 42.6)
  const [isInstantBookingEnabled, setIsInstantBookingEnabled] = useState(true);
  const [instantWaitMinutes, setInstantWaitMinutes] = useState(15);
  const [occupiedChairs, setOccupiedChairs] = useState(2);

  // Store status
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // Bookings List
  const [bookings, setBookings] = useState(initialSalonBookings);

  // Service Catalog
  const [services, setServices] = useState(initialSalonServices);

  // Offers
  const [offers, setOffers] = useState(initialOffers);

  // Active modal counter to conditionally hide bottom nav & UI elements
  const [activeModalCount, setActiveModalCount] = useState(0);
  const openModal = () => setActiveModalCount((prev) => prev + 1);
  const closeModal = () => setActiveModalCount((prev) => Math.max(0, prev - 1));

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  // Booking Lifecycle Actions (Section 24)
  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return { ...b, status: newStatus };
        }
        return b;
      })
    );
    showToast(`Booking #${bookingId} marked as ${newStatus}`);
  };

  const checkInCustomer = (bookingId) => updateBookingStatus(bookingId, 'Checked-In');
  const startService = (bookingId) => updateBookingStatus(bookingId, 'In-Service');
  const completeService = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return { ...b, status: 'Completed', paymentStatus: 'Paid' };
        }
        return b;
      })
    );
    showToast(`Service completed for #${bookingId}. Payment confirmed.`);
  };
  const cancelBooking = (bookingId, reason = 'Salon requested cancellation') => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return { ...b, status: 'Cancelled', cancelReason: reason };
        }
        return b;
      })
    );
    showToast(`Booking #${bookingId} cancelled. Customer notified.`, 'error');
  };
  const markNoShow = (bookingId) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return { ...b, status: 'No-Show' };
        }
        return b;
      })
    );
    showToast(`Booking #${bookingId} marked as No-Show.`, 'error');
  };

  // Create Walk-in / Offline Booking (Section 23 - prevent double-booking)
  const createWalkInBooking = (walkInData) => {
    const newId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      id: newId,
      customerName: walkInData.customerName || 'Walk-In Guest',
      customerPhone: walkInData.customerPhone || '+91 99999 00000',
      bookingMode: 'Instant',
      slotTime: 'Now (Walk-in)',
      status: 'In-Service',
      chairNumber: walkInData.chairNumber || 'Chair 4 (Walk-in)',
      services: walkInData.services || [services[0]],
      totalAmount: walkInData.totalAmount || services[0].price,
      paymentMethod: walkInData.paymentMethod || 'Pay at Salon (Cash)',
      paymentStatus: 'Pending',
      createdAt: 'Just now',
      notes: walkInData.notes || 'Direct walk-in customer'
    };
    setBookings((prev) => [newBooking, ...prev]);
    showToast(`Walk-in booking created #${newId}`);
    return newBooking;
  };

  // Service Management CRUD (Section 22)
  const addService = (newServiceData) => {
    const newId = `srv-${Date.now()}`;
    const newService = {
      id: newId,
      isActive: true,
      isInstantEligible: true,
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80',
      ...newServiceData
    };
    setServices((prev) => [newService, ...prev]);
    showToast(`Service "${newService.name}" added to menu`);
  };

  const updateService = (serviceId, updatedData) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, ...updatedData } : s))
    );
    showToast('Service updated successfully');
  };

  const deleteService = (serviceId) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    showToast('Service removed from menu');
  };

  const toggleServiceActive = (serviceId) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          const next = !s.isActive;
          showToast(`Service ${next ? 'activated' : 'paused'} in menu`);
          return { ...s, isActive: next };
        }
        return s;
      })
    );
  };

  const toggleInstantEligible = (serviceId) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          const next = !s.isInstantEligible;
          showToast(`Instant Booking ${next ? 'enabled' : 'disabled'} for this service`);
          return { ...s, isInstantEligible: next };
        }
        return s;
      })
    );
  };

  // Offer Management (Section 25)
  const addOffer = (offerData) => {
    const newId = `off-${Date.now()}`;
    const newOffer = {
      id: newId,
      isActive: true,
      redeemedCount: 0,
      ...offerData
    };
    setOffers((prev) => [newOffer, ...prev]);
    showToast(`Offer "${newOffer.title}" published!`);
  };

  const toggleOfferActive = (offerId) => {
    setOffers((prev) =>
      prev.map((o) => {
        if (o.id === offerId) {
          const next = !o.isActive;
          showToast(`Offer ${next ? 'activated' : 'paused'}`);
          return { ...o, isActive: next };
        }
        return o;
      })
    );
  };

  // Calculated Metrics for Dashboard & Analytics (Section 21 & 26)
  const metrics = useMemo(() => {
    const todayBookings = bookings.filter((b) => b.slotTime.includes('Today') || b.slotTime.includes('Now'));
    const completedToday = todayBookings.filter((b) => b.status === 'Completed');
    const inServiceToday = todayBookings.filter((b) => b.status === 'In-Service');
    const checkedInToday = todayBookings.filter((b) => b.status === 'Checked-In');
    const confirmedToday = todayBookings.filter((b) => b.status === 'Confirmed');

    const totalRevenueToday = completedToday.reduce((acc, b) => acc + b.totalAmount, 0) +
      inServiceToday.reduce((acc, b) => acc + b.totalAmount, 0);

    const instantBookingsCount = todayBookings.filter((b) => b.bookingMode === 'Instant').length;
    const scheduledBookingsCount = todayBookings.filter((b) => b.bookingMode === 'Scheduled').length;

    return {
      totalBookingsToday: todayBookings.length,
      completedTodayCount: completedToday.length,
      inServiceTodayCount: inServiceToday.length,
      checkedInTodayCount: checkedInToday.length,
      confirmedTodayCount: confirmedToday.length,
      totalRevenueToday,
      instantBookingsCount,
      scheduledBookingsCount,
      availableChairs: Math.max(0, salonProfile.totalChairs - occupiedChairs),
      totalChairs: salonProfile.totalChairs,
      utilizationRate: Math.round((occupiedChairs / salonProfile.totalChairs) * 100),
      monthGmv: 142850,
      availablePayout: 28450,
      nextPayoutDate: 'Tomorrow, 12 Sep'
    };
  }, [bookings, occupiedChairs, salonProfile.totalChairs]);

  return (
    <SalonContext.Provider
      value={{
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
        offers,
        metrics,
        toast,
        showToast,
        isAnyModalOpen: activeModalCount > 0,
        openModal,
        closeModal,
        // Booking actions
        updateBookingStatus,
        checkInCustomer,
        startService,
        completeService,
        cancelBooking,
        markNoShow,
        createWalkInBooking,
        // Service actions
        addService,
        updateService,
        deleteService,
        toggleServiceActive,
        toggleInstantEligible,
        // Offer actions
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
