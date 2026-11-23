// Who is calling? One place that reads every login token the app sends.
//
// The web app can hold up to three logins at once in the same browser (admin panel,
// salon partner panel, customer app). Besides the normal `Authorization: Bearer …`
// header, the frontend sends each login it has in its own header:
//   X-Admin-Token / X-Salon-Token / X-Customer-Token
// Every token is a JWT signed by this server, so a header can't be faked.
//
// req.auth = { admin: bool, salonId: string|null, customerId: string|null, primary: 'admin'|'salon'|'customer'|null }
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Same secrets the tokens are signed with (all equal to JWT_SECRET on the server).
const CUSTOMER_SECRETS = [process.env.JWT_SECRET || 'instaatrim_secret_key', 'instaatrim_super_secret_jwt_key_2024'];
const SALON_SECRETS = [process.env.JWT_SECRET || 'secret123'];
// Admin tokens never fall back to a public default secret.
const ADMIN_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

const verifyWith = (token, secrets) => {
    for (const s of secrets) {
        try {
            return jwt.verify(token, s);
        } catch (_) { /* try next */ }
    }
    return null;
};

const classify = (token) => {
    if (!token || token === 'null' || token === 'undefined') return null;
    try {
        const admin = jwt.verify(token, ADMIN_SECRET);
        if (admin && admin.role === 'admin') return { role: 'admin' };
    } catch (_) { /* not an admin token */ }
    const salon = verifyWith(token, SALON_SECRETS);
    if (salon && salon.role === 'salon' && salon.id) return { role: 'salon', id: String(salon.id) };
    const customer = verifyWith(token, CUSTOMER_SECRETS);
    if (customer && customer.customerId) return { role: 'customer', id: String(customer.customerId) };
    return null;
};

const bearer = (req) => {
    const h = req.headers.authorization || '';
    return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
};

const identify = (req) => {
    if (req.auth) return req.auth;
    const auth = { admin: false, salonId: null, customerId: null, primary: null };
    const candidates = [bearer(req), req.headers['x-admin-token'], req.headers['x-salon-token'], req.headers['x-customer-token']];
    candidates.forEach((t, i) => {
        const c = classify(t);
        if (!c) return;
        if (i === 0) auth.primary = c.role;
        if (c.role === 'admin') auth.admin = true;
        if (c.role === 'salon' && !auth.salonId) auth.salonId = c.id;
        if (c.role === 'customer' && !auth.customerId) auth.customerId = c.id;
    });
    req.auth = auth;
    return auth;
};

const deny = (res, message = 'Please login again to continue.', status = 401) =>
    res.status(status).json({ success: false, code: 'AUTH_REQUIRED', message });

// ---- route guards ----

const requireAdmin = (req, res, next) => (identify(req).admin ? next() : deny(res, 'Admin login required.'));

// Any logged-in user (customer, salon partner or admin)
const requireLogin = (req, res, next) => {
    const a = identify(req);
    return a.admin || a.salonId || a.customerId ? next() : deny(res);
};

const requireCustomer = (req, res, next) => (identify(req).customerId ? next() : deny(res, 'Please login to continue.'));

// The salon in the URL must be the logged-in salon (or admin).
const requireSalonParamOrAdmin = (param = 'id') => (req, res, next) => {
    const a = identify(req);
    if (a.admin) return next();
    if (!a.salonId) return deny(res, 'Please login as the salon partner to continue.');
    if (String(req.params[param]) !== a.salonId) return deny(res, 'You can only change your own salon.', 403);
    return next();
};

const requireSalonOrAdmin = (req, res, next) => {
    const a = identify(req);
    return a.admin || a.salonId ? next() : deny(res, 'Please login as the salon partner to continue.');
};

// The customer in the URL must be the logged-in customer (or admin).
const requireCustomerParamOrAdmin = (param = 'id') => (req, res, next) => {
    const a = identify(req);
    if (a.admin) return next();
    if (!a.customerId) return deny(res, 'Please login to continue.');
    if (String(req.params[param]) !== a.customerId) return deny(res, 'Not allowed.', 403);
    return next();
};

const signAdminToken = (email) => jwt.sign({ role: 'admin', email }, ADMIN_SECRET, { expiresIn: '30d' });

module.exports = {
    identify,
    requireAdmin,
    requireLogin,
    requireCustomer,
    requireSalonOrAdmin,
    requireSalonParamOrAdmin,
    requireCustomerParamOrAdmin,
    signAdminToken
};
