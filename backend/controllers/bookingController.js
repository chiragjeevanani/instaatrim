const Booking = require('../models/Booking');
const Salon = require('../models/Salon');
const PlatformSettings = require('../models/PlatformSettings');
const { sendPushNotification } = require('../config/firebase');

// Helper to safely get Socket.IO instance
const getSocketIO = () => {
    try {
        return require('../socket').getIO();
    } catch (e) {
        return null;
    }
};

// Helper to send FCM notifications to salon and admin
const notifyBookingFCM = async ({ salonId, title, body, data }) => {
    try {
        const tokens = new Set();

        // 1. Fetch salon tokens
        if (salonId) {
            const salon = await Salon.findById(salonId).select('fcmtoken fcmtokenweb');
            if (salon) {
                if (salon.fcmtokenweb) tokens.add(salon.fcmtokenweb);
                if (salon.fcmtoken) tokens.add(salon.fcmtoken);
            }
        }

        // 2. Fetch admin tokens
        const settings = await PlatformSettings.findOne().select('adminFcmTokens');
        if (settings && Array.isArray(settings.adminFcmTokens)) {
            settings.adminFcmTokens.forEach(t => {
                if (t && typeof t === 'string') tokens.add(t);
            });
        }

        if (tokens.size === 0) {
            console.log('[FCM] No tokens registered for salon or admin.');
            return;
        }

        // Send push notification to all collected tokens
        for (const token of tokens) {
            await sendPushNotification(token, title, body, data);
        }
    } catch (err) {
        console.error('[FCM] notifyBookingFCM error:', err.message);
    }
};

exports.createBooking = async (req, res) => {
    try {
        const bookingData = req.body;

        // Custom ID generation for "IT-XXXXXX"
        const count = await Booking.countDocuments();
        const customId = `IT-${220000 + count + 1}`; // Start from 220001

        const booking = new Booking({
            ...bookingData,
            _id: customId // Optional: Use this as _id or keep standard ObjectId and add a custom id field
        });

        const savedBooking = await booking.save();

        // 1. Real-time Socket.io Broadcast to Salon & Admin
        const io = getSocketIO();
        if (io) {
            io.emit('booking_created', savedBooking);
        }

        // 2. Real-time Firebase Push Notification
        notifyBookingFCM({
            salonId: savedBooking.salonId,
            title: 'New Booking Received! 🎉',
            body: `${savedBooking.customerName || 'Customer'} booked for ${savedBooking.time || ''} on ${savedBooking.dateKey || ''} (#${savedBooking._id})`,
            data: {
                type: 'BOOKING_CREATED',
                bookingId: String(savedBooking._id),
                salonId: String(savedBooking.salonId || ''),
                sound: 'ringtone',
                tag: `booking-${savedBooking._id}`,
                link: '/salon/bookings'
            }
        });

        res.status(201).json({ success: true, data: savedBooking });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCustomerBookings = async (req, res) => {
    try {
        const { customerId } = req.params;
        const bookings = await Booking.find({ customerId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSalonBookings = async (req, res) => {
    try {
        const { salonId } = req.params;
        const bookings = await Booking.find({ salonId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, cancelReason } = req.body;

        const updateData = { status };
        if (cancelReason) updateData.cancelReason = cancelReason;

        const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const io = getSocketIO();
        if (io) {
            io.emit('booking_updated', booking);
            if (status === 'Cancelled') {
                io.emit('booking_cancelled', booking);
            }
        }

        if (status === 'Cancelled') {
            notifyBookingFCM({
                salonId: booking.salonId,
                title: 'Booking Cancelled ⚠️',
                body: `Booking #${booking._id} for ${booking.customerName || 'Customer'} has been cancelled.`,
                data: {
                    type: 'BOOKING_CANCELLED',
                    bookingId: String(booking._id),
                    salonId: String(booking.salonId || ''),
                    sound: 'alert',
                    tag: `cancel-${booking._id}`,
                    link: '/salon/bookings'
                }
            });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.rescheduleBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { dateKey, time } = req.body;

        const booking = await Booking.findByIdAndUpdate(id, { dateKey, time, status: 'Confirmed' }, { new: true });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
