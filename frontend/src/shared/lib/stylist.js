import { useEffect, useMemo, useState } from 'react';
import { parseClockToMinutes, dateKey as toDateKey } from './time';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:6200/api';
const EMPTY = [];

// Slot pickers rebuild bookingSlot when a time is confirmed. The stylist the customer chose in
// "Choose Stylist" (has staffName) must survive that; otherwise keep the slot's auto staff as before.
export const keepPickedStylist = (prev, slotStaffId) =>
  prev?.staffId && prev?.staffName
    ? { staffId: prev.staffId, staffName: prev.staffName }
    : { staffId: slotStaffId ?? null };

// Stylist the customer chose in "Choose Stylist" (StylistPicker sets staffName; auto slot staff has none)
export const pickedStylistId = (bookingSlot) =>
  bookingSlot?.staffId && bookingSlot?.staffName ? String(bookingSlot.staffId) : null;

// Booking (from /busy) → { start, end } in minutes of that day. Instant bookings have no clock time,
// so they start when they were created.
const toWindow = (b, dayKey) => {
  let start = /\d{1,2}:\d{2}\s*(AM|PM)/i.test(String(b.time || '')) ? parseClockToMinutes(b.time) : null;
  if (start === null && b.createdAt) {
    const created = new Date(b.createdAt);
    if (toDateKey(created) === dayKey) start = created.getHours() * 60 + created.getMinutes();
  }
  if (start === null) return null;
  return { start, end: start + (Number(b.durationMinutes) || 30) };
};

/**
 * Times the picked stylist is already booked on one date — live from DB.
 * Returns { id, busy: [{start, end}] } for getDaySlots / getInstantAvailability, or null (no stylist picked).
 * `refreshKey` → refetch (e.g. every time the slot picker opens).
 */
export function usePickedStylistBusy(salonId, staffId, dayKey, refreshKey) {
  const key = salonId && staffId && dayKey ? `${salonId}|${staffId}|${dayKey}` : null;
  const [loaded, setLoaded] = useState({ key: null, busy: [] });

  useEffect(() => {
    if (!key) return undefined;
    let alive = true;
    fetch(`${API_BASE}/bookings/salon/${salonId}/staff/${staffId}/busy?dateKey=${dayKey}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        const busy = (Array.isArray(j?.data) ? j.data : []).map((b) => toWindow(b, dayKey)).filter(Boolean);
        setLoaded({ key, busy });
      })
      .catch((e) => console.warn('[usePickedStylistBusy] could not load stylist bookings', e));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, refreshKey]);

  const busy = loaded.key === key ? loaded.busy : EMPTY;
  // until DB answers for this stylist/date, the stylist is still the pick (no busy windows yet)
  return useMemo(() => (key ? { id: staffId, busy } : null), [key, staffId, busy]);
}
