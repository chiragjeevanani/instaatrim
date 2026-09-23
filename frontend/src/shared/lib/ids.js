// Unified ID generation for the whole platform.
// Every booking — whether created from the customer app or as a salon
// walk-in — gets the same "IT-#####" shape so the two modules never again
// disagree about what a booking is called.

let counter = Math.floor(10000 + Math.random() * 9000);

const next = (prefix) => {
  counter += 1;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${rand}${(counter % 100).toString().padStart(2, '0')}`;
};

export const newBookingId = () => next('IT');
export const newOfferId = () => next('OFF');
export const newServiceId = () => next('SRV');
export const newStaffId = () => next('STF');
export const newStationId = () => next('STN');
export const newReviewId = () => next('REV');
export const newTicketId = () => next('TKT');
export const newNotificationId = () => next('NTF');
export const newAddressId = () => next('LOC');
export const newCategoryId = () => next('CAT');
export const newAdId = () => next('AD');
export const newBannerId = () => next('BAN');
export const newCampaignId = () => next('CMP');
export const newPartnerId = () => next('BP');
export const newHoldId = () => `HOLD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
export const newSessionId = () => {
  const existing = typeof window !== 'undefined' ? window.sessionStorage?.getItem('it_session_id') : null;
  if (existing) return existing;
  const id = `SESS-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  try {
    window.sessionStorage?.setItem('it_session_id', id);
  } catch (e) {
    // sessionStorage unavailable (private mode, etc) — fall back to a per-call id
  }
  return id;
};
