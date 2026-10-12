const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');

let messagingInstance = null;

try {
    const serviceAccount = require('./drimstyle-48987-firebase-adminsdk-fbsvc-7614ff8d89.json');

    const app = getApps().length === 0 ? initializeApp({
        credential: cert(serviceAccount)
    }) : getApps()[0];

    messagingInstance = getMessaging(app);
    console.log('Firebase Admin SDK messaging initialized successfully');
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

    const tag = stringifiedData.tag || (stringifiedData.bookingId ? `booking-${stringifiedData.bookingId}` : 'drimstyle-booking-notification');

    const message = {
        notification: {
            title,
            body
        },
        data: {
            ...stringifiedData,
            title: String(title),
            body: String(body),
            click_action: "FLUTTER_NOTIFICATION_CLICK"
        },
        webpush: {
            headers: {
                Urgency: "high"
            },
            notification: {
                title,
                body,
                icon: "/DrimStylelogo.png",
                badge: "/DrimStylelogo.png",
                tag: tag,
                renotify: true
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
