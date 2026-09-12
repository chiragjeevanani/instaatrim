// Cross-tab sync via the native `storage` event.
//
// This is what makes the fix from Phase 0 demonstrable without a backend:
// open the customer app in one tab and the salon partner panel in another,
// and a booking created in one appears in the other within a second,
// because both are subscribed to the same localStorage key.

import { STORAGE_EVENT_KEY } from './persist';

const listeners = new Set();

let attached = false;

const handleStorageEvent = (event) => {
  if (event.key !== STORAGE_EVENT_KEY) return;
  if (!event.newValue) return;
  try {
    const parsed = JSON.parse(event.newValue);
    listeners.forEach((fn) => fn(parsed.data));
  } catch (e) {
    // malformed payload from another tab — ignore
  }
};

export const subscribeToRemoteChanges = (callback) => {
  listeners.add(callback);
  if (!attached && typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageEvent);
    attached = true;
  }
  return () => {
    listeners.delete(callback);
  };
};

// BroadcastChannel gives same-origin tabs an immediate push (storage events
// only fire in *other* tabs and can lag on some browsers); we use both and
// let whichever fires first win, since applying the same state twice is a
// no-op.
const CHANNEL_NAME = 'instaatrim_sync_v1';
let channel = null;

const getChannel = () => {
  if (channel) return channel;
  if (typeof window === 'undefined' || typeof window.BroadcastChannel === 'undefined') return null;
  channel = new window.BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (event) => {
    listeners.forEach((fn) => fn(event.data));
  };
  return channel;
};

export const broadcastChange = (data) => {
  const ch = getChannel();
  if (ch) {
    try {
      ch.postMessage(data);
    } catch (e) {
      // structured-clone failure or closed channel — non-fatal
    }
  }
};

// Ensure the channel listener attaches even if broadcastChange is called
// before any subscribeToRemoteChanges call.
if (typeof window !== 'undefined') {
  getChannel();
}
