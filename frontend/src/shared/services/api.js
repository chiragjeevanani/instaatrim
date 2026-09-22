// Mock API layer — the single seam the whole app talks through.
//
// No component or context is meant to import `shared/data/seed.js`
// directly, or reach into the store's reducer actions itself. Everything
// goes through a function here, which returns a Promise the way a real
// `fetch` call would. When a backend exists, this file is what gets
// rewritten; every screen that called `api.bookings.create(...)` keeps
// working unchanged.
//
// Because it is a plain module (not a hook), it reaches the live store
// through `shared/store/bridge.js`, which `AppDataProvider` registers on
// mount.

import { getState, dispatch } from '../store/bridge';
import { withLatency, ApiError } from './latency';
import { newBookingId, newReviewId, newAddressId, newServiceId, newOfferId, newTicketId, newNotificationId, newStaffId, newStationId, newAdId, newPartnerId } from '../lib/ids';
import { BOOKING_STATUS, canTransition } from '../lib/bookingStatus';
import { dateKey } from '../lib/time';
import { ADMIN_CREDENTIALS } from '../data/seed';

const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

// =============================================================================
// Salons
// =============================================================================
const salons = {
  list: (filters = {}) =>
    withLatency(() => {
      let result = getState().salons;
      if (filters.category && filters.category !== 'All') {
        result = result.filter(
          (s) => s.category.toLowerCase() === filters.category.toLowerCase() || s.category.toLowerCase() === 'unisex'
        );
      }
      return clone(result);
    }),

  get: (salonId) =>
    withLatency(() => {
      const salon = getState().salons.find((s) => s.id === salonId);
      if (!salon) throw new ApiError(`Salon ${salonId} not found`, 'NOT_FOUND');
      return clone(salon);
    }),

  patch: (salonId, patch) =>
    withLatency(() => {
      dispatch({ type: 'PATCH_SALON', payload: { salonId, patch } });
      const updated = { ...getState().salons.find((s) => s.id === salonId), ...patch };
      return clone(updated);
    }),

  login: (loginId, password) =>
    withLatency(() => {
      const trimmedLogin = String(loginId || '').trim().toLowerCase();
      const cleanDigits = String(loginId || '').replace(/\D/g, '');
      const salon = getState().salons.find(
        (s) =>
          s.partnerLoginId?.toLowerCase() === trimmedLogin ||
          s.email?.toLowerCase() === trimmedLogin ||
          (cleanDigits.length >= 10 && s.mobile?.replace(/\D/g, '').endsWith(cleanDigits.slice(-10)))
      );
      if (!salon || salon.partnerPassword !== password) {
        throw new ApiError('Incorrect email/mobile or password.', 'AUTH_FAILED');
      }
      dispatch({ type: 'SET_PARTNER_SESSION', payload: { salonId: salon.id } });
      return clone(salon);
    }),

  loginWithOtp: (phoneOrEmail) =>
    withLatency(() => {
      const cleanDigits = String(phoneOrEmail || '').replace(/\D/g, '');
      const trimmed = String(phoneOrEmail || '').trim().toLowerCase();
      let salon = getState().salons.find(
        (s) =>
          (cleanDigits.length >= 10 && s.mobile?.replace(/\D/g, '').endsWith(cleanDigits.slice(-10))) ||
          s.partnerLoginId?.toLowerCase() === trimmed ||
          s.email?.toLowerCase() === trimmed
      );
      if (!salon) {
        // Fall back to first demo salon if arbitrary number entered for testing
        salon = getState().salons[0];
      }
      dispatch({ type: 'SET_PARTNER_SESSION', payload: { salonId: salon.id } });
      return clone(salon);
    }),

  register: (data) =>
    withLatency(() => {
      const id = `sal-${Date.now()}`;
      const openTime = data.openTime || '09:30 AM';
      const closeTime = data.closeTime || '08:30 PM';
      const defaultHours = {
        Sunday: { open: openTime, close: closeTime, closed: false },
        Monday: { open: openTime, close: closeTime, closed: false },
        Tuesday: { open: openTime, close: closeTime, closed: false },
        Wednesday: { open: openTime, close: closeTime, closed: false },
        Thursday: { open: openTime, close: closeTime, closed: false },
        Friday: { open: openTime, close: closeTime, closed: false },
        Saturday: { open: openTime, close: closeTime, closed: false }
      };

      const newSalon = {
        id,
        name: data.name || 'My Salon & Spa',
        ownerName: data.ownerName || 'Partner Owner',
        mobile: data.mobile?.startsWith('+91') ? data.mobile : `+91 ${data.mobile || '98765 43210'}`,
        email: (data.email || `partner_${Date.now()}@instaatrim.com`).toLowerCase(),
        partnerLoginId: (data.email || `partner_${Date.now()}@instaatrim.com`).toLowerCase(),
        partnerPassword: data.password || 'demo1234',
        tagline: data.tagline || 'Premier Beauty & Wellness Destination',
        category: data.category || 'Unisex',
        rating: 5.0,
        reviewsCount: 1,
        lat: 22.7204,
        lng: 75.8721,
        distanceKm: 1.1,
        area: data.area || 'Indore Central',
        locationCity: data.city || 'Indore',
        startingPrice: Number(data.startingPrice) || 299,
        coverImage:
          data.coverImage ||
          'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        images: [
          data.coverImage ||
            'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
        ],
        offer: '15% OFF Launch Special',
        hasInstantBooking: true,
        isInstantBookingEnabled: true,
        instantWaitMinutes: 15,
        isVerified: false,
        verificationStatus: 'Pending',
        isStoreOpen: false,
        openHoursLegacy: `${openTime} - ${closeTime}`,
        weeklyHours: defaultHours,
        breaks: [],
        holidays: [],
        address: data.address || `${data.area || 'South Tukoganj'}, ${data.city || 'Indore'}`,
        phone: data.mobile || '+91 98765 43210',
        amenities: data.amenities && data.amenities.length > 0
          ? data.amenities
          : ['AC & Ambient Music', 'Sanitized Kits', 'Card/UPI Accepted', 'Beverage Service'],
        totalChairs: Number(data.totalChairs) || 4,
        occupiedChairs: 0,
        gstin: data.gstin || '23AABCU9603R1ZM',
        shopActLicense: data.shopActLicense || 'IND-MP-2025-8821',
        bankName: data.bankName || 'HDFC Bank',
        accountNumber: data.accountNumber ? `••••${data.accountNumber.slice(-4)}` : '••••4892',
        ifscCode: data.ifscCode || 'HDFC0001032',
        commissionRate: '12% Flat'
      };

      dispatch({ type: 'ADD_SALON', payload: newSalon });
      dispatch({ type: 'SET_PARTNER_SESSION', payload: { salonId: newSalon.id } });
      return clone(newSalon);
    }),

  logout: () =>
    withLatency(() => {
      dispatch({ type: 'SET_PARTNER_SESSION', payload: null });
      return true;
    }),

  currentSession: () => clone(getState().partnerSession),

  // Admin extensions
  verify: (salonId, verificationStatus = 'Live') =>
    withLatency(() => {
      const isVerified = verificationStatus === 'Live';
      dispatch({ type: 'PATCH_SALON', payload: { salonId, patch: { verificationStatus, isVerified } } });
      const updated = getState().salons.find((s) => s.id === salonId);
      return clone(updated);
    }),

  reject: (salonId, reason = 'Application rejected by administrator') =>
    withLatency(() => {
      dispatch({
        type: 'PATCH_SALON',
        payload: { salonId, patch: { verificationStatus: 'Rejected', isVerified: false, rejectionReason: reason } }
      });
      const updated = getState().salons.find((s) => s.id === salonId);
      return clone(updated);
    }),

  setCommission: (salonId, commissionRate) =>
    withLatency(() => {
      dispatch({ type: 'PATCH_SALON', payload: { salonId, patch: { commissionRate } } });
      const updated = getState().salons.find((s) => s.id === salonId);
      return clone(updated);
    }),

  toggleActive: (salonId) =>
    withLatency(() => {
      const salon = getState().salons.find((s) => s.id === salonId);
      const isStoreOpen = !(salon?.isStoreOpen ?? true);
      dispatch({ type: 'PATCH_SALON', payload: { salonId, patch: { isStoreOpen } } });
      return isStoreOpen;
    })
};

// =============================================================================
// Services
// =============================================================================
const services = {
  listBySalon: (salonId) =>
    withLatency(() => clone(getState().services.filter((s) => s.salonId === salonId))),

  listAll: () => withLatency(() => clone(getState().services)),

  add: (salonId, data) =>
    withLatency(() => {
      const salon = getState().salons.find((s) => s.id === salonId);
      if (salon && (!salon.isVerified || salon.verificationStatus !== 'Live')) {
        throw new ApiError(
          'Your salon application is pending admin approval. You can only list services after approval from the admin.',
          'APPROVAL_REQUIRED'
        );
      }
      const newService = {
        id: newServiceId(),
        salonId,
        type: 'service',
        isActive: true,
        isInstantEligible: true,
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80',
        ...data
      };
      dispatch({ type: 'ADD_SERVICE', payload: newService });
      return clone(newService);
    }),

  update: (serviceId, patch) =>
    withLatency(() => {
      dispatch({ type: 'UPDATE_SERVICE', payload: { serviceId, patch } });
      return clone({ ...getState().services.find((s) => s.id === serviceId), ...patch });
    }),

  remove: (serviceId) =>
    withLatency(() => {
      dispatch({ type: 'DELETE_SERVICE', payload: { serviceId } });
      return true;
    })
};

// =============================================================================
// Staff & Stations
// =============================================================================
const staff = {
  listBySalon: (salonId) => withLatency(() => clone(getState().staff.filter((s) => s.salonId === salonId))),

  add: (salonId, data) =>
    withLatency(() => {
      const record = { id: newStaffId(), salonId, leaves: [], serviceCategories: [], ...data };
      dispatch({ type: 'ADD_STAFF', payload: record });
      return clone(record);
    }),

  update: (staffId, patch) =>
    withLatency(() => {
      dispatch({ type: 'UPDATE_STAFF', payload: { staffId, patch } });
      return clone({ ...getState().staff.find((s) => s.id === staffId), ...patch });
    }),

  remove: (staffId) =>
    withLatency(() => {
      dispatch({ type: 'DELETE_STAFF', payload: { staffId } });
      return true;
    })
};

const stations = {
  listBySalon: (salonId) => withLatency(() => clone(getState().stations.filter((s) => s.salonId === salonId))),

  add: (salonId, data) =>
    withLatency(() => {
      const record = { id: newStationId(), salonId, staffId: null, ...data };
      dispatch({ type: 'ADD_STATION', payload: record });
      return clone(record);
    }),

  update: (stationId, patch) =>
    withLatency(() => {
      dispatch({ type: 'UPDATE_STATION', payload: { stationId, patch } });
      return clone({ ...getState().stations.find((s) => s.id === stationId), ...patch });
    }),

  remove: (stationId) =>
    withLatency(() => {
      dispatch({ type: 'DELETE_STATION', payload: { stationId } });
      return true;
    })
};

// =============================================================================
// Bookings
// =============================================================================
const bookings = {
  listByCustomer: (customerId) =>
    withLatency(() => clone(getState().bookings.filter((b) => b.customerId === customerId))),

  listBySalon: (salonId) =>
    withLatency(() => clone(getState().bookings.filter((b) => b.salonId === salonId))),

  listAll: () => withLatency(() => clone(getState().bookings)),

  get: (bookingId) =>
    withLatency(() => {
      const found = getState().bookings.find((b) => b.id === bookingId);
      if (!found) throw new ApiError(`Booking ${bookingId} not found`, 'NOT_FOUND');
      return clone(found);
    }),

  create: (payload) =>
    withLatency(() => {
      // Defaults are applied UNDER the payload, then the two fields that
      // need "fall back if falsy" rather than "fall back only if absent"
      // are computed last against the already-merged object — spreading
      // `payload` after setting these previously let a null dateKey from
      // an unpicked slot silently clobber the computed fallback.
      const booking = {
        id: newBookingId(),
        status: BOOKING_STATUS.CONFIRMED,
        createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        paymentStatus: 'Pending',
        stationId: null,
        staffId: null,
        ...payload
      };
      booking.dateKey = payload.dateKey || dateKey(new Date());
      dispatch({ type: 'ADD_BOOKING', payload: booking });
      return clone(booking);
    }),

  updateStatus: (bookingId, status, extra = {}, { force = false } = {}) =>
    withLatency(() => {
      const current = getState().bookings.find((b) => b.id === bookingId);
      if (!current) throw new ApiError(`Booking ${bookingId} not found`, 'NOT_FOUND');
      if (!force && !canTransition(current.status, status)) {
        throw new ApiError(`Cannot move booking from "${current.status}" to "${status}".`, 'ILLEGAL_TRANSITION');
      }
      dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { bookingId, status, extra, force } });
      return clone({ ...current, status, ...extra });
    }),

  patch: (bookingId, patch) =>
    withLatency(() => {
      dispatch({ type: 'PATCH_BOOKING', payload: { bookingId, patch } });
      const current = getState().bookings.find((b) => b.id === bookingId);
      return clone({ ...current, ...patch });
    }),

  reschedule: (bookingId, { dateKey: newDateKey, time }) =>
    withLatency(() => {
      const patch = { dateKey: newDateKey, time, status: BOOKING_STATUS.CONFIRMED };
      dispatch({ type: 'PATCH_BOOKING', payload: { bookingId, patch } });
      const current = getState().bookings.find((b) => b.id === bookingId);
      return clone({ ...current, ...patch });
    }),

  addRating: (bookingId, { rating, review }) =>
    withLatency(() => {
      dispatch({ type: 'PATCH_BOOKING', payload: { bookingId, patch: { rating, review } } });
      return true;
    })
};

// =============================================================================
// Offers & Coupons
// =============================================================================
const offers = {
  listBySalon: (salonId) => withLatency(() => clone(getState().offers.filter((o) => o.salonId === salonId))),

  add: (salonId, data) =>
    withLatency(() => {
      const offer = {
        id: newOfferId(),
        salonId,
        isActive: true,
        redeemedCount: 0,
        approvalStatus: 'pending', // salon-created offers await admin approval — SRS §8.4
        serviceIds: [],
        customerSegment: 'all',
        ...data
      };
      dispatch({ type: 'ADD_OFFER', payload: offer });
      return clone(offer);
    }),

  listAll: () => withLatency(() => clone(getState().offers)),

  approve: (offerId) =>
    withLatency(() => {
      dispatch({ type: 'UPDATE_OFFER', payload: { offerId, patch: { approvalStatus: 'approved', isActive: true } } });
      return clone(getState().offers.find((o) => o.id === offerId));
    }),

  reject: (offerId, reason = 'Rejected by administrator') =>
    withLatency(() => {
      dispatch({ type: 'UPDATE_OFFER', payload: { offerId, patch: { approvalStatus: 'rejected', isActive: false, rejectionReason: reason } } });
      return clone(getState().offers.find((o) => o.id === offerId));
    })
};

const coupons = {
  list: () => withLatency(() => clone(getState().coupons)),

  findByCode: (code) =>
    withLatency(() => {
      const found = getState().coupons.find((c) => c.code.toLowerCase() === String(code).trim().toLowerCase());
      return found ? clone(found) : null;
    }),

  create: (data) =>
    withLatency(() => {
      const coupon = {
        id: `cpn-${Date.now()}`,
        code: String(data.code || '').toUpperCase().trim(),
        description: data.description || '',
        scope: data.scope || 'platform',
        discountPercent: data.discountPercent ? Number(data.discountPercent) : null,
        flatDiscount: data.flatDiscount ? Number(data.flatDiscount) : null,
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
        minOrder: Number(data.minOrder) || 0,
        firstBookingOnly: Boolean(data.firstBookingOnly),
        isActive: data.isActive ?? true,
        expiryDate: data.expiryDate || null,
        usageCount: 0,
        ...data
      };
      dispatch({ type: 'ADD_COUPON', payload: coupon });
      return clone(coupon);
    }),

  update: (couponId, patch) =>
    withLatency(() => {
      dispatch({ type: 'UPDATE_COUPON', payload: { couponId, patch } });
      return clone(getState().coupons.find((c) => c.id === couponId || c.code === couponId));
    }),

  remove: (couponId) =>
    withLatency(() => {
      dispatch({ type: 'DELETE_COUPON', payload: { couponId } });
      return true;
    })
};

// =============================================================================
// Reviews
// =============================================================================
const reviews = {
  listBySalon: (salonId) => withLatency(() => clone(getState().reviews.filter((r) => r.salonId === salonId))),

  listAll: () => withLatency(() => clone(getState().reviews)),

  add: (salonId, data) =>
    withLatency(() => {
      const review = { id: newReviewId(), salonId, reply: null, verifiedBooking: true, date: 'Just now', ...data };
      dispatch({ type: 'ADD_REVIEW', payload: review });
      return clone(review);
    }),

  reply: (reviewId, replyText) =>
    withLatency(() => {
      dispatch({ type: 'UPDATE_REVIEW', payload: { reviewId, patch: { reply: replyText } } });
      return true;
    }),

  flag: (reviewId, reason = 'Flagged for content review') =>
    withLatency(() => {
      dispatch({ type: 'UPDATE_REVIEW', payload: { reviewId, patch: { isFlagged: true, flagReason: reason } } });
      return true;
    }),

  unflag: (reviewId) =>
    withLatency(() => {
      dispatch({ type: 'UPDATE_REVIEW', payload: { reviewId, patch: { isFlagged: false, flagReason: null } } });
      return true;
    }),

  remove: (reviewId) =>
    withLatency(() => {
      dispatch({ type: 'DELETE_REVIEW', payload: { reviewId } });
      return true;
    })
};

// =============================================================================
// Locations
// =============================================================================
const locations = {
  listByUser: (userId) => withLatency(() => clone(getState().locations.filter((l) => l.userId === userId))),

  add: (userId, data) =>
    withLatency(() => {
      const loc = { id: newAddressId(), userId, isCurrent: false, ...data };
      dispatch({ type: 'ADD_LOCATION', payload: loc });
      return clone(loc);
    }),

  update: (locationId, patch) =>
    withLatency(() => {
      dispatch({ type: 'UPDATE_LOCATION', payload: { locationId, patch } });
      return clone({ ...getState().locations.find((l) => l.id === locationId), ...patch });
    }),

  remove: (locationId) =>
    withLatency(() => {
      dispatch({ type: 'DELETE_LOCATION', payload: { locationId } });
      return true;
    }),

  setCurrent: (locationId) =>
    withLatency(() => {
      dispatch({ type: 'SET_CURRENT_LOCATION', payload: { locationId } });
      return true;
    })
};

// =============================================================================
// Holds — slot locking (Phase 1 fleshes out the resolver; the CRUD lives
// here from Phase 0 so the shape is settled early)
// =============================================================================
const holds = {
  listActive: () =>
    withLatency(() => {
      const now = Date.now();
      dispatch({ type: 'PRUNE_EXPIRED_HOLDS', payload: { now } });
      return clone(getState().holds.filter((h) => h.expiresAt > now));
    }),

  create: (hold) =>
    withLatency(() => {
      dispatch({ type: 'ADD_HOLD', payload: hold });
      return clone(hold);
    }),

  release: (holdId) =>
    withLatency(() => {
      dispatch({ type: 'REMOVE_HOLD', payload: { holdId } });
      return true;
    })
};

// =============================================================================
// Notifications (Phase 4 wires the event bus that calls these)
// =============================================================================
const notifications = {
  listFor: (audience, audienceId) =>
    withLatency(() =>
      clone(getState().notifications.filter((n) => n.audience === audience && n.audienceId === audienceId))
    ),

  create: (data) =>
    withLatency(() => {
      const notification = {
        id: newNotificationId(),
        isRead: false,
        createdAt: new Date().toISOString(),
        ...data
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
      return clone(notification);
    }),

  markRead: (notificationId) =>
    withLatency(() => {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: { notificationId } });
      return true;
    }),

  markAllRead: (audience, audienceId) =>
    withLatency(() => {
      dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ', payload: { audience, audienceId } });
      return true;
    }),

  listAll: () => withLatency(() => clone(getState().notifications))
};

// =============================================================================
// Support tickets (Phase 4)
// =============================================================================
const tickets = {
  listByUser: (userId) => withLatency(() => clone(getState().tickets.filter((t) => t.userId === userId))),

  listAll: () => withLatency(() => clone(getState().tickets)),

  create: (data) =>
    withLatency(() => {
      const ticket = {
        id: newTicketId(),
        status: 'Open',
        createdAt: new Date().toISOString(),
        messages: [],
        ...data
      };
      dispatch({ type: 'ADD_TICKET', payload: ticket });
      return clone(ticket);
    }),

  updateStatus: (ticketId, status) =>
    withLatency(() => {
      dispatch({ type: 'UPDATE_TICKET', payload: { ticketId, patch: { status } } });
      return true;
    }),

  addMessage: (ticketId, message) =>
    withLatency(() => {
      dispatch({ type: 'APPEND_TICKET_MESSAGE', payload: { ticketId, message } });
      return true;
    })
};

// =============================================================================
// Customers / Auth
// =============================================================================
const customers = {
  list: () => withLatency(() => clone(getState().customers)),

  current: () =>
    withLatency(() => {
      const state = getState();
      return clone(state.customers.find((c) => c.id === state.currentCustomerId));
    }),

  loginWithPhone: (phone, name) =>
    withLatency(() => {
      const id = getState().currentCustomerId || 'cust-1';
      const record = {
        id,
        isLoggedIn: true,
        name: name || 'Customer',
        phone,
        email: `${phone}@instaatrim.com`,
        isElite: true,
        referralCode: `TRIM${String(phone).slice(-4)}`,
        authProvider: 'otp',
        notificationPrefs: { push: true, sms: true, email: true, whatsapp: false, marketing: false }
      };
      dispatch({ type: 'UPSERT_CUSTOMER', payload: record });
      return clone(record);
    }),

  loginWithProvider: (provider, profile) =>
    withLatency(() => {
      const id = getState().currentCustomerId || 'cust-1';
      const record = {
        id,
        isLoggedIn: true,
        isElite: true,
        authProvider: provider,
        notificationPrefs: { push: true, sms: true, email: true, whatsapp: false, marketing: false },
        ...profile
      };
      dispatch({ type: 'UPSERT_CUSTOMER', payload: record });
      return clone(record);
    }),

  logout: () =>
    withLatency(() => {
      dispatch({ type: 'LOGOUT_CUSTOMER' });
      return true;
    }),

  updateProfile: (patch) =>
    withLatency(() => {
      dispatch({ type: 'PATCH_CURRENT_CUSTOMER', payload: patch });
      const state = getState();
      return clone(state.customers.find((c) => c.id === state.currentCustomerId));
    })
};

// =============================================================================
// Admin Auth & Operations
// =============================================================================
const admin = {
  login: (email, password) =>
    withLatency(() => {
      const trimmedEmail = String(email || '').trim().toLowerCase();
      if (trimmedEmail !== ADMIN_CREDENTIALS.email.toLowerCase() || password !== ADMIN_CREDENTIALS.password) {
        throw new ApiError('Invalid admin email or password.', 'ADMIN_AUTH_FAILED');
      }
      const session = {
        email: ADMIN_CREDENTIALS.email,
        name: ADMIN_CREDENTIALS.name,
        role: ADMIN_CREDENTIALS.role,
        loggedInAt: new Date().toISOString()
      };
      dispatch({ type: 'SET_ADMIN_SESSION', payload: session });
      return clone(session);
    }),

  logout: () =>
    withLatency(() => {
      dispatch({ type: 'SET_ADMIN_SESSION', payload: null });
      return true;
    }),

  currentSession: () => clone(getState().adminSession)
};

// =============================================================================
// Advertisements & Banners
// =============================================================================
const ads = {
  getAll: () =>
    withLatency(() => {
      const s = getState();
      return {
        advertisements: clone(s.advertisements || []),
        brandPartners: clone(s.brandPartners || []),
        midPageCampaign: clone(s.midPageCampaign || {})
      };
    }),

  createAd: (data) =>
    withLatency(() => {
      const item = {
        id: newAdId(),
        isActive: true,
        ...data
      };
      dispatch({ type: 'ADS_CREATE', payload: item });
      return clone(item);
    }),

  updateAd: (id, patch) =>
    withLatency(() => {
      dispatch({ type: 'ADS_UPDATE', payload: { id, patch } });
      const updated = getState().advertisements.find((a) => a.id === id);
      return clone(updated);
    }),

  deleteAd: (id) =>
    withLatency(() => {
      dispatch({ type: 'ADS_DELETE', payload: id });
      return true;
    }),

  toggleAdActive: (id) =>
    withLatency(() => {
      dispatch({ type: 'ADS_TOGGLE_ACTIVE', payload: id });
      const updated = getState().advertisements.find((a) => a.id === id);
      return clone(updated);
    }),

  createBrandPartner: (data) =>
    withLatency(() => {
      const item = {
        id: newPartnerId(),
        isActive: true,
        ...data
      };
      dispatch({ type: 'BRAND_PARTNER_CREATE', payload: item });
      return clone(item);
    }),

  updateBrandPartner: (id, patch) =>
    withLatency(() => {
      dispatch({ type: 'BRAND_PARTNER_UPDATE', payload: { id, patch } });
      const updated = getState().brandPartners.find((bp) => bp.id === id);
      return clone(updated);
    }),

  deleteBrandPartner: (id) =>
    withLatency(() => {
      dispatch({ type: 'BRAND_PARTNER_DELETE', payload: id });
      return true;
    }),

  toggleBrandPartnerActive: (id) =>
    withLatency(() => {
      dispatch({ type: 'TOGGLE_BRAND_PARTNER_ACTIVE', payload: id });
      const updated = getState().brandPartners.find((bp) => bp.id === id);
      return clone(updated);
    }),

  updateMidCampaign: (patch) =>
    withLatency(() => {
      dispatch({ type: 'MID_CAMPAIGN_UPDATE', payload: patch });
      return clone(getState().midPageCampaign);
    })
};

export const api = {
  salons,
  services,
  staff,
  stations,
  bookings,
  offers,
  coupons,
  reviews,
  locations,
  holds,
  notifications,
  tickets,
  customers,
  admin,
  ads
};

export { ApiError };
export default api;

