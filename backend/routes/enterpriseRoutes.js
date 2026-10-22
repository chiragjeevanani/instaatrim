const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getLatencyMetrics } = require('../middlewares/enterpriseMiddleware');
const Customer = require('../models/Customer');
const Salon = require('../models/Salon');
const { protectCustomer } = require('../middlewares/authMiddleware');
const { anonymizePII } = require('../utils/encryption');
const { logAuditEvent } = require('../middlewares/enterpriseMiddleware');

// 1. Health Probe (/api/enterprise/healthz)
router.get('/healthz', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage()
    });
});

// 2. Readiness Probe (/api/enterprise/readyz)
router.get('/readyz', (req, res) => {
    const mongoState = mongoose.connection.readyState;
    // readyState 1 is connected
    if (mongoState === 1) {
        return res.status(200).json({
            status: 'ready',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    }
    return res.status(503).json({
        status: 'not_ready',
        database: 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// 3. Public Status & SLA Metrics Endpoint (/api/enterprise/status)
router.get('/status', async (req, res) => {
    const mongoState = mongoose.connection.readyState;
    const latency = getLatencyMetrics();
    
    res.status(200).json({
        service: 'Instaatrim Full-Stack API',
        slaTarget: '99.95%',
        currentHealth: mongoState === 1 ? 'OPERATIONAL' : 'DEGRADED',
        uptime: `${Math.floor(process.uptime() / 60)} minutes`,
        activeComponents: {
            database: mongoState === 1 ? 'HEALTHY' : 'DOWN',
            realtimeSockets: 'RUNNING',
            authService: 'OPERATIONAL',
            paymentGateway: 'ENABLED'
        },
        latencyMetricsMs: {
            p50: latency.p50,
            p95: latency.p95,
            p99: latency.p99,
            totalSamples: latency.totalRequestsTracked
        },
        timestamp: new Date().toISOString()
    });
});

// 4. GDPR Data Export (Data Portability)
router.get('/gdpr/export', protectCustomer, async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer._id).lean();
        if (!customer) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Audit log GDPR request
        await logAuditEvent({
            action: 'GDPR_DATA_EXPORT',
            performedBy: customer._id.toString(),
            role: 'CUSTOMER',
            req,
            details: { phone: customer.phone }
        });

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=gdpr_export_${customer._id}.json`);
        return res.status(200).json({
            exportDate: new Date().toISOString(),
            compliance: 'GDPR Article 20 - Right to Data Portability',
            userData: customer
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Export failed', error: err.message });
    }
});

// 5. GDPR Right to Erasure with PII Anonymization
router.post('/gdpr/erase', protectCustomer, async (req, res) => {
    try {
        const customer = await Customer.findById(req.customer._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const originalId = customer._id.toString();

        // Anonymize PII instead of hard-delete to retain non-personal booking analytics
        customer.name = anonymizePII(customer.name, 'name');
        customer.phone = anonymizePII(customer.phone, 'phone');
        customer.email = customer.email ? anonymizePII(customer.email, 'email') : undefined;
        customer.saved_locations = [];
        customer.cart_items = [];
        customer.favorite_salon_ids = [];
        customer.fcmtoken = undefined;
        customer.fcmtokenweb = undefined;
        customer.consentMarketing = false;

        await customer.save();

        await logAuditEvent({
            action: 'GDPR_RIGHT_TO_ERASURE',
            performedBy: originalId,
            role: 'CUSTOMER',
            req,
            details: { status: 'PII_ANONYMIZED' }
        });

        return res.status(200).json({
            success: true,
            message: 'Your personal data has been erased and anonymized in compliance with GDPR Right to Erasure.'
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Erasure failed', error: err.message });
    }
});

// 6. Consent Management Endpoint
router.post('/consent', protectCustomer, async (req, res) => {
    try {
        const { consentMarketing, consentDataProcessing } = req.body;
        const customer = await Customer.findById(req.customer._id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (typeof consentMarketing === 'boolean') {
            customer.consentMarketing = consentMarketing;
        }
        if (typeof consentDataProcessing === 'boolean') {
            customer.consentDataProcessing = consentDataProcessing;
        }

        await customer.save();

        await logAuditEvent({
            action: 'CONSENT_UPDATE',
            performedBy: customer._id.toString(),
            role: 'CUSTOMER',
            req,
            details: { consentMarketing, consentDataProcessing }
        });

        return res.status(200).json({
            success: true,
            message: 'User consent preferences updated successfully',
            consent: {
                consentMarketing: customer.consentMarketing,
                consentDataProcessing: customer.consentDataProcessing
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Consent update failed' });
    }
});

module.exports = router;
