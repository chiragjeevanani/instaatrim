// A tiny escape hatch that lets the plain-function `api.js` module reach
// the live React store without every screen having to pass `dispatch`
// through props. `AppDataProvider` registers itself here once on mount.
//
// This is the one deliberate piece of indirection in the store — it exists
// so `shared/services/api.js` can look and behave exactly like a real HTTP
// client module (import it, call a function, get a Promise) instead of a
// hook, which is what makes the eventual backend swap a one-file change.

let bridge = null;

export const registerStoreBridge = (impl) => {
  bridge = impl;
};

export const getState = () => {
  if (!bridge) throw new Error('Store bridge not ready — AppDataProvider has not mounted yet.');
  return bridge.getState();
};

export const dispatch = (action) => {
  if (!bridge) throw new Error('Store bridge not ready — AppDataProvider has not mounted yet.');
  return bridge.dispatch(action);
};

export const isBridgeReady = () => bridge !== null;
