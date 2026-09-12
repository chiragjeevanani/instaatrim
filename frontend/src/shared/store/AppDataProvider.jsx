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
  return { ...seed, ...persisted };
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
