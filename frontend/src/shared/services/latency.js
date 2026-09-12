// Simulated network conditions for the mock API layer.
//
// Every call in `api.js` is routed through `withLatency`, so loading states,
// empty states and error states get designed as each screen is built
// instead of bolted on afterwards — which is precisely what happened to
// this codebase the first time around (nothing anywhere handles a pending
// or failed request, because nothing was ever asynchronous).
//
// A dev panel (`shared/components/DevPanel.jsx`) flips these at runtime so
// QA can exercise failure paths without touching code.

const settings = {
  minDelayMs: 150,
  maxDelayMs: 400,
  slowNetwork: false,
  forceErrorRate: 0, // 0..1 — fraction of calls that reject
  offline: false
};

export const getLatencySettings = () => ({ ...settings });

export const setLatencySettings = (patch) => {
  Object.assign(settings, patch);
};

class ApiError extends Error {
  constructor(message, code = 'UNKNOWN') {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export { ApiError };

const randomDelay = () => {
  const min = settings.slowNetwork ? settings.minDelayMs * 4 : settings.minDelayMs;
  const max = settings.slowNetwork ? settings.maxDelayMs * 5 : settings.maxDelayMs;
  return Math.round(min + Math.random() * (max - min));
};

// Wrap any synchronous producer function in the simulated network. `fn`
// receives nothing and should return the (already-computed) result or
// throw; withLatency handles the delay, forced errors and offline mode.
export const withLatency = (fn, { errorMessage } = {}) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (settings.offline) {
        reject(new ApiError('You appear to be offline. Check your connection and try again.', 'OFFLINE'));
        return;
      }
      if (Math.random() < settings.forceErrorRate) {
        reject(new ApiError(errorMessage || 'Something went wrong on our end. Please try again.', 'SIMULATED'));
        return;
      }
      try {
        resolve(fn());
      } catch (e) {
        reject(e instanceof ApiError ? e : new ApiError(e.message || 'Unexpected error', 'THROWN'));
      }
    }, randomDelay());
  });
