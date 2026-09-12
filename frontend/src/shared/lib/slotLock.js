// Slot locking — SRS §9.3, and the fix for the audit's highest-risk gap
// and acceptance criteria 3 & 4 ("a slot/resource cannot be successfully
// booked by two customers at the same time").
//
// A hold is written into the *shared* store (see shared/store), which is
// synced across tabs via BroadcastChannel/localStorage — so this is
// provable without a backend: open the customer app in two tabs, hold the
// same slot in one, and the other tab's availability engine (which reads
// the same `holds` collection) will no longer offer it.

import { api } from '../services/api';
import { newHoldId, newSessionId } from './ids';
import { dateKey } from './time';

export const DEFAULT_HOLD_TTL_MS = 8 * 60 * 1000; // 8 minutes

export async function acquireHold({ salonId, serviceId, staffId, dateObj, startMin, endMin }) {
  const hold = {
    id: newHoldId(),
    sessionId: newSessionId(),
    salonId,
    serviceId,
    staffId,
    dateKey: dateKey(dateObj),
    startMin,
    endMin,
    createdAt: Date.now(),
    expiresAt: Date.now() + DEFAULT_HOLD_TTL_MS
  };
  await api.holds.create(hold);
  return hold;
}

export async function releaseHold(holdId) {
  if (!holdId) return;
  try {
    await api.holds.release(holdId);
  } catch (e) {
    // already gone (expired and pruned) — fine
  }
}

// Re-validate a hold is still live and still points at a real, still-free
// slot right before payment — the slot-picker's snapshot could be a few
// minutes stale by the time checkout completes.
export function isHoldStillValid(hold, holds) {
  if (!hold) return false;
  const current = holds.find((h) => h.id === hold.id);
  return Boolean(current && current.expiresAt > Date.now());
}
