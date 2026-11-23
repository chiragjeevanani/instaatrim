const Customer = require('../models/Customer');
const { identify } = require('./accessControl');

// Middleware: protect customer routes
// Verifies the customer's JWT (Authorization or X-Customer-Token), attaches customer to req.customer
const protectCustomer = async (req, res, next) => {
    try {
        const { customerId } = identify(req);
        if (!customerId) {
            return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
        }
        const customer = await Customer.findById(customerId).select('-otp -otpExpiry');
        if (!customer) {
            return res.status(401).json({ success: false, message: 'Customer not found. Token invalid.' });
        }
        req.customer = customer;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
    }
};

// Admin panel only (real admin JWT issued by POST /api/admin/login)
const protectAdmin = (req, res, next) => {
    if (identify(req).admin) return next();
    return res.status(401).json({ success: false, message: 'Admin login required. Please login again.' });
};

// Middleware: salon partner OR admin.
// - Admin → req.isAdmin = true
// - Salon partner JWT ({ id, role: 'salon' }) → req.salon = Salon document
// When both logins exist in one browser, the token in the Authorization header decides.
const protectSalonOrAdmin = async (req, res, next) => {
    try {
        const auth = identify(req);
        const useAdmin = auth.admin && (auth.primary === 'admin' || !auth.salonId);
        if (useAdmin) {
            req.isAdmin = true;
            return next();
        }
        if (!auth.salonId) {
            return res.status(401).json({ success: false, message: 'Not authorized. Please login again.' });
        }
        const Salon = require('../models/Salon');
        const salon = await Salon.findById(auth.salonId).select('_id name isVerified verificationStatus');
        if (!salon) {
            return res.status(401).json({ success: false, message: 'Salon not found. Please login again.' });
        }
        req.salon = salon;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
    }
};

module.exports = { protectCustomer, protectAdmin, protectSalonOrAdmin };
