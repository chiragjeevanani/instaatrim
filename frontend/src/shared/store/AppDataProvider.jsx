import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { appReducer, buildInitialState } from './reducer';
import { loadPersistedState, savePersistedState } from './persist';
import { subscribeToRemoteChanges, broadcastChange } from './broadcast';
import { registerStoreBridge } from './bridge';

const AppDataContext = createContext(null);

const init = () => {
  const persisted = loadPersistedState();
  const seed = buildInitialState();
  if (!persisted) return seed;
  // Shallow-merge so new seed collections introduced later (e.g. a phase
  // that adds `tickets`) still appear for a browser with old persisted
  // state, instead of being permanently missing.
  const merged = { ...seed, ...persisted };
  
  // Self-heal: If local storage wiped out mock collections due to an empty backend fetch, restore them from seed.
  if (!merged.services || merged.services.length === 0) merged.services = seed.services;
  if (!merged.salons || merged.salons.length === 0) merged.salons = seed.salons;
  
  return merged;
};

export const AppDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, init);
  const isApplyingRemote = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Register the plain-module bridge once, then keep it current on every
  // render so `api.js` always dispatches into the latest reducer instance.
  useEffect(() => {
    registerStoreBridge({
      getState: () => stateRef.current,
      dispatch
    });
  });

  // Persist + broadcast on every change, unless this change *is* the
  // result of applying a remote broadcast (otherwise two tabs would just
  // re-echo the same update at each other forever).
  useEffect(() => {
    if (isApplyingRemote.current) {
      isApplyingRemote.current = false;
      return;
    }
    savePersistedState(state);
    broadcastChange(state);
  }, [state]);

  // Apply changes that arrive from another tab.
  useEffect(() => {
    const unsubscribe = subscribeToRemoteChanges((remoteState) => {
      isApplyingRemote.current = true;
      dispatch({ type: 'HYDRATE', payload: remoteState });
    });
    return unsubscribe;
  }, []);

  return <AppDataContext.Provider value={{ state, dispatch }}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider');
  return ctx;
};
