require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const {
    requestIdMiddleware,
    latencyMiddleware,
    generalApiRateLimiter
} = require('./middlewares/enterpriseMiddleware');

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = process.env.PORT || 6200;
const path = require('path');

// 1. Helmet for CSP, HSTS, X-Frame-Options (Clickjacking protection)
app.use(helmet({
    contentSecurityPolicy: false, // Allows cross-origin assets for custom frontend/CDN
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// 2. Response Compression (Gzip / Deflate)
app.use(compression());

// 3. Request ID for End-to-End Tracing
app.use(requestIdMiddleware);

// 4. Latency tracker for p50/p95/p99 SLA calculation
app.use(latencyMiddleware);

// 5. Global API Rate Limiter
app.use('/api', generalApiRateLimiter);

// 6. CORS & Body Parsers
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Handle invalid JSON payloads gracefully
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        logger.warn({ reqId: req.id, err: err.message }, 'Malformed JSON payload received from client');
        return res.status(400).json({ success: false, message: 'Malformed JSON payload' });
    }
    next(err);
});

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enterprise System Routes (Healthz, Readyz, Status & SLA, GDPR Export & Erasure, Consent)
app.use('/api/enterprise', require('./routes/enterpriseRoutes'));

// Business Routes
const adRoutes = require('./routes/adRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const salonRoutes = require('./routes/salonRoutes');
const ritualRoutes = require('./routes/ritualRoutes');
const couponRoutes = require('./routes/couponRoutes');
const adminRoutes = require('./routes/adminRoutes');
const staffRoutes = require('./routes/staffRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const referralRoutes = require('./routes/referralRoutes');
const pageCampaignRoutes = require('./routes/pageCampaignRoutes');
const platformSettingsRoutes = require('./routes/platformSettingsRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/stations', require('./routes/stationRoutes'));
app.use('/api/rituals', ritualRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/page-campaigns', pageCampaignRoutes);
app.use('/api/platform-settings', platformSettingsRoutes);
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/reviews', reviewRoutes);
app.use('/api/payouts', require('./routes/payoutRoutes'));
app.use('/api/herobanners', require('./routes/heroBannerRoutes'));
app.use('/api/landing', require('./routes/landingRoutes'));

// Health Probe root
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'online',
        service: 'DrimStyle API',
        tracingId: req.id,
        timestamp: new Date().toISOString()
    });
});

const http = require('http');
const socketConfig = require('./socket');
const mongoose = require('mongoose');

let serverInstance;

connectDB().then(() => {
    const server = http.createServer(app);
    serverInstance = server;
    
    // Initialize Socket.io
    const io = socketConfig.init(server);
    io.on('connection', (socket) => {
        logger.info({ socketId: socket.id }, 'Client connected via socket');
        socket.on('disconnect', () => {
            logger.info({ socketId: socket.id }, 'Client disconnected');
        });
    });

    server.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT} with Enterprise Capabilities enabled`);
    });
});

// Graceful Shutdown for Zero-Drop Deploys
const gracefulShutdown = (signal) => {
    logger.info({ signal }, `Received ${signal}. Starting graceful shutdown...`);
    if (serverInstance) {
        serverInstance.close(async () => {
            logger.info('HTTP server closed. Closing database connections...');
            try {
                await mongoose.connection.close(false);
                logger.info('Database connection closed safely. Exiting process.');
                process.exit(0);
            } catch (err) {
                logger.error({ err }, 'Error closing database connection during shutdown');
                process.exit(1);
            }
        });

        // Force shutdown if taking longer than 10s
        setTimeout(() => {
            logger.error('Graceful shutdown timeout exceeded. Forcefully exiting.');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
