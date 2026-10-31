const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOtpSMS } = require('../services/smsService');

const JWT_SECRET = process.env.JWT_SECRET || 'instaatrim_secret_key';

// Generate a random 4-digit OTP (1000 - 9999)
const generateRandomOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// POST /api/auth/send-otp
// Body: { phone }
const sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || phone.length !== 10) {
            return res.status(400).json({ success: false, message: 'Valid 10-digit phone number required' });
        }

        // Generate dynamic 4-digit OTP
        const dynamicOTP = generateRandomOTP();

        // Set OTP expiry: 10 minutes from now
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Find or create customer
        let customer = await Customer.findOne({ phone });

        if (!customer) {
            // New user — create with phone + dynamic OTP
            customer = await Customer.create({
                phone,
                // referral_code has a unique MongoDB index, so new records
                // must not insert null into that index.
                referral_code: `DRIM${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
                otp: dynamicOTP,
                otpExpiry,
            });
        } else {
            // Existing user — update OTP
            customer.otp = dynamicOTP;
            customer.otpExpiry = otpExpiry;
            await customer.save();
        }

        // Dispatch real SMS via SMSIndiaHub API
        console.log(`[Customer Auth] Generated OTP for ${phone}: ${dynamicOTP}`);
        sendOtpSMS(phone, dynamicOTP).catch((err) => {
            console.error('[Customer Auth] SMS Dispatch Error:', err);
        });

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            isNewUser: !customer.name || customer.name === 'Customer',
        });
    } catch (error) {
        console.error('sendOTP error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/auth/verify-otp
// Body: { phone, otp, name (optional for new users) }
const verifyOTP = async (req, res) => {
    try {
        const { phone, otp, name, fcmtoken, fcmtokenweb } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
        }

        const customer = await Customer.findOne({ phone });

        if (!customer) {
            return res.status(404).json({ success: false, message: 'User not found. Please request OTP first.' });
        }

        // Check OTP (Strict verification: only the actual OTP matches)
        if (!customer.otp || customer.otp !== String(otp).trim()) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // Check expiry
        if (!customer.otpExpiry || new Date() > customer.otpExpiry) {
            return res.status(400).json({ success: false, message: 'OTP expired. Please request a new one.' });
        }

        // Update name if provided (new user)
        if (name && name.trim()) {
            customer.name = name.trim();
        }

        // Clear OTP after successful verification
        customer.otp = undefined;
        customer.otpExpiry = undefined;
        
        // Update FCM tokens if provided
        if (fcmtoken) customer.fcmtoken = fcmtoken;
        if (fcmtokenweb) customer.fcmtokenweb = fcmtokenweb;
        
        await customer.save();

        // Generate JWT
        const token = jwt.sign(
            { customerId: customer._id, phone: customer.phone },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // isNewUser = name is still default (user hasn't set a real name yet)
        const isNewUser = !customer.name || customer.name === 'Customer';

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            isNewUser,
            customer: {
                id: customer._id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                gender: customer.gender,
                is_elite: customer.is_elite,
                referral_code: customer.referral_code,
            },
        });
    } catch (error) {
        console.error('verifyOTP error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/auth/logout
const logout = async (req, res) => {
    // For stateless JWT, backend just acknowledges the logout.
    // The frontend clears the token.
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// POST /api/auth/save-fcm-token
const saveFcmToken = async (req, res) => {
    try {
        const { token, platform } = req.body;
        const userId = req.customer._id;
        
        if (!token || !platform) {
            return res.status(400).json({ success: false, message: 'token and platform are required' });
        }

        const allowedPlatforms = ['web', 'app', 'ios', 'android'];
        const currentPlatform = platform.toLowerCase();

        if (!allowedPlatforms.includes(currentPlatform)) {
            return res.status(400).json({ success: false, message: 'Invalid platform. Allowed values: web, app, ios, android' });
        }

        const customer = await Customer.findById(userId);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const isWeb = platform.toLowerCase() === 'web';
        
        if (isWeb) {
            customer.fcmtokenweb = token;
        } else {
            customer.fcmtoken = token;
        }
        
        await customer.save();
        
        console.log(`[Customer] FCM Token saved successfully for platform: ${platform} | User: ${userId}`);
        
        return res.status(200).json({ success: true, message: 'FCM Token saved successfully' });
    } catch (error) {
        console.error('saveFcmToken error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { sendOTP, verifyOTP, logout, saveFcmToken };
