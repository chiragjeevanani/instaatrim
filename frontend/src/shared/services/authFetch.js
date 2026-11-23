// Sends the logins this browser has to OUR API on every request, so the server can
// check who is allowed to do what. Installed once, before the app renders.
//
//   X-Admin-Token    → admin panel session (store.adminSession.token)
//   X-Salon-Token    → salon partner login (localStorage instaatrim_partner_token)
//   X-Customer-Token → customer login     (localStorage instaatrim_token)
//
// The existing Authorization header of each call is left exactly as it was.
// The salon partner token lives 1 hour: it is renewed with the refresh token just
// before it expires (one renewal at a time), and a request rejected with 401 is
// retried once after renewing.
import { getState, isBridgeReady } from '../store/bridge';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:6200/api';
const PARTNER_TOKEN = 'instaatrim_partner_token';
const PARTNER_REFRESH = 'instaatrim_partner_refresh_token';
const CUSTOMER_TOKEN = 'instaatrim_token';

const tokenExp = (t) => {
  try {
    const part = String(t).split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(part.padEnd(part.length + ((4 - (part.length % 4)) % 4), '=')));
    return Number(json.exp) * 1000 || 0;
  } catch {
    return 0;
  }
};

// true when the JWT is present and not expired
export const isLiveToken = (t) => !!t && tokenExp(t) > Date.now();

export const adminToken = () => {
  try {
    if (!isBridgeReady()) return null;
    const t = getState()?.adminSession?.token;
    return t && tokenExp(t) > Date.now() ? t : null;
  } catch {
    return null;
  }
};

const lsGet = (k) => {
  try {
    const v = localStorage.getItem(k);
    return v && v !== 'null' && v !== 'undefined' ? v : null;
  } catch {
    return null;
  }
};

let nativeFetch = null;
let refreshing = null;
let deadRefreshToken = null;

// Renew the partner token (only one renewal in flight at a time)
const refreshPartnerToken = () => {
  const refreshToken = lsGet(PARTNER_REFRESH);
  if (!refreshToken || refreshToken === deadRefreshToken) return Promise.resolve(null);
  if (refreshing) return refreshing;
  refreshing = nativeFetch(`${API_BASE}/salons/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  })
    .then(async (r) => {
      if (r.status === 401) deadRefreshToken = refreshToken;
      if (!r.ok) return null;
      const j = await r.json();
      // Another part of the app may have logged in again meanwhile — don't overwrite it
      if (lsGet(PARTNER_REFRESH) !== refreshToken) return lsGet(PARTNER_TOKEN);
      if (j.refreshToken) localStorage.setItem(PARTNER_REFRESH, j.refreshToken);
      if (j.token) localStorage.setItem(PARTNER_TOKEN, j.token);
      return j.token || null;
    })
    .catch(() => null)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
};

const partnerToken = async () => {
  const t = lsGet(PARTNER_TOKEN);
  if (t && tokenExp(t) > Date.now() + 30000) return t;
  if (!lsGet(PARTNER_REFRESH)) return t;
  return (await refreshPartnerToken()) || t;
};

const urlOf = (input) => {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return null; // Request objects are passed through untouched
};

const withTokens = (init, tokens) => {
  const headers = new Headers((init && init.headers) || undefined);
  if (tokens.admin) headers.set('X-Admin-Token', tokens.admin);
  if (tokens.salon) headers.set('X-Salon-Token', tokens.salon);
  if (tokens.customer) headers.set('X-Customer-Token', tokens.customer);
  return { ...(init || {}), headers };
};

export const installAuthFetch = () => {
  if (typeof window === 'undefined' || window.__drimstyleAuthFetch) return;
  nativeFetch = window.fetch.bind(window);
  window.__drimstyleAuthFetch = true;

  window.fetch = async (input, init) => {
    const url = urlOf(input);
    if (!url || !url.startsWith(API_BASE) || url.startsWith(`${API_BASE}/salons/refresh-token`)) {
      return nativeFetch(input, init);
    }
    const salon = await partnerToken();
    const tokens = { admin: adminToken(), salon, customer: lsGet(CUSTOMER_TOKEN) };
    const res = await nativeFetch(input, withTokens(init, tokens));

    // Partner token rejected → renew once and retry
    if (res.status === 401 && salon && lsGet(PARTNER_REFRESH)) {
      const renewed = await refreshPartnerToken();
      if (renewed && renewed !== salon) {
        return nativeFetch(input, withTokens(init, { ...tokens, salon: renewed }));
      }
    }
    return res;
  };
};
