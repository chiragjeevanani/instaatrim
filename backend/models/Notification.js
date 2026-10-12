const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    audience: {
        type: String,
        enum: ['all', 'customer', 'salon', 'admin'],
        default: 'all'
    },
    audienceId: {
        type: String,
        default: null
    },
    type: {
        type: String,
        default: 'broadcast'
    },
    sentCount: {
        type: Number,
        default: 0
    },
    link: {
        type: String,
        default: '/'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
