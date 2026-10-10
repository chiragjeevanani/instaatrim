importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBYL6lpExQeihydYkR0SG-zwx-nriMGvr4",
  authDomain: "drimstyle-48987.firebaseapp.com",
  projectId: "drimstyle-48987",
  storageBucket: "drimstyle-48987.firebasestorage.app",
  messagingSenderId: "3977537129",
  appId: "1:3977537129:web:db8f82b7e0207ae954a4f8",
  measurementId: "G-P67WGVYC46"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
