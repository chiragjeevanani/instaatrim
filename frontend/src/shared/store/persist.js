// localStorage persistence for the shared app store.
// Wrapped in try/catch throughout — private browsing, blocked storage and
// storage-full all throw, and none of them should crash the app.

const STORAGE_KEY = 'instaatrim_store_v1';
const SCHEMA_VERSION = 1;

export const loadPersistedState = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION) return null;
    return parsed.data;
  } catch (e) {
    return null;
  }
};

export const savePersistedState = (data) => {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: SCHEMA_VERSION, savedAt: Date.now(), data })
    );
    return true;
  } catch (e) {
    return false;
  }
};

export const clearPersistedState = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
};

export const STORAGE_EVENT_KEY = STORAGE_KEY;
