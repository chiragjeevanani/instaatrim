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

// Recalculate the bill from DB (service price + live offers + coupon) and compare with
// what the customer's app sent. Rejects any booking that tries to pay less than allowed.
const verifyBookingPrices = async (data) => {
    const mongoose = require('mongoose');
    const Service = require('../models/Service');
    const Coupon = require('../models/Coupon');
    const { loadLiveOffersForSalon, priceWithBestOffer } = require('../utils/offerPricing');
    const REFRESH = 'Prices have changed. Please refresh your cart and try again.';
    const TOL = 1; // ₹1 rounding tolerance

    const items = Array.isArray(data.services) ? data.services : [];
    if (!data.salonId || !mongoose.Types.ObjectId.isValid(String(data.salonId))) {
        return { ok: false, message: 'Invalid salon for this booking.' };
    }
    if (items.length === 0) return { ok: false, message: 'Your cart is empty.' };

    const offers = await loadLiveOffersForSalon(String(data.salonId));

    // 1) Every service: real DB price (+ best live offer) must match what the app sent
    let subtotal = 0;
    for (const item of items) {
        const qty = Math.max(1, Math.min(10, Math.round(Number(item.quantity) || 1)));
        if (!mongoose.Types.ObjectId.isValid(String(item.id))) {
            return { ok: false, message: `"${item.name || 'A service'}" is no longer available. ${REFRESH}` };
        }
        const svc = await Service.findById(item.id).lean();
        if (!svc || String(svc.salonId) !== String(data.salonId) || svc.isActive === false) {
            return { ok: false, message: `"${item.name || 'A service'}" is no longer available. ${REFRESH}` };
        }
        const serverPrice = priceWithBestOffer(svc, offers);
        if (Math.abs(Number(item.price) - serverPrice) > TOL) {
            return { ok: false, message: `Price of "${svc.title}" is ₹${serverPrice} now. ${REFRESH}` };
        }
        subtotal += serverPrice * qty;
    }

    // 2) Bill total must match the server's total
    if (Math.abs(Number(data.totalAmount) - subtotal) > TOL) {
        return { ok: false, message: REFRESH };
    }

    // 3) Coupon: must be real & active, and discount can't exceed what it allows
    const discount = Math.max(0, Number(data.discountAmount) || 0);
    let allowedDiscount = 0;
    if (data.couponApplied) {
        const code = String(data.couponApplied).trim();
        const coupon = await Coupon.findOne({ code: { $regex: `^${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }).lean();
        if (!coupon || coupon.isActive === false || subtotal < (Number(coupon.minOrder) || 0)) {
            return { ok: false, message: 'This coupon is not valid for your cart. Please remove it and try again.' };
        }
        // same formula as the customer app (selectors.computeDiscount)
        if (coupon.discountPercent) allowedDiscount = (subtotal * Number(coupon.discountPercent)) / 100;
        else if (coupon.flatDiscount) allowedDiscount = Math.min(Number(coupon.flatDiscount), subtotal);
    }
    if (discount > allowedDiscount + TOL) {
        return { ok: false, message: 'Discount is not valid for this booking. Please refresh and try again.' };
    }

    // 4) Amount paid can't be lower than (total − allowed discount); tax / fees only add on top
    if (Number(data.finalPaid) < subtotal - allowedDiscount - TOL) {
        return { ok: false, message: REFRESH };
    }

    return { ok: true };
};

exports.createBooking = async (req, res) => {
    try {
        const bookingData = req.body;

        // ── Server-side price check: never trust prices sent by the customer's app ──
        const priceCheck = await verifyBookingPrices(bookingData);
        if (!priceCheck.ok) {
            return res.status(409).json({ success: false, code: 'PRICE_MISMATCH', message: priceCheck.message });
        }

        // Custom ID generation for "IT-XXXXXX"
        const count = await Booking.countDocuments();
        const customId = `IT-${220000 + count + 1}`; // Start from 220001

        const booking = new Booking({
            ...bookingData,
            _id: customId // Optional: Use this as _id or keep standard ObjectId and add a custom id field
        });

        const savedBooking = await booking.save();

        // Update Customer Wallet Balance strictly as per commercial model:
        // Visible Discount = totalAmount * 0.40
        // Instant Discount = Visible Discount * 0.50
        // Wallet Cashback Issued = Visible Discount * 0.50
        // Wallet Redeemed = Math.max(0, (totalAmount - finalPaid) - Instant Discount)
        // Net New Wallet Balance = prev_wallet - Wallet Redeemed + Wallet Cashback Issued
        if (savedBooking.customerId) {
            try {
                const billValue = savedBooking.totalAmount || 0;
                const finalPaid = savedBooking.finalPaid !== undefined ? savedBooking.finalPaid : billValue;
                const customerVisibleDiscount = billValue * 0.40;
                const instantDiscount = customerVisibleDiscount * 0.50;
                const walletCashbackIssued = customerVisibleDiscount * 0.50;
                const walletRedeemed = Math.max(0, (billValue - finalPaid) - instantDiscount);

                const Customer = require('../models/Customer');
                const customerDoc = await Customer.findById(savedBooking.customerId);
                if (customerDoc) {
                    const currentBal = customerDoc.wallet_balance || 0;
                    const updatedBal = Math.max(0, currentBal - walletRedeemed) + walletCashbackIssued;
                    customerDoc.wallet_balance = updatedBal;
                    await customerDoc.save();
                }
            } catch (walletErr) {
                console.error('Wallet balance update error:', walletErr);
            }
        }

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
