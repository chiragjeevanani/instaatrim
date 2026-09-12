// Canonical booking status machine — SRS §6.7.
// Both the customer app and the salon partner panel read and write this
// exact vocabulary now, so a status set on one side means the same thing
// on the other. Previously the salon side used "In-Service" / "No-Show"
// while the customer side used "Confirmed" only — this file is the fix.

export const BOOKING_STATUS = Object.freeze({
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked-In',
  SERVICE_STARTED: 'Service Started',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
  REFUNDED: 'Refunded'
});

export const ALL_STATUSES = Object.values(BOOKING_STATUS);

// Legal forward transitions. A status can always be read; it can only be
// written if the move is listed here (or the caller passes `force`, used
// only by the dev panel).
const TRANSITIONS = {
  [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW],
  [BOOKING_STATUS.CHECKED_IN]: [BOOKING_STATUS.SERVICE_STARTED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.SERVICE_STARTED]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.COMPLETED]: [BOOKING_STATUS.REFUNDED],
  [BOOKING_STATUS.CANCELLED]: [BOOKING_STATUS.REFUNDED],
  [BOOKING_STATUS.NO_SHOW]: [BOOKING_STATUS.REFUNDED],
  [BOOKING_STATUS.REFUNDED]: []
};

export const canTransition = (from, to) => {
  if (!TRANSITIONS[from]) return false;
  return TRANSITIONS[from].includes(to);
};

export const nextStatuses = (from) => TRANSITIONS[from] || [];

export const isTerminal = (status) =>
  [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW, BOOKING_STATUS.REFUNDED].includes(status);

export const isUpcoming = (status) =>
  [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.SERVICE_STARTED].includes(status);

export const isActiveOnFloor = (status) =>
  [BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.SERVICE_STARTED].includes(status);

// Presentation metadata kept next to the machine so every screen renders
// the same colour/label for the same status instead of re-deriving it.
export const STATUS_META = {
  [BOOKING_STATUS.PENDING]: { tone: 'warn', label: 'Pending' },
  [BOOKING_STATUS.CONFIRMED]: { tone: 'ok', label: 'Confirmed' },
  [BOOKING_STATUS.CHECKED_IN]: { tone: 'info', label: 'Checked-In' },
  [BOOKING_STATUS.SERVICE_STARTED]: { tone: 'info', label: 'In Service' },
  [BOOKING_STATUS.COMPLETED]: { tone: 'ok', label: 'Completed' },
  [BOOKING_STATUS.CANCELLED]: { tone: 'bad', label: 'Cancelled' },
  [BOOKING_STATUS.NO_SHOW]: { tone: 'bad', label: 'No Show' },
  [BOOKING_STATUS.REFUNDED]: { tone: 'neutral', label: 'Refunded' }
};

export const toneClasses = (tone) => {
  switch (tone) {
    case 'ok':
      return 'bg-emerald-100 text-emerald-800';
    case 'warn':
      return 'bg-amber-100 text-amber-900';
    case 'info':
      return 'bg-blue-100 text-blue-800';
    case 'bad':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-stone-200 text-stone-700';
  }
};
