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
import { newBookingId, newReviewId, newAddressId, newServiceId, newOfferId, newTicketId, newNotificationId, newStaffId, newStationId } from '../lib/ids';
import { BOOKING_STATUS, canTransition } from '../lib/bookingStatus';
import { dateKey } from '../lib/time';

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
      const salon = getState().salons.find(
        (s) => s.partnerLoginId?.toLowerCase() === String(loginId).toLowerCase()
      );
      if (!salon || salon.partnerPassword !== password) {
        throw new ApiError('Incorrect email or password.', 'AUTH_FAILED');
      }
      dispatch({ type: 'SET_PARTNER_SESSION', payload: { salonId: salon.id } });
      return clone(salon);
    }),

  logout: () =>
    withLatency(() => {
      dispatch({ type: 'SET_PARTNER_SESSION', payload: null });
      return true;
    }),

  currentSession: () => clone(getState().partnerSession)
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
      const booking = {
        id: newBookingId(),
        status: BOOKING_STATUS.CONFIRMED,
        dateKey: payload.dateKey || dateKey(new Date()),
        createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        paymentStatus: 'Pending',
        stationId: null,
        staffId: null,
        ...payload
      };
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

  update: (offerId, patch) =>
    withLatency(() => {
      dispatch({ type: 'UPDATE_OFFER', payload: { offerId, patch } });
      return clone({ ...getState().offers.find((o) => o.id === offerId), ...patch });
    })
};

const coupons = {
  list: () => withLatency(() => clone(getState().coupons)),

  findByCode: (code) =>
    withLatency(() => {
      const found = getState().coupons.find((c) => c.code.toLowerCase() === String(code).trim().toLowerCase());
      return found ? clone(found) : null;
    })
};

// =============================================================================
// Reviews
// =============================================================================
const reviews = {
  listBySalon: (salonId) => withLatency(() => clone(getState().reviews.filter((r) => r.salonId === salonId))),

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
    })
};

// =============================================================================
// Support tickets (Phase 4)
// =============================================================================
const tickets = {
  listByUser: (userId) => withLatency(() => clone(getState().tickets.filter((t) => t.userId === userId))),

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
  customers
};

export { ApiError };
export default api;
