const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');

let messagingInstance = null;

// Service account key path comes from FIREBASE_SERVICE_ACCOUNT_PATH (.env) so the key
// file can live outside git. Falls back to the original file in this folder.
const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : path.join(__dirname, 'drimstyle-48987-firebase-adminsdk-fbsvc-7614ff8d89.json');

try {
    const serviceAccount = require(keyPath);
    const credential = cert(serviceAccount);

    const app = getApps().length === 0 ? initializeApp({ credential }) : getApps()[0];

    messagingInstance = getMessaging(app);
    console.log(`Firebase Admin SDK messaging initialized (key id ${String(serviceAccount.private_key_id).slice(0, 8)}...)`);

    // Verify the key with Google at startup so a revoked/invalid key is reported
    // immediately instead of only failing silently on every push.
    credential.getAccessToken()
        .then(() => console.log('[FCM] Service account key verified with Google — push notifications ready'))
        .catch((err) => console.error(`[FCM] SERVICE ACCOUNT KEY REJECTED by Google (${err.message.split('.')[0]}). Push notifications will NOT be delivered until a valid key is installed.`));
} catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
}

// Helper function to send push notifications
const sendPushNotification = async (token, title, body, data = {}) => {
    if (!token) return;

    // Firebase FCM data payload values MUST be strings
    const stringifiedData = {};
    if (data && typeof data === 'object') {
        Object.entries(data).forEach(([key, val]) => {
            stringifiedData[key] = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
        });
    }

    const tag = stringifiedData.tag || (stringifiedData.bookingId ? `booking-${stringifiedData.bookingId}` : 'drimstyle-notification');

    // Data-only FCM message to prevent double notifications:
    // Omitting top-level 'notification' and 'webpush.notification' ensures the OS/Browser
    // does not auto-render Notification #1. Service Worker alone displays exactly 1 notification.
    const message = {
        data: {
            ...stringifiedData,
            title: String(title),
            body: String(body),
            tag: String(tag),
            icon: "/DrimStylelogo.png",
            badge: "/DrimStylelogo.png",
            link: String(stringifiedData.link || "/salon/bookings"),
            click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
        webpush: {
            headers: {
                Urgency: "high"
            },
            fcmOptions: {
                link: stringifiedData.link || "/salon/bookings"
            }
        },
        token
    };

    try {
        if (!messagingInstance) {
            console.error('[FCM] Firebase messagingInstance is not initialized.');
            return null;
        }
        const response = await messagingInstance.send(message);
        console.log('[FCM] Successfully sent message to token:', token.substring(0, 15) + '...', response);
        return response;
    } catch (error) {
        console.error('[FCM] Error sending message:', error.message);
        return null;
    }
};

module.exports = { messagingInstance, sendPushNotification };
