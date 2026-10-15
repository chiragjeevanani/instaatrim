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
import { newBookingId, newReviewId, newAddressId, newCategoryId, newServiceId, newOfferId, newTicketId, newNotificationId, newStaffId, newStationId, newAdId, newPartnerId, newBannerId, newCampaignId } from '../lib/ids';
import { BOOKING_STATUS, canTransition } from '../lib/bookingStatus';
import { dateKey } from '../lib/time';
import { ADMIN_CREDENTIALS } from '../data/seed';

const clone = (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:6200/api';

// =============================================================================
// Salons
// =============================================================================
const salons = {
  list: async (filters = {}) => {
    try {
      let url = `${API_BASE}/salons`;
      const params = new URLSearchParams();
      if (filters.category && filters.category !== 'All') {
        params.set('category', filters.category);
      }
      if ([...params].length) url += `?${params.toString()}`;

      const res = await fetch(url);
      const json = await res.json();
      const data = (json.data || []).map(s => ({ ...s, id: s._id || s.id }));
      // Hydrate frontend store for caching
      dispatch({ type: 'SET_SALONS', payload: data });
      return data;
    } catch (e) {
      console.error(e);
      // Fallback to cache if backend fails
      let result = getState().salons || [];
      if (filters.category && filters.category !== 'All') {
        result = result.filter(
          (s) => s.category?.toLowerCase() === filters.category.toLowerCase() || s.category?.toLowerCase() === 'unisex'
        );
      }
      return clone(result);
    }
  },

  get: async (salonId) => {
    try {
      const res = await fetch(`${API_BASE}/salons/${salonId}`);
      const json = await res.json();
      if (!res.ok) throw new ApiError(json.message || `Salon ${salonId} not found`, 'NOT_FOUND');

      const data = json.data;
      dispatch({ type: 'PATCH_SALON', payload: { salonId, patch: data } });
      return data;
    } catch (e) {
      console.error(e);
      // Fallback
      const salon = (getState().salons || []).find((s) => s.id === salonId);
      if (!salon) throw new ApiError(`Salon ${salonId} not found`, 'NOT_FOUND');
      return clone(salon);
    }
  },

  remove: async (salonId) => {
    const res = await fetch(`${API_BASE}/salons/${salonId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete salon');
    }
    dispatch({ type: 'DELETE_SALON', payload: { salonId } });
    return true;
  },

  patch: async (salonId, patch) => {
    try {
      const res = await fetch(`${API_BASE}/salons/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      const json = await res.json();
      if (res.ok) {
        dispatch({ type: 'PATCH_SALON', payload: { salonId, patch: json.data } });
        return clone(json.data);
      }
    } catch (e) {
      console.error(e);
    }
    // Fallback
    dispatch({ type: 'PATCH_SALON', payload: { salonId, patch } });
    const updated = { ...getState().salons.find((s) => s.id === salonId), ...patch };
    return clone(updated);
  },

  login: async (loginId, password) => {
    const res = await fetch(`${API_BASE}/salons/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId, password })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'Incorrect email/mobile or password.');
    }

    // Upsert the real salon data into the frontend mock store so the UI can find it
    const existing = getState().salons.find(s => s.id === json.data.id);
    if (!existing) {
      dispatch({ type: 'ADD_SALON', payload: json.data });
    } else {
      dispatch({ type: 'PATCH_SALON', payload: { salonId: json.data.id, patch: json.data } });
    }

    if (json.token) {
      localStorage.setItem('instaatrim_partner_token', json.token);
    }
    dispatch({ type: 'SET_PARTNER_SESSION', payload: { salonId: json.data.id } });
    return json.data;
  },

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

  register: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/salons/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Registration failed');
      }

      const savedId = json.data?.id || `sal-${Date.now()}`;

      // Still create a mock object for frontend state consistency for now
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
        id: savedId,
        _id: savedId,
        name: data.name || 'My Salon & Spa',
        ownerName: data.ownerName || 'Partner Owner',
        mobile: data.mobile?.startsWith('+91') ? data.mobile : `+91 ${data.mobile || '98765 43210'}`,
        email: (data.email || `partner_${Date.now()}@drimstyle.com`).toLowerCase(),
        partnerLoginId: (data.email || `partner_${Date.now()}@drimstyle.com`).toLowerCase(),
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
        coverImage: data.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        images: [
          data.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
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
        commissionRate: 'Pending Admin Approval'
      };

      dispatch({ type: 'ADD_SALON', payload: newSalon });
      dispatch({ type: 'SET_PARTNER_SESSION', payload: { salonId: newSalon.id } });
      return clone(newSalon);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('instaatrim_partner_token');
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (_) {
      // Ignore network errors
    }
    localStorage.removeItem('instaatrim_partner_token');
    dispatch({ type: 'SET_PARTNER_SESSION', payload: null });
    return true;
  },

  currentSession: () => clone(getState().partnerSession),

  // Admin extensions
  verify: async (salonId, verificationStatus = 'Live') => {
    const isVerified = verificationStatus === 'Live';
    const res = await fetch(`${API_BASE}/salons/${salonId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: verificationStatus })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to verify salon');

    dispatch({ type: 'PATCH_SALON', payload: { salonId, patch: json.data } });
    return clone(json.data);
  },

  reject: async (salonId, reason = 'Application rejected by administrator') => {
    const res = await fetch(`${API_BASE}/salons/${salonId}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to reject salon');

    dispatch({ type: 'PATCH_SALON', payload: { salonId, patch: json.data } });
    return clone(json.data);
  },

  setCommission: async (salonId, commissionRate) => {
    const res = await fetch(`${API_BASE}/salons/${salonId}/commission`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commissionRate })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update commission');

    dispatch({ type: 'PATCH_SALON', payload: { salonId, patch: json.data } });
    return clone(json.data);
  },
  toggleActive: async (salonId) => {
    const salon = getState().salons.find((s) => s.id === salonId);
    const isStoreOpen = !(salon?.isStoreOpen ?? true);

    try {
      const res = await fetch(`${API_BASE}/salons/${salonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStoreOpen })
      });
      if (res.ok) {
        dispatch({ type: 'PATCH_SALON', payload: { salonId, patch: { isStoreOpen } } });
        return isStoreOpen;
      }
      throw new Error('Failed to update salon status in DB');
    } catch (e) {
      console.error(e);
      // Fallback for local state only if network fails
      dispatch({ type: 'PATCH_SALON', payload: { salonId, patch: { isStoreOpen } } });
      return isStoreOpen;
    }
  }
};

// =============================================================================
// Services
// =============================================================================
const services = {
  listBySalon: async (salonId) => {
    try {
      const res = await fetch(`${API_BASE}/services?salonId=${salonId}`);
      if (res.ok) {
        const json = await res.json();
        const mapped = (json.data || []).map(s => ({
          ...s,
          id: s._id || s.id,
          name: s.name || s.title || 'Service',
          salonId: s.salonId ? (s.salonId._id || s.salonId.id || s.salonId.toString()) : salonId
        }));
        if (mapped.length > 0) {
          dispatch({ type: 'SET_SERVICES', payload: mapped });
        }
        return clone(mapped);
      }
    } catch (e) {
      console.error(e);
    }
    return clone(getState().services.filter((s) => s.salonId === salonId));
  },

  listAll: async () => {
    try {
      const res = await fetch(`${API_BASE}/services`);
      if (res.ok) {
        const json = await res.json();
        // We only use the id instead of _id here for UI mapping
        const mapped = json.data.map(s => ({ ...s, id: s._id }));
        dispatch({ type: 'SET_SERVICES', payload: mapped });
        return clone(mapped);
      }
    } catch (e) {
      console.error(e);
    }
    return clone(getState().services || []);
  },

  add: async (salonId, data) => {
    const salon = getState().salons.find((s) => s.id === salonId);
    if (salon && (!salon.isVerified || salon.verificationStatus !== 'Live')) {
      throw new ApiError(
        'Your salon application is pending admin approval. You can only list services after approval from the admin.',
        'APPROVAL_REQUIRED'
      );
    }

    try {
      const res = await fetch(`${API_BASE}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonId, ...data })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create service');

      const newService = { ...json.data, id: json.data._id, name: json.data.title || data.name };
      dispatch({ type: 'ADD_SERVICE', payload: newService });
      return clone(newService);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  update: async (serviceId, patch) => {
    try {
      const cleanId = typeof serviceId === 'object' ? (serviceId?.id || serviceId?._id) : serviceId;
      const cleanPatch = { ...patch };
      delete cleanPatch._id;
      delete cleanPatch.id;
      const res = await fetch(`${API_BASE}/services/${cleanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanPatch)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update service');

      const updatedService = { ...json.data, id: json.data._id, name: json.data.title || patch.name || json.data.name };
      dispatch({ type: 'UPDATE_SERVICE', payload: { serviceId, patch: updatedService } });
      return clone(updatedService);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  remove: async (serviceId) => {
    try {
      const cleanId = typeof serviceId === 'object' ? (serviceId?.id || serviceId?._id) : serviceId;
      const res = await fetch(`${API_BASE}/services/${cleanId}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to delete service');

      dispatch({ type: 'DELETE_SERVICE', payload: { serviceId: cleanId } });
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
};

// =============================================================================
// Staff & Stations
// =============================================================================
const staff = {
  listBySalon: async (salonId) => {
    const res = await fetch(`${API_BASE}/staff/salon/${salonId}`);
    const json = await res.json();
    return json.data;
  },

  listAll: async () => {
    const res = await fetch(`${API_BASE}/staff`);
    const json = await res.json();
    return json.data;
  },

  add: async (salonId, data) => {
    const res = await fetch(`${API_BASE}/staff/salon/${salonId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    dispatch({ type: 'ADD_STAFF', payload: json.data });
    return json.data;
  },

  update: async (staffId, patch) => {
    const res = await fetch(`${API_BASE}/staff/${staffId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    dispatch({ type: 'UPDATE_STAFF', payload: { staffId, patch: json.data } });
    return json.data;
  },

  remove: async (staffId) => {
    const res = await fetch(`${API_BASE}/staff/${staffId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete staff');
    dispatch({ type: 'DELETE_STAFF', payload: { staffId } });
    return true;
  }
};

const stations = {
  listBySalon: async (salonId) => {
    const res = await fetch(`${API_BASE}/stations/salon/${salonId}`);
    const json = await res.json();
    return json.data;
  },

  add: async (salonId, data) => {
    const res = await fetch(`${API_BASE}/stations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salonId, ...data })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    const saved = { ...json.data, id: json.data._id };
    dispatch({ type: 'ADD_STATION', payload: saved });
    return saved;
  },

  update: async (stationId, patch) => {
    const res = await fetch(`${API_BASE}/stations/${stationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message);
    const updated = { ...json.data, id: json.data._id };
    dispatch({ type: 'UPDATE_STATION', payload: { stationId, patch: updated } });
    return updated;
  },

  remove: async (stationId) => {
    const res = await fetch(`${API_BASE}/stations/${stationId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete station');
    dispatch({ type: 'DELETE_STATION', payload: { stationId } });
    return true;
  }
};

// =============================================================================
// Bookings
// =============================================================================
const bookings = {
  listByCustomer: async (customerId) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/customer/${customerId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      const bks = json.data.map(b => ({ ...b, id: b._id }));
      dispatch({ type: 'SET_BOOKINGS', payload: bks }); // Optional sync to store
      return bks;
    } catch (e) {
      console.error(e);
      // Fallback
      return clone(getState().bookings.filter((b) => b.customerId === customerId));
    }
  },

  listBySalon: async (salonId) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/salon/${salonId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      const bks = json.data.map(b => ({ ...b, id: b._id }));
      dispatch({ type: 'SET_BOOKINGS', payload: bks });
      return bks;
    } catch (e) {
      console.error(e);
      return clone(getState().bookings.filter((b) => b.salonId === salonId));
    }
  },

  listAll: () => withLatency(() => clone(getState().bookings)),

  get: async (bookingId) => {
    // Rely on local state for quick fetch if it's there
    const found = getState().bookings.find((b) => b.id === bookingId);
    if (!found) throw new ApiError(`Booking ${bookingId} not found`, 'NOT_FOUND');
    return clone(found);
  },

  create: async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to create booking');

      const newBooking = { ...json.data, id: json.data._id };
      dispatch({ type: 'ADD_BOOKING', payload: newBooking });
      return newBooking;
    } catch (e) {
      console.error('Real booking creation failed, falling back to mock:', e);
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
    }
  },

  updateStatus: async (bookingId, status, extra = {}, { force = false } = {}) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to update status');

      const updatedBooking = { ...json.data, id: json.data._id };
      dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { bookingId, status: updatedBooking.status, extra, force } });
      return updatedBooking;
    } catch (e) {
      console.error('Real status update failed, falling back to mock:', e);
      const current = getState().bookings.find((b) => b.id === bookingId);
      if (!current) throw new ApiError(`Booking ${bookingId} not found`, 'NOT_FOUND');
      if (!force && !canTransition(current.status, status)) {
        throw new ApiError(`Cannot move booking from "${current.status}" to "${status}".`, 'ILLEGAL_TRANSITION');
      }
      dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { bookingId, status, extra, force } });
      return clone({ ...current, status, ...extra });
    }
  },

  patch: (bookingId, patch) =>
    withLatency(() => {
      dispatch({ type: 'PATCH_BOOKING', payload: { bookingId, patch } });
      const current = getState().bookings.find((b) => b.id === bookingId);
      return clone({ ...current, ...patch });
    }),

  reschedule: async (bookingId, { dateKey: newDateKey, time }) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey: newDateKey, time })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to reschedule booking');

      const updatedBooking = { ...json.data, id: json.data._id };
      dispatch({ type: 'PATCH_BOOKING', payload: { bookingId, patch: updatedBooking } });
      return updatedBooking;
    } catch (e) {
      console.error('Real booking reschedule failed, falling back to mock:', e);
      const patch = { dateKey: newDateKey, time, status: BOOKING_STATUS.CONFIRMED };
      dispatch({ type: 'PATCH_BOOKING', payload: { bookingId, patch } });
      const current = getState().bookings.find((b) => b.id === bookingId);
      return clone({ ...current, ...patch });
    }
  },

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
  listBySalon: async (salonId) => {
    try {
      const res = await fetch(`${API_BASE}/salons/${salonId}`);
      const json = await res.json();
      const salon = json.data;
      return clone((salon?.offers || []));
    } catch (e) {
      console.error(e);
      return clone(getState().offers.filter((o) => o.salonId === salonId));
    }
  },

  add: async (salonId, data) => {
    try {
      const res = await fetch(`${API_BASE}/salons/${salonId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const offer = { ...json.data, id: json.data._id || json.data.id, salonId };
        dispatch({ type: 'ADD_OFFER', payload: offer });
        return clone(offer);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  },

  listAll: async () => {
    try {
      const res = await fetch(`${API_BASE}/salons`);
      const json = await res.json();
      const allOffers = [];
      (json.data || []).forEach(salon => {
        (salon.offers || []).forEach(o => allOffers.push({ ...o, salonId: salon._id || salon.id }));
      });
      return allOffers;
    } catch (e) {
      console.error(e);
      return clone(getState().offers);
    }
  },

  update: async (offerId, patch) => {
    try {
      const offer = getState().offers.find(o => o.id === offerId);
      if (!offer) return null;

      const res = await fetch(`${API_BASE}/salons/${offer.salonId}/offers/${offerId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      if (res.ok) {
        dispatch({ type: 'UPDATE_OFFER', payload: { offerId, patch } });
        return clone({ ...offer, ...patch });
      }
    } catch (e) { console.error(e); }
    return null;
  },

  approve: async (offerId) => {
    try {
      const offer = getState().offers.find(o => o.id === offerId);
      if (!offer) return null;

      const res = await fetch(`${API_BASE}/salons/${offer.salonId}/offers/${offerId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: 'approved', isActive: true })
      });
      if (res.ok) {
        dispatch({ type: 'UPDATE_OFFER', payload: { offerId, patch: { approvalStatus: 'approved', isActive: true } } });
        return clone(getState().offers.find((o) => o.id === offerId));
      }
    } catch (e) { console.error(e); }
    return null;
  },

  reject: async (offerId, reason = 'Rejected by administrator') => {
    try {
      const offer = getState().offers.find(o => o.id === offerId);
      if (!offer) return null;

      const res = await fetch(`${API_BASE}/salons/${offer.salonId}/offers/${offerId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: 'rejected', isActive: false, rejectionReason: reason })
      });
      if (res.ok) {
        dispatch({ type: 'UPDATE_OFFER', payload: { offerId, patch: { approvalStatus: 'rejected', isActive: false, rejectionReason: reason } } });
        return clone(getState().offers.find((o) => o.id === offerId));
      }
    } catch (e) { console.error(e); }
    return null;
  }
};

const coupons = {
  list: async () => {
    try {
      const res = await fetch(`${API_BASE}/coupons`);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.error('Error fetching coupons:', e);
      return [];
    }
  },

  findByCode: async (code) => {
    try {
      const res = await fetch(`${API_BASE}/coupons`);
      const json = await res.json();
      return json.data?.find((c) => c.code.toLowerCase() === String(code).trim().toLowerCase()) || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data;
  },

  update: async (couponId, patch) => {
    const res = await fetch(`${API_BASE}/coupons/${couponId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const json = await res.json();
    return json.data;
  },

  remove: async (couponId) => {
    await fetch(`${API_BASE}/coupons/${couponId}`, { method: 'DELETE' });
    return true;
  }
};

// =============================================================================
// Reviews
// =============================================================================
const reviews = {
  listBySalon: async (salonId) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/salon/${salonId}`);
      const json = await res.json();
      if (res.ok) {
        const data = (json.data || []).map(r => ({ ...r, id: r._id || r.id }));
        dispatch({ type: 'SET_REVIEWS_BY_SALON', payload: { salonId, reviews: data } });
        return data;
      }
    } catch (e) {
      console.error(e);
    }
    return clone(getState().reviews.filter((r) => r.salonId === salonId));
  },

  listAll: async () => {
    try {
      const res = await fetch(`${API_BASE}/reviews`);
      const json = await res.json();
      if (res.ok) {
        return (json.data || []).map(r => ({ ...r, id: r._id || r.id }));
      }
    } catch (e) {
      console.error(e);
    }
    return clone(getState().reviews);
  },

  add: async (salonId, data) => {
    try {
      const token = localStorage.getItem('instaatrim_token');
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ salonId, ...data })
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const review = { ...json.data, id: json.data._id || json.data.id };
        dispatch({ type: 'ADD_REVIEW', payload: review });
        return clone(review);
      }
    } catch (e) {
      console.error(e);
    }
    const review = { id: newReviewId(), salonId, reply: null, verifiedBooking: true, date: 'Just now', ...data };
    dispatch({ type: 'ADD_REVIEW', payload: review });
    return clone(review);
  },

  reply: async (reviewId, replyText) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewId}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText })
      });
      const json = await res.json();
      if (res.ok && json.data) {
        dispatch({ type: 'UPDATE_REVIEW', payload: { reviewId, patch: { reply: replyText } } });
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    dispatch({ type: 'UPDATE_REVIEW', payload: { reviewId, patch: { reply: replyText } } });
    return true;
  },

  flag: async (reviewId, reason = 'Flagged for content review') => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewId}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFlagged: true, flagReason: reason })
      });
      if (res.ok) {
        dispatch({ type: 'UPDATE_REVIEW', payload: { reviewId, patch: { isFlagged: true, flagReason: reason } } });
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    dispatch({ type: 'UPDATE_REVIEW', payload: { reviewId, patch: { isFlagged: true, flagReason: reason } } });
    return true;
  },

  unflag: async (reviewId) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewId}/flag`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFlagged: false, flagReason: null })
      });
      if (res.ok) {
        dispatch({ type: 'UPDATE_REVIEW', payload: { reviewId, patch: { isFlagged: false, flagReason: null } } });
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    dispatch({ type: 'UPDATE_REVIEW', payload: { reviewId, patch: { isFlagged: false, flagReason: null } } });
    return true;
  },

  remove: async (reviewId) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        dispatch({ type: 'DELETE_REVIEW', payload: { reviewId } });
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    dispatch({ type: 'DELETE_REVIEW', payload: { reviewId } });
    return true;
  }
};

// =============================================================================
// Locations
// =============================================================================
const locations = {
  listByUser: (userId) => withLatency(() => clone(getState().locations.filter((l) => l.userId === userId))),

  add: async (userId, data) => {
    const existing = getState().locations.filter((location) => location.userId === userId);
    const loc = { id: newAddressId(), userId, isCurrent: existing.length === 0, ...data };
    const next = [...existing, loc];
    dispatch({ type: 'SET_CUSTOMER_LOCATIONS', payload: { userId, locations: next } });
    await customers.updateProfile({ savedLocations: next });
    return clone(loc);
  },

  update: async (locationId, patch) => {
    const current = getState().locations.find((location) => location.id === locationId);
    if (!current) return null;
    const next = getState().locations
      .filter((location) => location.userId === current.userId)
      .map((location) => location.id === locationId ? { ...location, ...patch } : location);
    dispatch({ type: 'SET_CUSTOMER_LOCATIONS', payload: { userId: current.userId, locations: next } });
    await customers.updateProfile({ savedLocations: next });
    return clone(next.find((location) => location.id === locationId));
  },

  remove: async (locationId) => {
    const current = getState().locations.find((location) => location.id === locationId);
    if (!current) return true;
    let next = getState().locations.filter((location) => location.userId === current.userId && location.id !== locationId);
    if (!next.some((location) => location.isCurrent) && next.length) {
      next = next.map((location, index) => ({ ...location, isCurrent: index === 0 }));
    }
    dispatch({ type: 'SET_CUSTOMER_LOCATIONS', payload: { userId: current.userId, locations: next } });
    await customers.updateProfile({ savedLocations: next });
    return true;
  },

  setCurrent: async (locationId) => {
    const current = getState().locations.find((location) => location.id === locationId);
    if (!current) return false;
    const next = getState().locations
      .filter((location) => location.userId === current.userId)
      .map((location) => ({ ...location, isCurrent: location.id === locationId }));
    dispatch({ type: 'SET_CUSTOMER_LOCATIONS', payload: { userId: current.userId, locations: next } });
    await customers.updateProfile({ savedLocations: next });
    return true;
  }
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
  listByUser: async (userId) => {
    try {
      const token = localStorage.getItem('instaatrim_token');
      const res = await fetch(`${API_BASE}/tickets/user/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (res.ok) {
        const mapped = (json.data || []).map(t => ({ ...t, id: t._id || t.id }));
        return mapped;
      }
    } catch (e) {
      console.error(e);
    }
    return clone(getState().tickets.filter((t) => t.userId === userId));
  },

  listAll: async () => {
    try {
      const res = await fetch(`${API_BASE}/tickets`, { headers: authHeaders() });
      const json = await res.json();
      if (res.ok) {
        const mapped = (json.data || []).map(t => ({ ...t, id: t._id || t.id }));
        dispatch({ type: 'SET_TICKETS', payload: mapped });
        return mapped;
      }
    } catch (e) {
      console.error(e);
    }
    return clone(getState().tickets);
  },

  create: async (data) => {
    try {
      const token = localStorage.getItem('instaatrim_token');
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const ticket = { ...json.data, id: json.data._id || json.data.id };
        dispatch({ type: 'ADD_TICKET', payload: ticket });
        return clone(ticket);
      }
    } catch (e) {
      console.error(e);
    }
    // Fallback local
    const ticket = { id: newTicketId(), status: 'Open', createdAt: new Date().toISOString(), messages: [], ...data };
    dispatch({ type: 'ADD_TICKET', payload: ticket });
    return clone(ticket);
  },

  updateStatus: async (ticketId, status) => {
    try {
      await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.error(e);
    }
    dispatch({ type: 'UPDATE_TICKET', payload: { ticketId, patch: { status } } });
    return true;
  },

  addMessage: async (ticketId, message) => {
    try {
      await fetch(`${API_BASE}/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(message)
      });
    } catch (e) {
      console.error(e);
    }
    dispatch({ type: 'APPEND_TICKET_MESSAGE', payload: { ticketId, message } });
    return true;
  }
};

// =============================================================================
// Customers / Auth
// =============================================================================

// Helper: get stored JWT token from localStorage, or mock admin token if admin is logged in
const getAuthToken = () => {
  const state = getState();
  if (state && state.adminSession) {
    return 'mock-jwt-token-7a8b9c0d1e2f3g4h5i6j';
  }
  return localStorage.getItem('instaatrim_token');
};

// Helper: build auth headers with Bearer JWT
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
});



const mapCustomerFromApi = (customer, fallback = {}) => ({
  ...fallback,
  id: String(customer.id || customer._id || fallback.id || ''),
  isLoggedIn: true,
  name: customer.name || fallback.name || 'Customer',
  phone: customer.phone || fallback.phone || '',
  email: customer.email || fallback.email || '',
  gender: customer.gender || fallback.gender || 'female',
  dob: customer.dob || fallback.dob || null,
  is_elite: customer.is_elite ?? fallback.is_elite ?? false,
  wallet_balance: customer.wallet_balance !== undefined ? customer.wallet_balance : (fallback.wallet_balance || 0),
  referral_code: customer.referral_code || fallback.referral_code || null,
  favoriteSalonIds: (customer.favorite_salon_ids || fallback.favoriteSalonIds || []).map(String),
  savedLocations: (customer.saved_locations || fallback.savedLocations || []).map((location) => ({
    ...location,
    userId: String(customer.id || customer._id || fallback.id || location.userId)
  })),
  cartItems: customer.cart_items || fallback.cartItems || [],
  bookingSlot: customer.booking_slot || fallback.bookingSlot || null,
  authProvider: customer.auth_provider || fallback.authProvider || 'otp',
  notificationPrefs: fallback.notificationPrefs || { push: true, sms: true, email: true, whatsapp: false, marketing: false }
});

const customers = {
  list: () => withLatency(() => clone(getState().customers)),

  current: () =>
    withLatency(() => {
      const state = getState();
      return clone(state.customers.find((c) => c.id === state.currentCustomerId));
    }),

  // Called after OTP verified — syncs real DB profile into the local store
  loginWithPhone: async (phone, name) => {
    try {
      const token = getAuthToken();
      if (token) {
        // Fetch real profile from backend
        const res = await fetch(`${API_BASE}/customers/me`, {
          headers: authHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          const dbCustomer = data.customer;
          const record = mapCustomerFromApi(dbCustomer, { name, phone, email: `${phone}@drimstyle.com` });
          const locations = record.savedLocations;
          dispatch({ type: 'SET_CUSTOMER_LOCATIONS', payload: { userId: record.id, locations } });
          dispatch({ type: 'UPSERT_CUSTOMER', payload: record });
          return clone(record);
        }
      }
    } catch (_) {
      // Fallback to local mock if backend unavailable
    }
    // Fallback: local mock record
    const id = getState().currentCustomerId || 'cust-1';
    const record = {
      id,
      isLoggedIn: true,
      name: name || 'Customer',
      phone,
      email: `${phone}@drimstyle.com`,
      is_elite: false,
      authProvider: 'otp',
      notificationPrefs: { push: true, sms: true, email: true, whatsapp: false, marketing: false },
    };
    dispatch({ type: 'UPSERT_CUSTOMER', payload: record });
    return clone(record);
  },

  loginWithProvider: (provider, profile) =>
    withLatency(() => {
      const id = getState().currentCustomerId || 'cust-1';
      const record = {
        id,
        isLoggedIn: true,
        is_elite: false,
        authProvider: provider,
        notificationPrefs: { push: true, sms: true, email: true, whatsapp: false, marketing: false },
        ...profile,
      };
      dispatch({ type: 'UPSERT_CUSTOMER', payload: record });
      return clone(record);
    }),

  logout: async () => {
    try {
      const token = getAuthToken();
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: authHeaders(),
        });
      }
    } catch (_) {
      // Ignore network errors, proceed with local logout
    }
    // Clear JWT + stored customer from localStorage
    localStorage.removeItem('instaatrim_token');
    localStorage.removeItem('instaatrim_customer');

    // Clear Auth Page session state so they start at the phone screen
    sessionStorage.removeItem('instaatrim_auth_step');
    sessionStorage.removeItem('instaatrim_auth_phone');
    sessionStorage.removeItem('instaatrim_auth_countdown');
    sessionStorage.removeItem('instaatrim_auth_isNewUser');
    sessionStorage.removeItem('instaatrim_auth_token');

    dispatch({ type: 'LOGOUT_CUSTOMER' });
    return true;
  },

  updateProfile: async (patch) => {
    try {
      const token = getAuthToken();
      if (token) {
        // Update on real backend
        const res = await fetch(`${API_BASE}/customers/me`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(patch),
        });
        if (res.ok) {
          const data = await res.json();
          // Sync updated profile into local store
          dispatch({ type: 'PATCH_CURRENT_CUSTOMER', payload: { ...patch, ...mapCustomerFromApi(data.customer) } });
          const state = getState();
          return clone(state.customers.find((c) => c.id === state.currentCustomerId));
        }
      }
    } catch (_) {
      // Fallback to local mock
    }
    // Fallback: local mock update
    dispatch({ type: 'PATCH_CURRENT_CUSTOMER', payload: patch });
    const state = getState();
    return clone(state.customers.find((c) => c.id === state.currentCustomerId));
  },

  fetchMyProfile: async () => {
    try {
      const token = getAuthToken();
      if (token) {
        const res = await fetch(`${API_BASE}/customers/me`, {
          headers: authHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          const record = mapCustomerFromApi(data.customer);
          dispatch({ type: 'SET_CUSTOMER_LOCATIONS', payload: { userId: record.id, locations: record.savedLocations } });
          dispatch({ type: 'PATCH_CURRENT_CUSTOMER', payload: record });
          const state = getState();
          return clone(state.customers.find((c) => c.id === state.currentCustomerId));
        }
      }
    } catch (_) {
      // Fallback
    }
    const state = getState();
    return clone(state.customers.find((c) => c.id === state.currentCustomerId));
  },
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
  getAll: async () => {
    dispatch({ type: 'SET_ADS_LOADING', payload: true });
    try {
      const res = await fetch(`${API_BASE}/ads`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok || json.success !== true || !Array.isArray(json.data)) {
        throw new Error(json.message || `Ads request failed (${res.status})`);
      }
      const apiAds = json.data.map(ad => ({
        ...ad,
        id: ad._id,
        // Extract the first image to display in the UI as 'image' property
        image: (ad.images && ad.images.length > 0) ? ad.images[0] : ad.image
      }));
      // Extract hero banners and set desc from description
      const heroBanners = apiAds
        .filter(ad => ad.campaignType === 'hero_banner')
        .map(ad => ({ ...ad, desc: ad.description }));

      dispatch({ type: 'SET_HERO_BANNERS', payload: heroBanners });

      dispatch({ type: 'SET_ADVERTISEMENTS', payload: apiAds });
      dispatch({ type: 'SET_ADS_LOADING', payload: false });
      const s = getState();
      return {
        advertisements: apiAds,
        brandPartners: clone(s.brandPartners || []),
        heroBanners: heroBanners.length ? heroBanners : clone(s.heroBanners || []),
        midPageCampaigns: clone(s.midPageCampaigns || []),
        midPageCampaign: clone(s.midPageCampaign || {})
      };
    } catch (e) {
      console.error('Failed to fetch ads from backend:', e);
    }
    dispatch({ type: 'SET_ADS_LOADING', payload: false });
    const s = getState();
    return {
      advertisements: clone(s.advertisements || []),
      brandPartners: clone(s.brandPartners || []),
      heroBanners: clone(s.heroBanners || []),
      midPageCampaigns: clone(s.midPageCampaigns || []),
      midPageCampaign: clone(s.midPageCampaign || {})
    };
  },

  createAd: async (data) => {
    try {
      const isFormData = data instanceof FormData;
      const headers = { ...authHeaders() };
      if (isFormData) {
        delete headers['Content-Type']; // Let browser set boundary
      }

      const res = await fetch(`${API_BASE}/ads`, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data)
      });

      const json = await res.json();
      if (!json.success) throw new ApiError(json.message || 'Error creating ad', 'AD_CREATE_FAILED');

      const item = {
        ...json.data,
        id: json.data._id
      };

      if (item.images && item.images.length > 0) {
        item.image = item.images[0];
      }

      dispatch({ type: 'ADS_CREATE', payload: item });
      return clone(item);
    } catch (e) {
      console.error('Fallback ad creation:', e);
      // Fallback
      const item = {
        id: newAdId(),
        isActive: true,
        ...(data instanceof FormData ? Object.fromEntries(data.entries()) : data)
      };
      dispatch({ type: 'ADS_CREATE', payload: item });
      return clone(item);
    }
  },

  updateAd: async (id, patch) => {
    try {
      const isFormData = patch instanceof FormData;
      const headers = { ...authHeaders() };
      if (isFormData) {
        delete headers['Content-Type'];
      }

      const res = await fetch(`${API_BASE}/ads/${id}`, {
        method: 'PUT',
        headers,
        body: isFormData ? patch : JSON.stringify(patch)
      });

      const json = await res.json();
      if (!json.success) throw new ApiError(json.message || 'Error updating ad', 'AD_UPDATE_FAILED');

      const item = {
        ...json.data,
        id: json.data._id
      };

      if (item.images && item.images.length > 0) {
        item.image = item.images[0];
      }

      dispatch({ type: 'ADS_UPDATE', payload: { id, patch: item } });
      return clone(item);
    } catch (e) {
      console.error('Fallback ad update:', e);
      // Fallback
      dispatch({ type: 'ADS_UPDATE', payload: { id, patch: (patch instanceof FormData ? Object.fromEntries(patch.entries()) : patch) } });
      const updated = getState().advertisements.find((a) => a.id === id);
      return clone(updated);
    }
  },

  deleteAd: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/ads/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const json = await res.json();
      if (!json.success) throw new ApiError(json.message || 'Error deleting ad');

      dispatch({ type: 'ADS_DELETE', payload: id });
      return true;
    } catch (e) {
      console.error('Fallback ad delete:', e);
      dispatch({ type: 'ADS_DELETE', payload: id });
      return true;
    }
  },

  toggleAdActive: async (id) => {
    try {
      // Find current ad
      const ad = getState().advertisements.find(a => a.id === id);
      if (!ad) throw new Error('Ad not found');

      const newActive = !ad.isActive;
      const res = await fetch(`${API_BASE}/ads/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ isActive: newActive })
      });

      const json = await res.json();
      if (!json.success) throw new ApiError(json.message);

      dispatch({ type: 'ADS_TOGGLE_ACTIVE', payload: id });
      const updated = getState().advertisements.find((a) => a.id === id);
      return clone(updated);
    } catch (e) {
      console.error('Fallback ad toggle:', e);
      dispatch({ type: 'ADS_TOGGLE_ACTIVE', payload: id });
      const updated = getState().advertisements.find((a) => a.id === id);
      return clone(updated);
    }
  },

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

  // Hero Carousel Banners
  createHeroBanner: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/herobanners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const item = { ...json.data, id: json.data._id };
        dispatch({ type: 'ADD_HERO_BANNER', payload: item });
        return clone(item);
      }
    } catch (e) { console.error(e); }
    return null;
  },

  updateHeroBanner: async (id, patch) => {
    try {
      const res = await fetch(`${API_BASE}/herobanners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      const json = await res.json();
      if (res.ok && json.data) {
        dispatch({ type: 'UPDATE_HERO_BANNER', payload: { id, patch: json.data } });
        return clone(json.data);
      }
    } catch (e) { console.error(e); }
    return null;
  },

  deleteHeroBanner: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/herobanners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        dispatch({ type: 'DELETE_HERO_BANNER', payload: id });
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  },

  toggleHeroBannerActive: async (id) => {
    try {
      const banner = (getState().heroBanners || []).find((b) => b.id === id);
      if (!banner) return null;

      const res = await fetch(`${API_BASE}/herobanners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive })
      });
      const json = await res.json();
      if (res.ok && json.data) {
        dispatch({ type: 'TOGGLE_HERO_BANNER_ACTIVE', payload: id });
        return clone(json.data);
      }
    } catch (e) { console.error(e); }
    return null;
  },

  // Mid-Page Deals Carousel Campaigns
  createMidCampaign: (data) =>
    withLatency(() => {
      const item = {
        id: newCampaignId(),
        isActive: true,
        ...data
      };
      dispatch({ type: 'ADD_MID_CAMPAIGN', payload: item });
      return clone(item);
    }),

  updateMidCampaign: (idOrPatch, patch) =>
    withLatency(() => {
      if (typeof idOrPatch === 'string') {
        dispatch({ type: 'UPDATE_MID_CAMPAIGN', payload: { id: idOrPatch, patch } });
        const updated = (getState().midPageCampaigns || []).find((c) => c.id === idOrPatch);
        return clone(updated);
      } else {
        // Backward compatibility for single-object patch
        dispatch({ type: 'MID_CAMPAIGN_UPDATE', payload: idOrPatch });
        return clone(getState().midPageCampaign);
      }
    }),

  deleteMidCampaign: (id) =>
    withLatency(() => {
      dispatch({ type: 'DELETE_MID_CAMPAIGN', payload: id });
      return true;
    }),

  toggleMidCampaignActive: (id) =>
    withLatency(() => {
      dispatch({ type: 'TOGGLE_MID_CAMPAIGN_ACTIVE', payload: id });
      const updated = (getState().midPageCampaigns || []).find((c) => c.id === id);
      return clone(updated);
    })
};

// =============================================================================
// Categories (Admin-defined, salon & customer accessible)
// =============================================================================
const categories = {
  list: async (filters = {}) => {
    try {
      const res = await fetch(`${API_BASE}/categories`, { headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        const mapped = json.data.map(cat => ({ ...cat, id: cat._id }));
        dispatch({ type: 'SET_CATEGORIES', payload: mapped });
        let result = mapped;
        if (filters.onlyActive) result = result.filter(c => c.isActive !== false);
        if (filters.gender && filters.gender !== 'all') {
          result = result.filter(c => c.gender === 'unisex' || c.gender === filters.gender);
        }
        return result;
      }
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    }
    // Fallback
    let result = clone(getState().categories || []);
    if (filters.onlyActive) result = result.filter(c => c.isActive !== false);
    if (filters.gender && filters.gender !== 'all') {
      result = result.filter(c => c.gender === 'unisex' || c.gender === filters.gender);
    }
    return result;
  },

  get: async (categoryId) => {
    // Relying on state since list fetches it
    const cat = (getState().categories || []).find((c) => c.id === categoryId || c.slug === categoryId);
    if (!cat) throw new ApiError(`Category ${categoryId} not found`, 'NOT_FOUND');
    return clone(cat);
  },

  create: async (data) => {
    try {
      const isFormData = data instanceof FormData;
      const headers = { ...authHeaders() };
      if (isFormData) delete headers['Content-Type'];

      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data)
      });
      const json = await res.json();
      if (!json.success) throw new ApiError(json.message);

      const newCategory = { ...json.data, id: json.data._id };
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
      return clone(newCategory);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  update: async (categoryId, patch) => {
    try {
      const isFormData = patch instanceof FormData;
      const headers = { ...authHeaders() };
      if (isFormData) delete headers['Content-Type'];

      const res = await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: 'PUT',
        headers,
        body: isFormData ? patch : JSON.stringify(patch)
      });
      const json = await res.json();
      if (!json.success) throw new ApiError(json.message);

      const updated = { ...json.data, id: json.data._id };
      dispatch({ type: 'UPDATE_CATEGORY', payload: { categoryId, patch: updated } });
      return clone(updated);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  remove: async (categoryId) => {
    try {
      await fetch(`${API_BASE}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      dispatch({ type: 'DELETE_CATEGORY', payload: { categoryId } });
      return true;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  toggleActive: async (categoryId) => {
    try {
      const res = await fetch(`${API_BASE}/categories/${categoryId}/toggle`, {
        method: 'PATCH',
        headers: authHeaders()
      });
      const json = await res.json();
      if (json.success) {
        dispatch({ type: 'TOGGLE_CATEGORY_ACTIVE', payload: { categoryId } });
        const updated = (getState().categories || []).find((c) => c.id === categoryId);
        return clone(updated);
      }
      throw new Error();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
};

// =============================================================================
// Promotions & Indexing Boost (Admin control for pushing salons/services on top)
// =============================================================================
const promotions = {
  boostSalon: async (salonId, boostData) => {
    const patch = {
      isBoosted: true,
      ...boostData
    };
    try {
      const res = await fetch(`${API_BASE}/salons/${salonId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(patch)
      });
      const json = await res.json();
      if (!json.success) throw new ApiError(json.message);

      dispatch({ type: 'PATCH_SALON', payload: { id: salonId, patch: json.data } });
      return json.data;
    } catch (e) {
      console.error('Boost salon failed:', e);
      throw e;
    }
  },

  removeSalonBoost: async (salonId) => {
    const patch = {
      isBoosted: false,
      isSponsored: false,
      boostRank: null,
      sponsorBadge: null,
      boostReason: null
    };
    try {
      const res = await fetch(`${API_BASE}/salons/${salonId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(patch)
      });
      const json = await res.json();
      if (!json.success) throw new ApiError(json.message);

      dispatch({ type: 'PATCH_SALON', payload: { id: salonId, patch: json.data } });
      return json.data;
    } catch (e) {
      console.error('Remove salon boost failed:', e);
      throw e;
    }
  },

  boostService: async (serviceId, boostData) => {
    const patch = {
      isBoosted: true,
      ...boostData
    };
    const updated = await api.services.update(serviceId, patch);
    return updated;
  },

  removeServiceBoost: async (serviceId) => {
    const patch = {
      isBoosted: false,
      isSponsored: false,
      boostRank: null,
      sponsorBadge: '',
      boostReason: ''
    };
    const updated = await api.services.update(serviceId, patch);
    return updated;
  }
};

// =============================================================================
// Payouts & Settlements
// =============================================================================
const payouts = {
  listAll: async () => {
    try {
      const res = await fetch(`${API_BASE}/payouts`, { headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        dispatch({ type: 'SET_PAYOUTS', payload: json.data });
        return json.data;
      }
    } catch (e) { console.error('Failed to fetch payouts', e); }
    return clone(getState().payouts || []);
  },

  listBySalon: async (salonId) => {
    try {
      const res = await fetch(`${API_BASE}/payouts`, { headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        const data = (json.data || [])
          .filter((p) => p.salonId === salonId)
          .map((p) => ({ ...p, id: p.id || p._id }));
        dispatch({ type: 'SET_PAYOUTS_BY_SALON', payload: { salonId, payouts: data } });
        return data;
      }
    } catch (e) { console.error('Failed to fetch payouts', e); }
    return clone((getState().payouts || []).filter((p) => p.salonId === salonId));
  },

  request: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/payouts`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          status: 'Pending',
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          settledAt: null,
          utr: null,
          notes: '',
          ...data,
          commissionPercent: Number(data.commissionPercent ?? String(data.commissionRate || '').replace(/[^0-9.]/g, '')) || 0
        })
      });
      if (res.ok) {
        const json = await res.json();
        dispatch({ type: 'REQUEST_PAYOUT', payload: json.data });
        return json.data;
      }
    } catch (e) { console.error(e); }
    return null;
  },

  updateStatus: async (payoutId, status, extra = {}) => {
    try {
      const res = await fetch(`${API_BASE}/payouts/${payoutId}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status, utr: extra.utr, notes: extra.notes || extra.rejectionReason })
      });
      if (res.ok) {
        const json = await res.json();
        dispatch({ type: 'UPDATE_PAYOUT_STATUS', payload: { payoutId, status, extra } });
        return json.data;
      }
    } catch (e) { console.error(e); }
    return null;
  },

  delete: (payoutId) =>
    withLatency(() => {
      dispatch({ type: 'DELETE_PAYOUT', payload: { payoutId } });
      return true;
    })
};

// =============================================================================
// Platform Commercial & Operational Settings
// =============================================================================
const platformSettings = {
  get: async () => {
    try {
      const res = await fetch(`${API_BASE}/platform-settings`);
      const json = await res.json();
      const data = json.data || {};
      dispatch({ type: 'UPDATE_PLATFORM_SETTINGS', payload: data });
      return data;
    } catch (e) {
      console.error(e);
      return clone(getState().platformSettings);
    }
  },

  update: async (patch) => {
    try {
      const res = await fetch(`${API_BASE}/platform-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      const json = await res.json();
      const data = json.data || patch;
      dispatch({ type: 'UPDATE_PLATFORM_SETTINGS', payload: data });
      return data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
};

// =============================================================================
// Elite Membership Plan
// =============================================================================
const elitePlan = {
  get: async () => {
    try {
      const res = await fetch(`${API_BASE}/page-campaigns/elite`);
      const json = await res.json();
      const data = json.data || {};
      dispatch({ type: 'UPDATE_ELITE_PLAN', payload: data });
      return data;
    } catch (e) {
      console.error(e);
      return clone(getState().elitePlan);
    }
  },

  update: async (patch) => {
    try {
      const res = await fetch(`${API_BASE}/page-campaigns/elite`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(patch)
      });
      const json = await res.json();
      const data = json.data || {};
      dispatch({ type: 'UPDATE_ELITE_PLAN', payload: data });
      return data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
};

// =============================================================================
// Editorial Content (Skincare Studio & Beauty Trends)
// =============================================================================
const editorial = {
  getSkincare: async () => {
    try {
      const res = await fetch(`${API_BASE}/rituals?type=skincare`);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  addSkincare: async (data) => {
    const formData = new FormData();
    formData.append('type', 'skincare');
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    const res = await fetch(`${API_BASE}/rituals`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    return json.data;
  },

  updateSkincare: async (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    const res = await fetch(`${API_BASE}/rituals/${id}`, {
      method: 'PUT',
      body: formData
    });
    const json = await res.json();
    return json.data;
  },

  deleteSkincare: async (id) => {
    await fetch(`${API_BASE}/rituals/${id}`, { method: 'DELETE' });
    return true;
  },

  getTrends: async () => {
    try {
      const res = await fetch(`${API_BASE}/rituals?type=trend`);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  addTrend: async (data) => {
    const formData = new FormData();
    formData.append('type', 'trend');
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    const res = await fetch(`${API_BASE}/rituals`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    return json.data;
  },

  updateTrend: async (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    const res = await fetch(`${API_BASE}/rituals/${id}`, {
      method: 'PUT',
      body: formData
    });
    const json = await res.json();
    return json.data;
  },

  deleteTrend: async (id) => {
    await fetch(`${API_BASE}/rituals/${id}`, { method: 'DELETE' });
    return true;
  }
};

// =============================================================================
// Landing page content (public read, admin write)
// =============================================================================
const landing = {
  get: async () => {
    const res = await fetch(`${API_BASE}/landing`);
    const json = await res.json();
    if (!json.success) throw new ApiError(json.message || 'Failed to load landing content');
    return { content: json.data, updatedAt: json.updatedAt };
  },

  update: async (content) => {
    const res = await fetch(`${API_BASE}/landing`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ content }) });
    const json = await res.json();
    if (!json.success) throw new ApiError(json.message || 'Failed to save landing content');
    return { content: json.data, updatedAt: json.updatedAt };
  },

  reset: async () => {
    const res = await fetch(`${API_BASE}/landing`, { method: 'DELETE', headers: authHeaders() });
    const json = await res.json();
    if (!json.success) throw new ApiError(json.message || 'Failed to reset landing content');
    return true;
  }
};

export const api = {
  categories,
  promotions,
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
  ads,
  payouts,
  platformSettings,
  elitePlan,
  editorial,
  landing
};


export { ApiError };
export default api;


