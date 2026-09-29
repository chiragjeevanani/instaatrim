const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'instaatrim_secret_key';
const STATIC_OTP = '1234'; // Static OTP as requested

// POST /api/auth/send-otp
// Body: { phone }
const sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || phone.length !== 10) {
            return res.status(400).json({ success: false, message: 'Valid 10-digit phone number required' });
        }

        // Set OTP expiry: 10 minutes from now
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Find or create customer
        let customer = await Customer.findOne({ phone });

        if (!customer) {
            // New user — create with phone + static OTP
            customer = await Customer.create({
                phone,
                otp: STATIC_OTP,
                otpExpiry,
            });
        } else {
            // Existing user — update OTP
            customer.otp = STATIC_OTP;
            customer.otpExpiry = otpExpiry;
            await customer.save();
        }

        // In production: send real OTP via SMS here
        // For now: static OTP is 1234
        console.log(`OTP for ${phone}: ${STATIC_OTP}`);

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
        const { phone, otp, name } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
        }

        const customer = await Customer.findOne({ phone });

        if (!customer) {
            return res.status(404).json({ success: false, message: 'User not found. Please request OTP first.' });
        }

        // Check OTP
        if (customer.otp !== otp) {
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

module.exports = { sendOTP, verifyOTP, logout };
