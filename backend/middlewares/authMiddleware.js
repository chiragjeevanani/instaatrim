const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const JWT_SECRET = process.env.JWT_SECRET || 'instaatrim_super_secret_jwt_key_2024';

// Middleware: protect customer routes
// Reads Bearer token from Authorization header, verifies JWT, attaches customer to req.customer
const protectCustomer = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Fetch customer from DB (exclude otp fields)
        const customer = await Customer.findById(decoded.customerId).select('-otp -otpExpiry');
        if (!customer) {
            return res.status(401).json({ success: false, message: 'Customer not found. Token invalid.' });
        }

        req.customer = customer;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
    }
};

const protectAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Not authorized as admin. No token provided.' });
        }

        const token = authHeader.split(' ')[1];

        // For now, checking the mock admin token used by the frontend
        if (token === 'mock-jwt-token-7a8b9c0d1e2f3g4h5i6j') {
            next();
        } else {
            return res.status(401).json({ success: false, message: 'Invalid admin token.' });
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Not authorized as admin.' });
    }
};

// Middleware: salon partner OR admin.
// - Admin (mock admin token) → req.isAdmin = true
// - Salon partner JWT ({ id, role: 'salon' }) → req.salon = Salon document
const protectSalonOrAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Not authorized. Please login again.' });
        }
        const token = authHeader.split(' ')[1];

        if (token === 'mock-jwt-token-7a8b9c0d1e2f3g4h5i6j') {
            req.isAdmin = true;
            return next();
        }

        // Same secret/fallback used when the salon token is signed (salonController login)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        if (decoded.role !== 'salon' || !decoded.id) {
            return res.status(403).json({ success: false, message: 'Only salon partners can do this. Please login as a salon partner.' });
        }

        const Salon = require('../models/Salon');
        const salon = await Salon.findById(decoded.id).select('_id name isVerified verificationStatus');
        if (!salon) {
            return res.status(401).json({ success: false, message: 'Salon not found. Please login again.' });
        }
        req.salon = salon;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
    }
};

module.exports = { protectCustomer, protectAdmin, protectSalonOrAdmin };
