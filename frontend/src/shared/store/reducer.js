// Pure reducer for the shared app store. Every mutation the customer app
// or the salon partner panel makes — across bookings, services, offers,
// staff, stations, reviews, locations, holds, notifications and tickets —
// goes through here, so it is the one place the whole data model can be
// read at a glance.

import {
  SALONS,
  SERVICES,
  STAFF,
  STATIONS,
  BOOKINGS,
  OFFERS,
  COUPONS,
  REVIEWS,
  LOCATIONS,
  DEFAULT_CUSTOMER,
  CATEGORIES,
  BANNERS,
  DEFAULT_PAYOUTS,
  DEFAULT_PLATFORM_SETTINGS,
  DEFAULT_ELITE_PLAN,
  DEFAULT_EDITORIAL_SKINCARE,
  DEFAULT_EDITORIAL_TRENDS,
  DEFAULT_TICKETS,
  DEFAULT_NOTIFICATIONS
} from '../data/seed';
import { BRAND_PARTNERS, MID_PAGE_CAMPAIGN, MID_PAGE_CAMPAIGNS } from '../data/advertisements';
import { canTransition } from '../lib/bookingStatus';
import { dateKey } from '../lib/time';

const resolveSeedBookingDates = (bookings) =>
  bookings.map((b) => {
    if (b.dateKey) return b;
    const d = new Date();
    d.setDate(d.getDate() + (b.dayOffset || 0));
    return { ...b, dateKey: dateKey(d) };
  });

export const buildInitialState = () => ({
  categories: CATEGORIES.map((c) => ({ ...c, isActive: c.isActive !== false })),
  heroBanners: BANNERS.map((b) => ({ ...b, isActive: b.isActive !== false })),
  salons: [],
  services: [],
  staff: [],
  stations: [],
  bookings: [],
  offers: [],
  coupons: COUPONS,
  reviews: [],
  locations: LOCATIONS,
  advertisements: [],
  adsLoading: true,
  brandPartners: BRAND_PARTNERS.map((bp) => ({ ...bp, isActive: bp.isActive !== false })),
  midPageCampaign: { ...MID_PAGE_CAMPAIGN, isActive: MID_PAGE_CAMPAIGN.isActive !== false },
  midPageCampaigns: MID_PAGE_CAMPAIGNS.map((c) => ({ ...c, isActive: c.isActive !== false })),
  payouts: DEFAULT_PAYOUTS,
  platformSettings: DEFAULT_PLATFORM_SETTINGS,
  elitePlan: DEFAULT_ELITE_PLAN,
  skincareItems: [],
  trendsItems: [],
  holds: [],
  notifications: DEFAULT_NOTIFICATIONS,
  tickets: [],
  customers: [],
  currentCustomerId: null,
  partnerSession: null, // { salonId } once a partner logs in
  adminSession: null // { email, name, role } once an admin logs in
});


export function appReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': {
      // Merge persisted/remote data over the seed defaults so a new field
      // added to seed.js in a later release still shows up for returning
      // users instead of being silently missing.
      return { ...buildInitialState(), ...action.payload };
    }

    // ---------------- Salons ----------------
    case 'SET_SALONS': {
      return { ...state, salons: action.payload };
    }
    case 'DELETE_SALON': {
      const salonId = action.payload.salonId || action.payload.id || action.payload;
      return { ...state, salons: state.salons.filter((salon) => salon.id !== salonId && salon._id !== salonId) };
    }

    // ---------------- Customers ----------------
    case 'SET_CUSTOMERS': {
      return { ...state, customers: action.payload };
    }
    case 'UPSERT_CUSTOMER': {
      const exists = (state.customers || []).find(c => c.id === action.payload.id);
      if (exists) {
        return { ...state, customers: state.customers.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c), currentCustomerId: action.payload.id };
      }
      return { ...state, customers: [action.payload, ...(state.customers || [])], currentCustomerId: action.payload.id };
    }
    case 'PATCH_CURRENT_CUSTOMER': {
      return { ...state, customers: (state.customers || []).map(c => c.id === state.currentCustomerId ? { ...c, ...action.payload } : c) };
    }
    case 'LOGOUT_CUSTOMER': {
      return { ...state, currentCustomerId: null };
    }
    case 'ADD_SALON': {
      return { ...state, salons: [action.payload, ...state.salons] };
    }
    case 'PATCH_SALON': {
      const { salonId, patch } = action.payload;
      return {
        ...state,
        salons: state.salons.map((s) => (s.id === salonId ? { ...s, ...patch } : s))
      };
    }

    // ---------------- Bookings ----------------
    case 'SET_BOOKINGS': {
      return { ...state, bookings: action.payload };
    }
    case 'ADD_BOOKING': {
      return { ...state, bookings: [action.payload, ...state.bookings] };
    }
    case 'UPDATE_BOOKING_STATUS': {
      const { bookingId, status, extra = {}, force = false } = action.payload;
      return {
        ...state,
        bookings: state.bookings.map((b) => {
          if (b.id !== bookingId) return b;
          if (!force && !canTransition(b.status, status)) return b;
          return { ...b, status, ...extra };
        })
      };
    }
    case 'PATCH_BOOKING': {
      const { bookingId, patch } = action.payload;
      return {
        ...state,
        bookings: state.bookings.map((b) => (b.id === bookingId ? { ...b, ...patch } : b))
      };
    }

    // ---------------- Services ----------------
    case 'ADD_SERVICE': {
      return { ...state, services: [action.payload, ...state.services] };
    }
    case 'UPDATE_SERVICE': {
      const { serviceId, patch } = action.payload;
      return {
        ...state,
        services: state.services.map((s) => (s.id === serviceId ? { ...s, ...patch } : s))
      };
    }

    case 'DELETE_SERVICE': {
      return { ...state, services: state.services.filter((s) => s.id !== action.payload.serviceId) };
    }

    // ---------------- Offers ----------------
    case 'SET_OFFERS': {
      return { ...state, offers: action.payload };
    }
    case 'ADD_OFFER': {
      return { ...state, offers: [action.payload, ...state.offers] };
    }
    case 'UPDATE_OFFER': {
      const { offerId, patch } = action.payload;
      return {
        ...state,
        offers: state.offers.map((o) => (o.id === offerId ? { ...o, ...patch } : o))
      };
    }

    // ---------------- Categories (Admin Defined) ----------------
    case 'SET_CATEGORIES': {
      return { ...state, categories: action.payload };
    }
    case 'ADD_CATEGORY':
    case 'CATEGORY_CREATE': {
      return { ...state, categories: [action.payload, ...(state.categories || [])] };
    }
    case 'UPDATE_CATEGORY':
    case 'CATEGORY_UPDATE': {
      const targetId = action.payload.categoryId || action.payload.id;
      const patch = action.payload.patch || action.payload;
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === targetId ? { ...c, ...patch } : c))
      };
    }
    case 'DELETE_CATEGORY':
    case 'CATEGORY_DELETE': {
      const targetId = action.payload.categoryId || action.payload.id || action.payload;
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== targetId)
      };
    }
    case 'TOGGLE_CATEGORY_ACTIVE': {
      const targetId = action.payload.categoryId || action.payload.id || action.payload;
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === targetId ? { ...c, isActive: !c.isActive } : c
        )
      };
    }

    // ---------------- Salons ----------------
    case 'ADD_SALON': {
      return {
        ...state,
        salons: [action.payload, ...state.salons]
      };
    }
    case 'PATCH_SALON': {
      const salonId = action.payload.salonId || action.payload.id;
      const patch = action.payload.patch;
      return {
        ...state,
        salons: state.salons.map((s) => ((s.id || s._id) === salonId ? { ...s, ...patch } : s))
      };
    }
    case 'BOOST_SALON': {
      const { salonId, boostData } = action.payload;
      return {
        ...state,
        salons: state.salons.map((s) =>
          s.id === salonId
            ? {
              ...s,
              isBoosted: boostData.isBoosted !== false,
              isSponsored: boostData.isSponsored ?? true,
              boostRank: Number(boostData.boostRank) || 1,
              boostReason: boostData.boostReason || 'Featured Partner Spotlight',
              sponsorBadge: boostData.sponsorBadge || 'SPONSORED'
            }
            : s
        )
      };
    }

    // ---------------- Stations ----------------
    case 'SET_STATIONS': {
      const incoming = Array.isArray(action.payload) ? action.payload : [];
      if (incoming.length === 0) return { ...state };
      
      const existing = [...(state.stations || [])];
      for (const item of incoming) {
        const id = item.id || item._id;
        const idx = existing.findIndex(s => (s.id && s.id === id) || (s._id && s._id === id));
        if (idx >= 0) {
          existing[idx] = { ...existing[idx], ...item };
        } else {
          existing.push(item);
        }
      }
      return { ...state, stations: existing };
    }

    // ---------------- Services ----------------
    case 'SET_SERVICES': {
      const incoming = Array.isArray(action.payload) ? action.payload : [];
      if (incoming.length === 0) return { ...state };

      const existing = [...(state.services || [])];
      for (const item of incoming) {
        const id = item.id || item._id;
        const idx = existing.findIndex(s => (s.id && s.id === id) || (s._id && s._id === id));
        if (idx >= 0) {
          existing[idx] = { ...existing[idx], ...item };
        } else {
          existing.push(item);
        }
      }
      return { ...state, services: existing };
    }
    case 'ADD_SERVICE': {
      return { ...state, services: [...state.services, action.payload] };
    }
    case 'UPDATE_SERVICE': {
      const serviceId = action.payload.serviceId || action.payload.id;
      const patch = action.payload.patch;
      return {
        ...state,
        services: state.services.map((s) => ((s.id || s._id) === serviceId ? { ...s, ...patch } : s))
      };
    }
    case 'DELETE_SERVICE': {
      return {
        ...state,
        services: state.services.filter((s) => s.id !== action.payload.serviceId && s._id !== action.payload.serviceId)
      };
    }

    // ---------------- Ads ----------------
    case 'SET_ADS': {
      return { ...state, advertisements: action.payload };
    }
    case 'REMOVE_SALON_BOOST': {
      const { salonId } = action.payload;
      return {
        ...state,
        salons: state.salons.map((s) =>
          s.id === salonId
            ? {
              ...s,
              isBoosted: false,
              isSponsored: false,
              boostRank: null,
              boostReason: null,
              sponsorBadge: null
            }
            : s
        )
      };
    }
    case 'BOOST_SERVICE': {
      const { serviceId, boostData } = action.payload;
      return {
        ...state,
        services: state.services.map((srv) =>
          srv.id === serviceId
            ? {
              ...srv,
              isBoosted: boostData.isBoosted !== false,
              isSponsored: boostData.isSponsored ?? true,
              boostRank: Number(boostData.boostRank) || 1,
              boostReason: boostData.boostReason || 'Top Trending Pick',
              sponsorBadge: boostData.sponsorBadge || 'SPONSORED'
            }
            : srv
        )
      };
    }
    case 'REMOVE_SERVICE_BOOST': {
      const { serviceId } = action.payload;
      return {
        ...state,
        services: state.services.map((srv) =>
          srv.id === serviceId
            ? {
              ...srv,
              isBoosted: false,
              isSponsored: false,
              boostRank: null,
              boostReason: null,
              sponsorBadge: null
            }
            : srv
        )
      };
    }

    // ---------------- Staff & Stations ----------------
    case 'ADD_STAFF': {
      const incomingId = action.payload.id || action.payload._id;
      const existingIdx = state.staff.findIndex((s) => (s.id && s.id === incomingId) || (s._id && s._id === incomingId));
      if (existingIdx >= 0) {
        const updated = [...state.staff];
        updated[existingIdx] = { ...updated[existingIdx], ...action.payload };
        return { ...state, staff: updated };
      }
      return { ...state, staff: [action.payload, ...state.staff] };
    }
    case 'UPDATE_STAFF': {
      const { staffId, patch } = action.payload;
      return { ...state, staff: state.staff.map((s) => (s.id === staffId ? { ...s, ...patch } : s)) };
    }
    case 'DELETE_STAFF': {
      return {
        ...state,
        staff: state.staff.filter((s) => s.id !== action.payload.staffId),
        stations: state.stations.map((st) => (st.staffId === action.payload.staffId ? { ...st, staffId: null } : st))
      };
    }
    case 'ADD_STATION': {
      return { ...state, stations: [...state.stations, action.payload] };
    }
    case 'UPDATE_STATION': {
      const { stationId, patch } = action.payload;
      return { ...state, stations: state.stations.map((st) => (st.id === stationId ? { ...st, ...patch } : st)) };
    }
    case 'DELETE_STATION': {
      return { ...state, stations: state.stations.filter((st) => st.id !== action.payload.stationId) };
    }

    // ---------------- Reviews ----------------
    case 'ADD_REVIEW': {
      return { ...state, reviews: [action.payload, ...state.reviews] };
    }
    case 'UPDATE_REVIEW': {
      const { reviewId, patch } = action.payload;
      return { ...state, reviews: state.reviews.map((r) => (r.id === reviewId ? { ...r, ...patch } : r)) };
    }
    case 'DELETE_REVIEW': {
      return { ...state, reviews: state.reviews.filter((r) => r.id !== action.payload.reviewId) };
    }

    // ---------------- Coupons ----------------
    case 'SET_COUPONS': {
      return { ...state, coupons: action.payload };
    }
    case 'ADD_COUPON': {
      return { ...state, coupons: [action.payload, ...(state.coupons || [])] };
    }
    case 'UPDATE_COUPON': {
      const { couponId, patch } = action.payload;
      return { ...state, coupons: (state.coupons || []).map((c) => (c.id === couponId ? { ...c, ...patch } : c)) };
    }
    case 'DELETE_COUPON': {
      return { ...state, coupons: (state.coupons || []).filter((c) => c.id !== action.payload.couponId) };
    }

    // ---------------- Locations ----------------
    case 'ADD_LOCATION': {
      return { ...state, locations: [...state.locations, action.payload] };
    }
    case 'SET_CUSTOMER_LOCATIONS': {
      const { userId, locations } = action.payload;
      return { ...state, locations: [...state.locations.filter((location) => location.userId !== userId), ...locations] };
    }
    case 'UPDATE_LOCATION': {
      const { locationId, patch } = action.payload;
      return { ...state, locations: state.locations.map((l) => (l.id === locationId ? { ...l, ...patch } : l)) };
    }
    case 'DELETE_LOCATION': {
      return { ...state, locations: state.locations.filter((l) => l.id !== action.payload.locationId) };
    }
    case 'SET_CURRENT_LOCATION': {
      return {
        ...state,
        locations: state.locations.map((l) => ({ ...l, isCurrent: l.id === action.payload.locationId }))
      };
    }

    // ---------------- Advertisements & Banners ----------------
    case 'SET_HERO_BANNERS': {
      return { ...state, heroBanners: action.payload };
    }
    case 'SET_ADVERTISEMENTS': {
      return { ...state, advertisements: action.payload };
    }
    case 'SET_ADS_LOADING': {
      return { ...state, adsLoading: action.payload };
    }
    case 'ADD_ADVERTISEMENT':
    case 'ADS_CREATE': {
      return { ...state, advertisements: [action.payload, ...(state.advertisements || [])] };
    }
    case 'UPDATE_ADVERTISEMENT':
    case 'ADS_UPDATE': {
      const targetId = action.payload.adId || action.payload.id;
      const patch = action.payload.patch || action.payload;
      return {
        ...state,
        advertisements: state.advertisements.map((ad) => (ad.id === targetId ? { ...ad, ...patch } : ad))
      };
    }
    case 'DELETE_ADVERTISEMENT':
    case 'ADS_DELETE': {
      const targetId = action.payload.adId || action.payload.id || action.payload;
      return {
        ...state,
        advertisements: state.advertisements.filter((ad) => ad.id !== targetId)
      };
    }
    case 'TOGGLE_ADVERTISEMENT_ACTIVE':
    case 'ADS_TOGGLE_ACTIVE': {
      const targetId = action.payload.adId || action.payload.id || action.payload;
      return {
        ...state,
        advertisements: state.advertisements.map((ad) =>
          ad.id === targetId ? { ...ad, isActive: !ad.isActive } : ad
        )
      };
    }

    // ---------------- Brand Partners ----------------
    case 'ADD_BRAND_PARTNER':
    case 'BRAND_PARTNER_CREATE': {
      return { ...state, brandPartners: [action.payload, ...state.brandPartners] };
    }
    case 'UPDATE_BRAND_PARTNER':
    case 'BRAND_PARTNER_UPDATE': {
      const targetId = action.payload.partnerId || action.payload.id;
      const patch = action.payload.patch || action.payload;
      return {
        ...state,
        brandPartners: state.brandPartners.map((bp) => (bp.id === targetId ? { ...bp, ...patch } : bp))
      };
    }
    case 'DELETE_BRAND_PARTNER':
    case 'BRAND_PARTNER_DELETE': {
      const targetId = action.payload.partnerId || action.payload.id || action.payload;
      return {
        ...state,
        brandPartners: state.brandPartners.filter((bp) => bp.id !== targetId)
      };
    }
    case 'TOGGLE_BRAND_PARTNER_ACTIVE': {
      const targetId = action.payload.partnerId || action.payload.id || action.payload;
      return {
        ...state,
        brandPartners: state.brandPartners.map((bp) =>
          bp.id === targetId ? { ...bp, isActive: !bp.isActive } : bp
        )
      };
    }

    // ---------------- Hero Package Banners Carousel ----------------
    case 'ADD_HERO_BANNER':
    case 'HERO_BANNER_CREATE': {
      return { ...state, heroBanners: [action.payload, ...state.heroBanners] };
    }
    case 'UPDATE_HERO_BANNER':
    case 'HERO_BANNER_UPDATE': {
      const targetId = action.payload.bannerId || action.payload.id;
      const patch = action.payload.patch || action.payload;
      return {
        ...state,
        heroBanners: state.heroBanners.map((b) => (b.id === targetId ? { ...b, ...patch } : b))
      };
    }
    case 'DELETE_HERO_BANNER':
    case 'HERO_BANNER_DELETE': {
      const targetId = action.payload.bannerId || action.payload.id || action.payload;
      return {
        ...state,
        heroBanners: state.heroBanners.filter((b) => b.id !== targetId)
      };
    }
    case 'TOGGLE_HERO_BANNER_ACTIVE': {
      const targetId = action.payload.bannerId || action.payload.id || action.payload;
      return {
        ...state,
        heroBanners: state.heroBanners.map((b) =>
          b.id === targetId ? { ...b, isActive: !b.isActive } : b
        )
      };
    }

    // ---------------- Mid-Page Campaign Carousel ----------------
    case 'ADD_MID_CAMPAIGN':
    case 'MID_CAMPAIGN_CREATE': {
      const nextList = [action.payload, ...(state.midPageCampaigns || [])];
      return {
        ...state,
        midPageCampaigns: nextList,
        midPageCampaign: action.payload
      };
    }
    case 'UPDATE_MID_CAMPAIGN':
    case 'MID_CAMPAIGN_UPDATE': {
      const targetId = action.payload.campaignId || action.payload.id;
      const patch = action.payload.patch || action.payload;
      const nextList = (state.midPageCampaigns || []).map((c) =>
        c.id === targetId ? { ...c, ...patch } : c
      );
      const updatedPrimary = nextList.find((c) => c.id === targetId) || { ...state.midPageCampaign, ...patch };
      return {
        ...state,
        midPageCampaigns: nextList,
        midPageCampaign: updatedPrimary
      };
    }
    case 'DELETE_MID_CAMPAIGN':
    case 'MID_CAMPAIGN_DELETE': {
      const targetId = action.payload.campaignId || action.payload.id || action.payload;
      const nextList = (state.midPageCampaigns || []).filter((c) => c.id !== targetId);
      return {
        ...state,
        midPageCampaigns: nextList,
        midPageCampaign: nextList[0] || null
      };
    }
    case 'TOGGLE_MID_CAMPAIGN_ACTIVE': {
      const targetId = action.payload.campaignId || action.payload.id || action.payload;
      const nextList = (state.midPageCampaigns || []).map((c) =>
        c.id === targetId ? { ...c, isActive: !c.isActive } : c
      );
      return {
        ...state,
        midPageCampaigns: nextList
      };
    }

    // ---------------- Holds (slot locking, Phase 1) ----------------
    case 'ADD_HOLD': {
      return { ...state, holds: [...state.holds, action.payload] };
    }
    case 'REMOVE_HOLD': {
      return { ...state, holds: state.holds.filter((h) => h.id !== action.payload.holdId) };
    }
    case 'PRUNE_EXPIRED_HOLDS': {
      const now = action.payload?.now ?? Date.now();
      return { ...state, holds: state.holds.filter((h) => h.expiresAt > now) };
    }

    // ---------------- Notifications (Phase 4) ----------------
    case 'SET_NOTIFICATIONS': {
      return { ...state, notifications: Array.isArray(action.payload) ? action.payload : [] };
    }
    case 'ADD_NOTIFICATION': {
      return { ...state, notifications: [action.payload, ...state.notifications] };
    }
    case 'MARK_NOTIFICATION_READ': {
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.payload.notificationId ? { ...n, isRead: true } : n))
      };
    }
    case 'MARK_ALL_NOTIFICATIONS_READ': {
      const { audience, audienceId } = action.payload;
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.audience === audience && n.audienceId === audienceId ? { ...n, isRead: true } : n
        )
      };
    }

    // ---------------- Support tickets (Phase 4) ----------------
    case 'SET_TICKETS': {
      return { ...state, tickets: action.payload };
    }
    case 'ADD_TICKET': {
      return { ...state, tickets: [action.payload, ...state.tickets] };
    }
    case 'UPDATE_TICKET': {
      const { ticketId, patch } = action.payload;
      return { ...state, tickets: state.tickets.map((t) => (t.id === ticketId ? { ...t, ...patch } : t)) };
    }
    case 'APPEND_TICKET_MESSAGE': {
      const { ticketId, message } = action.payload;
      return {
        ...state,
        tickets: state.tickets.map((t) => (t.id === ticketId ? { ...t, messages: [...t.messages, message] } : t))
      };
    }

    // ---------------- Customers / Auth ----------------
    case 'UPSERT_CUSTOMER': {
      const existingIdx = state.customers.findIndex((c) => c.id === action.payload.id);
      if (existingIdx === -1) {
        return { ...state, customers: [...state.customers, action.payload], currentCustomerId: action.payload.id };
      }
      const next = [...state.customers];
      next[existingIdx] = { ...next[existingIdx], ...action.payload };
      return { ...state, customers: next, currentCustomerId: action.payload.id };
    }
    case 'PATCH_CURRENT_CUSTOMER': {
      return {
        ...state,
        customers: state.customers.map((c) => (c.id === state.currentCustomerId ? { ...c, ...action.payload } : c))
      };
    }
    case 'LOGOUT_CUSTOMER': {
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.id === state.currentCustomerId ? { ...c, isLoggedIn: false, authProvider: null } : c
        )
      };
    }
    case 'SET_PARTNER_SESSION': {
      return { ...state, partnerSession: action.payload };
    }
    case 'SET_ADMIN_SESSION': {
      return { ...state, adminSession: action.payload };
    }

    // ---------------- Payouts & Settlements ----------------
    case 'SET_PAYOUTS': {
      return { ...state, payouts: action.payload };
    }
    case 'SET_PAYOUTS_BY_SALON': {
      const { salonId, payouts } = action.payload;
      return { ...state, payouts: [...(state.payouts || []).filter((p) => p.salonId !== salonId), ...payouts] };
    }
    case 'REQUEST_PAYOUT': {
      return { ...state, payouts: [action.payload, ...(state.payouts || [])] };
    }
    case 'UPDATE_PAYOUT_STATUS': {
      const { payoutId, status, extra = {} } = action.payload;
      return {
        ...state,
        payouts: (state.payouts || []).map((p) => (p.id === payoutId ? { ...p, status, ...extra } : p))
      };
    }
    case 'DELETE_PAYOUT': {
      return {
        ...state,
        payouts: (state.payouts || []).filter((p) => p.id !== action.payload.payoutId)
      };
    }

    // ---------------- Platform Global Settings ----------------
    case 'UPDATE_PLATFORM_SETTINGS': {
      return {
        ...state,
        platformSettings: { ...(state.platformSettings || DEFAULT_PLATFORM_SETTINGS), ...action.payload }
      };
    }

    // ---------------- Elite Membership Plan ----------------
    case 'UPDATE_ELITE_PLAN': {
      return {
        ...state,
        elitePlan: { ...(state.elitePlan || DEFAULT_ELITE_PLAN), ...action.payload }
      };
    }

    // ---------------- Editorial: Skincare & Trends ----------------
    case 'SET_SKINCARE_ITEMS': {
      return { ...state, skincareItems: action.payload };
    }
    case 'SET_TRENDS_ITEMS': {
      return { ...state, trendsItems: action.payload };
    }

    case 'ADD_EDITORIAL_SKINCARE': {
      return { ...state, skincareItems: [action.payload, ...(state.skincareItems || [])] };
    }
    case 'UPDATE_EDITORIAL_SKINCARE': {
      const { id, patch } = action.payload;
      return {
        ...state,
        skincareItems: (state.skincareItems || []).map((item) => (item.id === id ? { ...item, ...patch } : item))
      };
    }
    case 'DELETE_EDITORIAL_SKINCARE': {
      return {
        ...state,
        skincareItems: (state.skincareItems || []).filter((item) => item.id !== action.payload.id)
      };
    }
    case 'ADD_EDITORIAL_TREND': {
      return { ...state, trendsItems: [action.payload, ...(state.trendsItems || [])] };
    }
    case 'UPDATE_EDITORIAL_TREND': {
      const { id, patch } = action.payload;
      return {
        ...state,
        trendsItems: (state.trendsItems || []).map((item) => (item.id === id ? { ...item, ...patch } : item))
      };
    }
    case 'DELETE_EDITORIAL_TREND': {
      return {
        ...state,
        trendsItems: (state.trendsItems || []).filter((item) => item.id !== action.payload.id)
      };
    }

    // ---------------- Staff Management ----------------
    case 'ADD_STAFF': {
      const incomingId2 = action.payload.id || action.payload._id;
      const existingIdx2 = (state.staff || []).findIndex((s) => (s.id && s.id === incomingId2) || (s._id && s._id === incomingId2));
      if (existingIdx2 >= 0) {
        const updated2 = [...(state.staff || [])];
        updated2[existingIdx2] = { ...updated2[existingIdx2], ...action.payload };
        return { ...state, staff: updated2 };
      }
      return { ...state, staff: [action.payload, ...(state.staff || [])] };
    }
    case 'UPDATE_STAFF': {
      const { staffId, patch } = action.payload;
      return {
        ...state,
        staff: (state.staff || []).map((st) => (st.id === staffId ? { ...st, ...patch } : st))
      };
    }
    case 'DELETE_STAFF': {
      return {
        ...state,
        staff: (state.staff || []).filter((st) => st.id !== action.payload.staffId)
      };
    }

    // ---------------- Reviews & Salon Replies ----------------
    case 'SET_REVIEWS': {
      return { ...state, reviews: action.payload };
    }
    case 'SET_REVIEWS_BY_SALON': {
      const { salonId, reviews } = action.payload;
      return { ...state, reviews: [...(state.reviews || []).filter((review) => review.salonId !== salonId), ...reviews] };
    }
    case 'ADD_REVIEW': {
      return { ...state, reviews: [action.payload, ...(state.reviews || [])] };
    }
    case 'REPLY_REVIEW': {
      const { reviewId, reply } = action.payload;
      return {
        ...state,
        reviews: (state.reviews || []).map((r) => (r.id === reviewId ? { ...r, reply } : r))
      };
    }
    case 'UPDATE_REVIEW': {
      const { reviewId, patch } = action.payload;
      return {
        ...state,
        reviews: (state.reviews || []).map((r) => (r.id === reviewId ? { ...r, ...patch } : r))
      };
    }
    case 'DELETE_REVIEW': {
      const { reviewId } = action.payload;
      return {
        ...state,
        reviews: (state.reviews || []).filter((r) => r.id !== reviewId)
      };
    }

    default:
      return state;
  }
}
