import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBYL6lpExQeihydYkR0SG-zwx-nriMGvr4",
  authDomain: "drimstyle-48987.firebaseapp.com",
  projectId: "drimstyle-48987",
  storageBucket: "drimstyle-48987.firebasestorage.app",
  messagingSenderId: "3977537129",
  appId: "1:3977537129:web:db8f82b7e0207ae954a4f8",
  measurementId: "G-P67WGVYC46"
};

const app = initializeApp(firebaseConfig);
export const messaging = typeof window !== 'undefined' && 'serviceWorker' in navigator ? getMessaging(app) : null;

export const requestFirebaseToken = async () => {
  if (!messaging) return null;
  try {
    const currentToken = await getToken(messaging, { vapidKey: 'BOoeViQkFA4oMoH73Zj8u9tggclFMENcJPGadjNL2qoJQ13ZVk8xakNJu96odpErAXEcjai9KexNsLGSxgTw2-8' });
    if (currentToken) {
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
