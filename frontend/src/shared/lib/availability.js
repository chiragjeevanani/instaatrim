// The availability engine — SRS §9.1, §9.2, §9.3, §7.4.
//
// This is the single source of truth for "can this slot be booked?" on
// both scheduled and instant bookings. It takes the salon's real working
// hours, breaks and holidays, each staff member's own hours and leave,
// existing bookings, and any active holds (temporary locks — see
// slotLock.js), and returns which slots are actually free.
//
// Previously the slot picker rendered one static array of ten times for
// every salon, every service and every date, and "instant" availability
// was the literal string "15 mins" — neither had any relationship to
// whether a real appointment could be honoured.

import {
  parseClockToMinutes,
  minutesToClock,
  overlaps,
  dateKey,
  weekdayName,
  parseDurationToMinutes,
  nowMinutesOfDay,
  isSameDay
} from './time';

const SLOT_STEP_MINUTES = 15;
const NON_BLOCKING_STATUSES = ['Cancelled', 'No Show', 'Refunded'];

const isBookingBlocking = (status) => !NON_BLOCKING_STATUSES.includes(status);

const bookingWindow = (booking) => {
  const start = parseClockToMinutes(booking.time);
  const totalDuration =
    (booking.services || []).reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0) || 30;
  return { start, end: start + totalDuration };
};

const staffIsOnLeave = (staffMember, dateKeyStr) => (staffMember.leaves || []).includes(dateKeyStr);

const workingWindowFor = (weeklyHours, weekday) => {
  const day = weeklyHours?.[weekday];
  if (!day || day.closed) return null;
  return { openMin: parseClockToMinutes(day.open), closeMin: parseClockToMinutes(day.close) };
};

const isOnSalonBreak = (salon, weekday, slotStart, slotEnd) =>
  (salon.breaks || []).some((b) => {
    if (b.day !== 'All' && b.day !== weekday) return false;
    return overlaps(slotStart, slotEnd, parseClockToMinutes(b.start), parseClockToMinutes(b.end));
  });

const isSalonHoliday = (salon, dateKeyStr) => (salon.holidays || []).some((h) => h.date === dateKeyStr);

/**
 * Compute every bookable slot for one salon, one service (by duration +
 * category) and one calendar date.
 *
 * @returns {{ slots: Array<{time, startMin, endMin, staffId, staffOptions}>, reason: string|null }}
 */
export function getDaySlots({ salon, staffList, durationMinutes, category, bookings, holds = [], dateObj, excludeHoldId }) {
  const weekday = weekdayName(dateObj);
  const todayKeyStr = dateKey(dateObj);
  const duration = durationMinutes || 30;

  if (!salon.isStoreOpen) {
    return { slots: [], reason: 'This salon is currently marked closed by the partner.' };
  }
  if (isSalonHoliday(salon, todayKeyStr)) {
    return { slots: [], reason: 'Salon is closed for a holiday on this date.' };
  }

  const salonWindow = workingWindowFor(salon.weeklyHours, weekday);
  if (!salonWindow) {
    return { slots: [], reason: `Salon is closed on ${weekday}s.` };
  }

  // `category` is optional — a slot preview opened before any service is
  // chosen (e.g. the salon profile's "Book Instant" banner) has nothing to
  // filter staff by yet, so every staff member is treated as qualified for
  // that preview and the real category filter applies once a service is
  // actually added to the cart.
  const qualifiedStaff = (staffList || []).filter((st) => (category ? (st.serviceCategories || []).includes(category) : true));
  if (qualifiedStaff.length === 0) {
    return { slots: [], reason: 'No staff at this salon are assigned to this service category.' };
  }

  const relevantBookings = (bookings || []).filter(
    (b) => b.dateKey === todayKeyStr && isBookingBlocking(b.status) && b.staffId
  );
  const relevantHolds = (holds || []).filter(
    (h) => h.dateKey === todayKeyStr && h.id !== excludeHoldId && h.expiresAt > Date.now()
  );

  const totalChairs = salon.totalChairs || Infinity;
  const slots = [];

  for (let t = salonWindow.openMin; t + duration <= salonWindow.closeMin; t += SLOT_STEP_MINUTES) {
    const slotEnd = t + duration;
    if (isOnSalonBreak(salon, weekday, t, slotEnd)) continue;

    const freeStaff = qualifiedStaff.filter((st) => {
      if (staffIsOnLeave(st, todayKeyStr)) return false;
      const win = workingWindowFor(st.weeklyHours, weekday);
      if (!win || t < win.openMin || slotEnd > win.closeMin) return false;
      const busy = relevantBookings.some((b) => b.staffId === st.id && overlaps(t, slotEnd, bookingWindow(b).start, bookingWindow(b).end));
      if (busy) return false;
      const held = relevantHolds.some((h) => h.staffId === st.id && overlaps(t, slotEnd, h.startMin, h.endMin));
      return !held;
    });

    // Even with a free qualified staff member, the salon can't exceed its
    // total chair count running concurrently.
    const chairsInUse =
      relevantBookings.filter((b) => overlaps(t, slotEnd, bookingWindow(b).start, bookingWindow(b).end)).length +
      relevantHolds.filter((h) => overlaps(t, slotEnd, h.startMin, h.endMin)).length;

    if (freeStaff.length > 0 && chairsInUse < totalChairs) {
      slots.push({
        time: minutesToClock(t),
        startMin: t,
        endMin: slotEnd,
        staffId: freeStaff[0].id,
        staffOptions: freeStaff.map((s) => s.id)
      });
    }
  }

  return { slots, reason: slots.length === 0 ? 'No available slots for this date — try another day.' : null };
}

/**
 * Instant / Book Now availability — SRS §9.2. Returns one of the three
 * states the spec names explicitly: 'now', 'soon' (Available in X
 * Minutes), 'next' (Next Available Slot), or 'unavailable' when the salon
 * has instant booking off, is closed, or has no free resource today.
 */
export function getInstantAvailability({ salon, staffList, durationMinutes, category, bookings, holds = [], atDate = new Date() }) {
  if (!salon.hasInstantBooking || !salon.isInstantBookingEnabled) {
    return { state: 'unavailable', label: 'Instant Booking is turned off by this salon', slot: null };
  }
  if (!salon.isStoreOpen) {
    return { state: 'unavailable', label: 'Salon is currently closed', slot: null };
  }

  const { slots } = getDaySlots({ salon, staffList, durationMinutes, category, bookings, holds, dateObj: atDate });
  if (slots.length === 0) {
    return { state: 'unavailable', label: 'No available stations right now', slot: null };
  }

  const nowMin = nowMinutesOfDay(atDate);
  const wait = salon.instantWaitMinutes ?? 15;

  const withinWait = slots.find((s) => s.startMin >= nowMin && s.startMin <= nowMin + wait);
  if (withinWait) {
    const minutesAway = Math.max(0, withinWait.startMin - nowMin);
    return minutesAway <= 3
      ? { state: 'now', label: 'Available Now', slot: withinWait }
      : { state: 'soon', label: `Available in ${minutesAway} Minutes`, slot: withinWait };
  }

  const next = slots.find((s) => s.startMin >= nowMin);
  if (next) {
    return { state: 'next', label: `Next Available Slot: ${next.time}`, slot: next };
  }

  return { state: 'unavailable', label: 'No more slots available today', slot: null };
}

export const isDateToday = (dateObj) => isSameDay(dateObj, new Date());
