// Pure reducer for the shared app store. Every mutation the customer app
// or the salon partner panel makes — across bookings, services, offers,
// staff, stations, reviews, locations, holds, notifications and tickets —
// goes through here, so it is the one place the whole data model can be
// read at a glance.

import { SALONS, SERVICES, STAFF, STATIONS, BOOKINGS, OFFERS, COUPONS, REVIEWS, LOCATIONS, DEFAULT_CUSTOMER, CATEGORIES, BANNERS } from '../data/seed';
import { TOP_ADVERTISEMENTS, BRAND_PARTNERS, MID_PAGE_CAMPAIGN, MID_PAGE_CAMPAIGNS } from '../data/advertisements';
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
  salons: SALONS,
  services: SERVICES,
  staff: STAFF,
  stations: STATIONS,
  bookings: resolveSeedBookingDates(BOOKINGS),
  offers: OFFERS,
  coupons: COUPONS,
  reviews: REVIEWS,
  locations: LOCATIONS,
  advertisements: TOP_ADVERTISEMENTS.map((ad) => ({ ...ad, isActive: ad.isActive !== false })),
  brandPartners: BRAND_PARTNERS.map((bp) => ({ ...bp, isActive: bp.isActive !== false })),
  midPageCampaign: { ...MID_PAGE_CAMPAIGN, isActive: MID_PAGE_CAMPAIGN.isActive !== false },
  midPageCampaigns: MID_PAGE_CAMPAIGNS.map((c) => ({ ...c, isActive: c.isActive !== false })),
  holds: [],
  notifications: [],
  tickets: [],
  customers: [{ ...DEFAULT_CUSTOMER }],
  currentCustomerId: 'cust-1',
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

    // ---------------- Bookings ----------------
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
    case 'ADD_CATEGORY':
    case 'CATEGORY_CREATE': {
      return { ...state, categories: [action.payload, ...state.categories] };
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
      const { salonId, patch } = action.payload;
      return {
        ...state,
        salons: state.salons.map((s) => (s.id === salonId ? { ...s, ...patch } : s))
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
    case 'ADD_COUPON': {
      return { ...state, coupons: [action.payload, ...state.coupons] };
    }
    case 'UPDATE_COUPON': {
      const { couponId, patch } = action.payload;
      return { ...state, coupons: state.coupons.map((c) => (c.id === couponId ? { ...c, ...patch } : c)) };
    }
    case 'DELETE_COUPON': {
      return { ...state, coupons: state.coupons.filter((c) => c.id !== action.payload.couponId) };
    }

    // ---------------- Locations ----------------
    case 'ADD_LOCATION': {
      return { ...state, locations: [...state.locations, action.payload] };
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
    case 'ADD_ADVERTISEMENT':
    case 'ADS_CREATE': {
      return { ...state, advertisements: [action.payload, ...state.advertisements] };
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
        midPageCampaign: nextList[0] || state.midPageCampaign
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

    default:
      return state;
  }
}
