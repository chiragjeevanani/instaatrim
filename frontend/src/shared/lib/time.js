// Time helpers used across seed normalisation, the availability engine and
// the slot picker. Durations in the original mock data were human strings
// ("1 hr 15 mins") that nothing could do arithmetic on — this file parses
// them once so everything downstream is numeric minutes.

export const parseDurationToMinutes = (input) => {
  if (typeof input === 'number') return input;
  if (!input) return 30;
  const str = String(input).toLowerCase();
  const hrMatch = str.match(/(\d+)\s*hr/);
  const minMatch = str.match(/(\d+)\s*min/);
  const hrs = hrMatch ? parseInt(hrMatch[1], 10) : 0;
  const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
  if (!hrMatch && !minMatch) {
    const bare = str.match(/(\d+)/);
    return bare ? parseInt(bare[1], 10) : 30;
  }
  return hrs * 60 + mins;
};

export const formatMinutesAsDuration = (totalMinutes) => {
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const parts = [];
  if (hrs > 0) parts.push(`${hrs} hr${hrs > 1 ? 's' : ''}`);
  if (mins > 0) parts.push(`${mins} min${mins > 1 ? 's' : ''}`);
  return parts.length ? parts.join(' ') : '0 mins';
};

// "09:30 AM" -> 570 (minutes since midnight)
export const parseClockToMinutes = (clock) => {
  if (typeof clock === 'number') return clock;
  const match = String(clock).trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let [, h, m, period] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (/pm/i.test(period) && h !== 12) h += 12;
  if (/am/i.test(period) && h === 12) h = 0;
  return h * 60 + m;
};

export const minutesToClock = (totalMinutes) => {
  const mins = ((totalMinutes % 1440) + 1440) % 1440;
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')} ${period}`;
};

// "09:30 AM - 08:30 PM" -> { openMin, closeMin }
export const parseHoursRange = (range) => {
  if (!range) return { openMin: 0, closeMin: 0, closed: true };
  const [openStr, closeStr] = String(range).split('-').map((s) => s.trim());
  if (!openStr || !closeStr) return { openMin: 0, closeMin: 0, closed: true };
  return {
    openMin: parseClockToMinutes(openStr),
    closeMin: parseClockToMinutes(closeStr),
    closed: false
  };
};

export const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const dateKey = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const weekdayName = (date) => WEEKDAYS[(date instanceof Date ? date : new Date(date)).getDay()];

// Rolling window of upcoming days for date pickers — replaces the four
// hardcoded chips ("Today" / "Tomorrow" / "Sunday" / "Monday") that always
// read 11–14 Sep regardless of what day it actually is.
export const rollingDays = (count = 14, from = new Date()) => {
  const days = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : weekdayName(d).slice(0, 3);
    const sub = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    days.push({ key: dateKey(d), date: d, label, sub, weekday: weekdayName(d), isToday: i === 0 });
  }
  return days;
};

export const isSameDay = (a, b) => dateKey(a) === dateKey(b);

// "2026-09-13" -> "Today" / "Tomorrow" / "13 Sep 2026"
export const formatDateKeyFriendly = (key) => {
  if (!key) return '';
  const target = new Date(`${key}T00:00:00`);
  if (Number.isNaN(target.getTime())) return key;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target - today) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  return target.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const nowMinutesOfDay = (date = new Date()) => date.getHours() * 60 + date.getMinutes();

export const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);

// Accepts either a Date or a raw epoch-ms timestamp — holds store
// `expiresAt` as a plain number (Date.now() + ttl), and HoldCountdown
// passes that straight through, so this must handle both.
export const msUntil = (date) => {
  const target = date instanceof Date ? date.getTime() : date;
  return Math.max(0, target - Date.now());
};

export const formatCountdown = (ms) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};
