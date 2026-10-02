require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = process.env.PORT || 6200;
const path = require('path');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const adRoutes = require('./routes/adRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const salonRoutes = require('./routes/salonRoutes');
const ritualRoutes = require('./routes/ritualRoutes');
const couponRoutes = require('./routes/couponRoutes');
const adminRoutes = require('./routes/adminRoutes');
const staffRoutes = require('./routes/staffRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); // ADDED
const bookingRoutes = require('./routes/bookingRoutes'); // ADDED
const referralRoutes = require('./routes/referralRoutes');
const pageCampaignRoutes = require('./routes/pageCampaignRoutes');
const platformSettingsRoutes = require('./routes/platformSettingsRoutes');

const reviewRoutes = require('./routes/reviewRoutes'); // ADDED

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
app.use('/api/reviews', reviewRoutes); // ADDED
app.use('/api/payouts', require('./routes/payoutRoutes'));
app.use('/api/herobanners', require('./routes/heroBannerRoutes'));
app.get('/', (req, res) => {
    res.send('InstaaTrim API is running...');
});

const http = require('http');
const socketConfig = require('./socket');

connectDB().then(() => {
    const server = http.createServer(app);
    
    // Initialize Socket.io
    const io = socketConfig.init(server);
    io.on('connection', (socket) => {
        console.log('Client connected via socket:', socket.id);
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
