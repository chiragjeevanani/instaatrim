const admin = require('firebase-admin');
const path = require('path');

try {
    const serviceAccount = require('./drimstyle-48987-firebase-adminsdk-fbsvc-4d166f9470.json');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
}

// Helper function to send push notifications
const sendPushNotification = async (token, title, body, data = {}) => {
    if (!token) return;

    const message = {
        notification: {
            title,
            body
        },
        data: {
            ...data,
            click_action: "FLUTTER_NOTIFICATION_CLICK" // Standard practice
        },
        token
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        return null;
    }
};

module.exports = { admin, sendPushNotification };
