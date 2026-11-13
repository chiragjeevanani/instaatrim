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

    // 4) Booking rewards from Platform Settings (admin-controlled; 0 = off)
    const PlatformSettings = require('../models/PlatformSettings');
    const Customer = require('../models/Customer');
    const s = (await PlatformSettings.findOne().lean()) || {};
    const pct = (v, d) => (v === undefined || v === null || Number.isNaN(Number(v)) ? d : Math.max(0, Number(v)));
    const instantPct = pct(s.instantDiscountPercent, 20);
    const cashbackPct = pct(s.walletCashbackPercent, 20);
    const redeemPct = pct(s.walletRedeemPercent, 50);
    const instantDiscount = Math.round((subtotal * instantPct) / 100);
    const walletCashback = Math.round((subtotal * cashbackPct) / 100);
    // Booking must belong to a real customer in DB (so wallet / cashback reach the right account)
    const cust = mongoose.Types.ObjectId.isValid(String(data.customerId))
        ? await Customer.findById(data.customerId).select('wallet_balance').lean()
        : null;
    if (!cust) {
        return { ok: false, message: 'Please login or sign up first to confirm your booking.' };
    }
    const walletBalance = Number(cust.wallet_balance) || 0;
    const maxRedeem = Math.min(Math.round((walletBalance * redeemPct) / 100), Math.max(0, subtotal - instantDiscount - allowedDiscount));
    const walletRedeemed = Math.max(0, Math.min(Number(data.walletRedeemed) || 0, maxRedeem));

    // 5) Amount paid can't be lower than (total − coupon − instant discount − wallet used); tax / fees only add on top
    if (Number(data.finalPaid) < subtotal - allowedDiscount - instantDiscount - walletRedeemed - TOL) {
        return { ok: false, message: REFRESH };
    }

    return { ok: true, rewards: { instantDiscount, walletRedeemed, walletCashback } };
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

        // Stylist picked at checkout: must be an active staff of THIS salon; name always from DB
        let staffId = null;
        let staffName = null;
        if (bookingData.staffId && require('mongoose').Types.ObjectId.isValid(String(bookingData.staffId))) {
            const Staff = require('../models/Staff');
            const st = await Staff.findOne({ _id: bookingData.staffId, salonId: bookingData.salonId, isActive: { $ne: false } }).select('name').lean();
            if (st) {
                staffId = String(st._id);
                staffName = st.name;
            }
        }

        const rewards = priceCheck.rewards || { instantDiscount: 0, walletRedeemed: 0, walletCashback: 0 };
        const booking = new Booking({
            ...bookingData,
            staffId,
            staffName,
            // server-calculated rewards (never trusted from the app)
            instantDiscount: rewards.instantDiscount,
            walletRedeemed: rewards.walletRedeemed,
            walletCashback: rewards.walletCashback,
            cashbackPending: rewards.walletCashback > 0,
            cashbackCredited: false,
            walletRefunded: false,
            _id: customId // Optional: Use this as _id or keep standard ObjectId and add a custom id field
        });

        const savedBooking = await booking.save();

        // Wallet: only the wallet amount used on this booking is deducted now.
        // Cashback stays pending and is credited when the salon marks the service Completed.
        if (savedBooking.customerId && rewards.walletRedeemed > 0) {
            try {
                const Customer = require('../models/Customer');
                const customerDoc = await Customer.findById(savedBooking.customerId);
                if (customerDoc) {
                    customerDoc.wallet_balance = Math.max(0, (customerDoc.wallet_balance || 0) - rewards.walletRedeemed);
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

        // Wallet settlement (each happens only once per booking — flag is set atomically first)
        try {
            const Customer = require('../models/Customer');
            if (status === 'Completed' && Number(booking.walletCashback) > 0 && booking.customerId) {
                const claimed = await Booking.findOneAndUpdate(
                    { _id: id, cashbackPending: true, cashbackCredited: { $ne: true } },
                    { cashbackCredited: true, cashbackPending: false },
                    { new: true }
                );
                if (claimed) {
                    await Customer.updateOne({ _id: booking.customerId }, { $inc: { wallet_balance: Number(booking.walletCashback) } });
                    booking.cashbackCredited = true;
                    booking.cashbackPending = false;
                }
            }
            if ((status === 'Cancelled' || status === 'No-Show' || status === 'No Show') && booking.cashbackPending) {
                // service not taken → pending cashback is dropped
                await Booking.updateOne({ _id: id }, { cashbackPending: false });
                booking.cashbackPending = false;
            }
            if ((status === 'Cancelled' || status === 'No-Show' || status === 'No Show') && Number(booking.walletRedeemed) > 0 && booking.customerId) {
                const claimed = await Booking.findOneAndUpdate(
                    { _id: id, walletRefunded: { $ne: true } },
                    { walletRefunded: true },
                    { new: true }
                );
                if (claimed) {
                    await Customer.updateOne({ _id: booking.customerId }, { $inc: { wallet_balance: Number(booking.walletRedeemed) } });
                    booking.walletRefunded = true;
                }
            }
        } catch (walletErr) {
            console.error('Wallet settlement error:', walletErr);
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
