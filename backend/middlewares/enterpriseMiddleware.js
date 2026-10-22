const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');

// 1. Request ID Middleware for End-to-End Tracing
const requestIdMiddleware = (req, res, next) => {
    const incomingReqId = req.headers['x-request-id'];
    const reqId = incomingReqId || `req_${crypto.randomUUID()}`;
    req.id = reqId;
    res.setHeader('X-Request-Id', reqId);
    next();
};

// 2. Latency Metrics Tracker (p50 / p95 / p99 tracker)
const latencyStore = [];
const MAX_METRICS_WINDOW = 2000;

const latencyMiddleware = (req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const diff = process.hrtime(start);
        const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6);
        if (latencyStore.length >= MAX_METRICS_WINDOW) {
            latencyStore.shift();
        }
        latencyStore.push({
            time: Date.now(),
            durationMs,
            statusCode: res.statusCode,
            method: req.method,
            route: req.baseUrl + (req.route ? req.route.path : req.path)
        });
    });
    next();
};

const getLatencyMetrics = () => {
    if (latencyStore.length === 0) {
        return { p50: 0, p95: 0, p99: 0, totalRequestsTracked: 0 };
    }
    const sorted = [...latencyStore].map(m => m.durationMs).sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.50)] || 0;
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
    return {
        p50: Number(p50.toFixed(2)),
        p95: Number(p95.toFixed(2)),
        p99: Number(p99.toFixed(2)),
        totalRequestsTracked: sorted.length
    };
};

// 3. Rate Limiters
// Sensitive Auth Rate Limiter
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 25, // limit each IP to 25 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login/auth attempts from this IP, please try again after 15 minutes.'
    }
});

// General API Rate Limiter
const generalApiRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 min
    max: 180, // 180 requests per min
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many API requests, please slow down.'
    }
});

// 4. Audit Trail Helper Function
const logAuditEvent = async ({ action, performedBy, role = 'USER', req, details = {} }) => {
    try {
        await AuditLog.create({
            action,
            performedBy,
            role,
            ipAddress: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : '127.0.0.1',
            userAgent: req ? req.headers['user-agent'] : 'SYSTEM',
            requestId: req ? req.id : undefined,
            details
        });
    } catch (e) {
        console.error('Failed to write immutable audit log:', e.message);
    }
};

module.exports = {
    requestIdMiddleware,
    latencyMiddleware,
    getLatencyMetrics,
    authRateLimiter,
    generalApiRateLimiter,
    logAuditEvent
};
