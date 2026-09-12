// Pure derived-data helpers over the shared store shape. These take a
// plain state object (or the arrays within it) and compute a view —
// nothing here dispatches or mutates, so they're usable from contexts,
// the availability engine and analytics alike without caring where the
// state came from.

import { isActiveOnFloor, BOOKING_STATUS } from '../lib/bookingStatus';

export const salonWithServices = (state, salonId) => {
  const salon = state.salons.find((s) => s.id === salonId);
  if (!salon) return null;
  return {
    ...salon,
    services: state.services.filter((sv) => sv.salonId === salonId),
    staff: state.staff.filter((st) => st.salonId === salonId),
    stations: state.stations.filter((sn) => sn.salonId === salonId)
  };
};

export const bookingsForSalonToday = (state, salonId, todayKey) =>
  state.bookings.filter((b) => b.salonId === salonId && (b.dateKey === todayKey || b.status === BOOKING_STATUS.SERVICE_STARTED));

export const occupiedStationIds = (bookings) =>
  new Set(bookings.filter((b) => isActiveOnFloor(b.status) && b.stationId).map((b) => b.stationId));

export const availableStationCount = (state, salonId, todayKey) => {
  const allStations = state.stations.filter((s) => s.salonId === salonId);
  const todaysBookings = bookingsForSalonToday(state, salonId, todayKey);
  const occupied = occupiedStationIds(todaysBookings);
  return Math.max(0, allStations.length - occupied.size);
};

export const favouriteSalons = (state, favouriteIds) =>
  state.salons.filter((s) => favouriteIds.includes(s.id));

export const couponIsApplicable = (coupon, { subtotal, isFirstBooking }) => {
  if (!coupon) return { ok: false, reason: 'No coupon' };
  if (coupon.firstBookingOnly && !isFirstBooking) {
    return { ok: false, reason: `${coupon.code} is valid on your first booking only.` };
  }
  if (subtotal < (coupon.minOrder || 0)) {
    return { ok: false, reason: `Add ₹${coupon.minOrder - subtotal} more to use ${coupon.code}.` };
  }
  return { ok: true };
};

export const computeDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;
  if (coupon.discountPercent) {
    const calculated = (subtotal * coupon.discountPercent) / 100;
    return Math.min(calculated, coupon.maxDiscount || calculated);
  }
  if (coupon.flatDiscount) return Math.min(coupon.flatDiscount, subtotal);
  return 0;
};

export const reviewSummary = (reviews) => {
  if (!reviews.length) return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] };
  const distribution = [0, 0, 0, 0, 0]; // index 0 = 1-star .. index 4 = 5-star
  let sum = 0;
  reviews.forEach((r) => {
    sum += r.rating;
    const idx = Math.min(5, Math.max(1, Math.round(r.rating))) - 1;
    distribution[idx] += 1;
  });
  return { average: Math.round((sum / reviews.length) * 10) / 10, total: reviews.length, distribution };
};

export const isFirstBookingForCustomer = (state, customerId) =>
  state.bookings.filter((b) => b.customerId === customerId).length === 0;

// Resolves a booking's assigned station + staff into the display label the
// salon panel used to hardcode as a literal string ("Chair 1 (Pooja)").
export const stationLabelFor = (booking, stations, staff) => {
  if (!booking.stationId) return 'Unassigned';
  const station = stations.find((s) => s.id === booking.stationId);
  if (!station) return 'Unassigned';
  const staffMember = staff.find((s) => s.id === station.staffId);
  return staffMember ? `${station.name} (${staffMember.name})` : station.name;
};
