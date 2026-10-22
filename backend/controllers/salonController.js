const Salon = require('../models/Salon');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

exports.deleteSalon = async (req, res) => {
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const salon = await Salon.findById(req.params.id).session(session);
        if (!salon) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }

        const salonId = salon._id;
        const salonIdString = salonId.toString();
        const Staff = require('../models/Staff');
        const Station = require('../models/Station');
        const Service = require('../models/Service');
        const Ritual = require('../models/Ritual');
        const YieldAlert = require('../models/YieldAlert');
        const AdCampaign = require('../models/AdCampaign');
        const HeroBanner = require('../models/HeroBanner');

        await Staff.deleteMany({ salonId }, { session });
        await Station.deleteMany({ salonId }, { session });
        await Service.deleteMany({ salonId }, { session });
        await Ritual.deleteMany({ salonId }, { session });
        await YieldAlert.deleteMany({ salonId }, { session });
        await AdCampaign.deleteMany({ salonId: salonIdString }, { session });
        await HeroBanner.deleteMany({ salonId: salonIdString }, { session });
        await salon.deleteOne({ session });
        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: 'Salon and related active records deleted. Booking and payout history was retained.',
        });
    } catch (error) {
        if (session?.inTransaction()) {
            await session.abortTransaction().catch(() => {});
        }
        console.error('deleteSalon error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete salon' });
    } finally {
        if (session) await session.endSession();
    }
};

exports.registerSalon = async (req, res) => {
    try {
        const {
            name, ownerName, mobile, email, password, category,
            city, area, address, openTime, closeTime, totalChairs,
            amenities, coverImage, gstin, shopActLicense, bankName,
            accountNumber, ifscCode, payoutCycle, fcmtoken, fcmtokenweb
        } = req.body;

        // Check if salon already exists
        let salon = await Salon.findOne({ $or: [{ mobile }, { email }] });
        if (salon) {
            return res.status(400).json({ success: false, message: 'Salon with this mobile or email already exists' });
        }

        // Hash password
        // Cost 12 as per enterprise password policy
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        let finalCoverImage = coverImage;

        // Extract base64 and save to uploads folder if present
        if (coverImage && coverImage.startsWith('data:image')) {
            const matches = coverImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const fs = require('fs');
                const path = require('path');
                const extension = matches[1].split('/')[1] || 'jpg';
                const filename = `salon-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
                const uploadDir = path.join(__dirname, '..', 'uploads');

                // Create uploads directory if it doesn't exist
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                // Write file to disk
                fs.writeFileSync(path.join(uploadDir, filename), matches[2], 'base64');

                // Construct dynamic URL based on request host (works for localhost and live server)
                const protocol = req.protocol;
                const host = req.get('host');
                finalCoverImage = `${protocol}://${host}/uploads/${filename}`;
            }
        }

        // Create new salon
        salon = new Salon({
            name, ownerName, mobile, email, password: hashedPassword, category,
            city, area, address, openTime, closeTime, totalChairs,
            amenities, coverImage: finalCoverImage, gstin, shopActLicense, bankName,
            accountNumber, ifscCode, payoutCycle, fcmtoken, fcmtokenweb
        });

        await salon.save();

        res.status(201).json({
            success: true,
            message: 'Salon registered successfully',
            data: {
                id: salon._id,
                name: salon.name,
                email: salon.email,
                mobile: salon.mobile
            }
        });

    } catch (error) {
        console.error('Error registering salon:', error);
        res.status(500).json({ success: false, message: 'Server error during salon registration' });
    }
};

exports.loginSalon = async (req, res) => {
    try {
        const { loginId, password, fcmtoken, fcmtokenweb } = req.body;
        if (!loginId || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email/mobile and password' });
        }

        // Search by email or mobile
        const salon = await Salon.findOne({
            $or: [{ email: loginId.toLowerCase() }, { mobile: loginId }]
        });

        if (!salon) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Enterprise Account Lockout Protection Check
        if (salon.lockoutUntil && salon.lockoutUntil > new Date()) {
            const minutesLeft = Math.ceil((salon.lockoutUntil - new Date()) / (60 * 1000));
            return res.status(423).json({
                success: false,
                message: `Account is temporarily locked due to consecutive failed login attempts. Please try again in ${minutesLeft} minutes.`
            });
        }

        const isMatch = await bcrypt.compare(password, salon.password);
        if (!isMatch) {
            salon.failedLoginAttempts = (salon.failedLoginAttempts || 0) + 1;
            // Lock out after 5 consecutive failed attempts for 15 minutes
            if (salon.failedLoginAttempts >= 5) {
                salon.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
            }
            await salon.save();

            return res.status(401).json({
                success: false,
                message: salon.failedLoginAttempts >= 5
                    ? 'Account locked for 15 minutes due to too many failed attempts.'
                    : `Invalid credentials. Attempts left: ${5 - salon.failedLoginAttempts}`
            });
        }

        // Reset failed login attempts on successful login
        salon.failedLoginAttempts = 0;
        salon.lockoutUntil = null;

        // Generate Access Token (15m/short-lived) & Rotating Refresh Token (7d)
        const jwt = require('jsonwebtoken');
        const crypto = require('crypto');
        const token = jwt.sign({ id: salon._id, role: 'salon' }, process.env.JWT_SECRET || 'secret123', {
            expiresIn: '1h'
        });
        const refreshToken = `rft_${crypto.randomBytes(32).toString('hex')}`;
        salon.refreshToken = refreshToken;

        // Update FCM tokens if provided
        if (fcmtoken || fcmtokenweb) {
            if (fcmtoken) salon.fcmtoken = fcmtoken;
            if (fcmtokenweb) salon.fcmtokenweb = fcmtokenweb;
        }
        await salon.save();

        // Audit Trail
        const { logAuditEvent } = require('../middlewares/enterpriseMiddleware');
        await logAuditEvent({
            action: 'SALON_LOGIN_SUCCESS',
            performedBy: salon._id.toString(),
            role: 'SALON',
            req,
            details: { email: salon.email }
        });

        const salonData = salon.toObject();
        salonData.id = salon._id.toString();
        delete salonData.password;
        delete salonData.refreshToken;

        res.status(200).json({
            success: true,
            token,
            refreshToken,
            data: salonData
        });
    } catch (error) {
        console.error('Error logging in salon:', error);
        res.status(500).json({ success: false, message: 'Server error during salon login' });
    }
};

exports.getSalonById = async (req, res) => {
    try {
        const salon = await Salon.findById(req.params.id);
        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }

        const salonData = salon.toObject();
        salonData.id = salon._id.toString();

        res.status(200).json({
            success: true,
            data: salonData
        });
    } catch (error) {
        console.error('Error getting salon:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAllSalons = async (req, res) => {
    try {
        const Category = require('../models/Category');

        // Fetch ALL salons (no query filter first)
        const salons = await Salon.find({});

        // Get all categories so we can resolve ObjectId <-> name
        const allCategories = await Category.find({});
        const catMap = {}; // _id string -> category object
        allCategories.forEach(c => { catMap[c._id.toString()] = c; });

        let mappedSalons = salons.map(salon => {
            const salonData = salon.toObject();
            salonData.id = salon._id.toString();

            // If category is stored as ObjectId, resolve it to name/slug
            if (salonData.category) {
                const catId = salonData.category.toString();
                const catObj = catMap[catId];
                if (catObj) {
                    salonData.categoryName = catObj.name;
                    salonData.categorySlug = catObj.slug;
                    salonData.category = catObj.name; // Normalize to name string
                }
            }
            return salonData;
        });

        // Apply category filter if provided
        if (req.query.category && req.query.category !== 'All') {
            const filterSlug = req.query.category.toLowerCase();
            mappedSalons = mappedSalons.filter(s => {
                const catName = (s.categoryName || s.category || '').toLowerCase();
                const catSlug = (s.categorySlug || '').toLowerCase();
                return (
                    catSlug.includes(filterSlug) ||
                    catName.includes(filterSlug.replace(/-/g, ' ')) ||
                    filterSlug.includes(catName.replace(/\s+/g, '-'))
                );
            });
        }

        res.status(200).json({ success: true, data: mappedSalons });
    } catch (error) {
        console.error('Error getting all salons:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.verifySalon = async (req, res) => {
    try {
        const salon = await Salon.findByIdAndUpdate(req.params.id, {
            verificationStatus: req.body.status || 'Live',
            isVerified: req.body.status === 'Live'
        }, { new: true });

        if (!salon) return res.status(404).json({ success: false, message: 'Salon not found' });

        const salonData = salon.toObject();
        salonData.id = salon._id.toString();
        res.status(200).json({ success: true, data: salonData });
    } catch (error) {
        console.error('Error verifying salon:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.rejectSalon = async (req, res) => {
    try {
        const salon = await Salon.findByIdAndUpdate(req.params.id, {
            verificationStatus: 'Rejected',
            isVerified: false,
            rejectionReason: req.body.reason || 'Application rejected by administrator'
        }, { new: true });

        if (!salon) return res.status(404).json({ success: false, message: 'Salon not found' });

        const salonData = salon.toObject();
        salonData.id = salon._id.toString();
        res.status(200).json({ success: true, data: salonData });
    } catch (error) {
        console.error('Error rejecting salon:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.setSalonCommission = async (req, res) => {
    try {
        const salon = await Salon.findByIdAndUpdate(req.params.id, {
            commissionRate: req.body.commissionRate
        }, { new: true });

        if (!salon) return res.status(404).json({ success: false, message: 'Salon not found' });

        const salonData = salon.toObject();
        salonData.id = salon._id.toString();
        res.status(200).json({ success: true, data: salonData });
    } catch (error) {
        console.error('Error setting salon commission:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateSalon = async (req, res) => {
    try {
        const salonId = req.params.id;
        const updates = req.body;
        
        const salon = await Salon.findByIdAndUpdate(salonId, updates, { new: true });
        
        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }
        
        const salonData = salon.toObject();
        salonData.id = salon._id.toString();
        
        res.status(200).json({ success: true, data: salonData });
    } catch (error) {
        console.error('Error updating salon:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.addOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const offerData = req.body;
        
        const salon = await Salon.findById(id);
        if (!salon) return res.status(404).json({ success: false, message: 'Salon not found' });
        
        const newOffer = {
            _id: `off-${Date.now()}`,
            id: `off-${Date.now()}`,
            isActive: true,
            redeemedCount: 0,
            approvalStatus: 'pending',
            ...offerData
        };
        
        if (!salon.offers) salon.offers = [];
        salon.offers.push(newOffer);
        await salon.save();
        
        res.status(201).json({ success: true, data: newOffer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateOfferStatus = async (req, res) => {
    try {
        const { id, offerId } = req.params;
        const { approvalStatus, isActive, rejectionReason } = req.body;
        
        const salon = await Salon.findById(id);
        if (!salon) return res.status(404).json({ success: false, message: 'Salon not found' });
        
        const offerIndex = salon.offers.findIndex(o => (o._id === offerId || o.id === offerId));
        if (offerIndex === -1) return res.status(404).json({ success: false, message: 'Offer not found' });
        
        if (approvalStatus) salon.offers[offerIndex].approvalStatus = approvalStatus;
        if (isActive !== undefined) salon.offers[offerIndex].isActive = isActive;
        if (rejectionReason) salon.offers[offerIndex].rejectionReason = rejectionReason;
        
        // Mark as modified so mongoose saves mixed array
        salon.markModified('offers');
        await salon.save();
        
        res.status(200).json({ success: true, data: salon.offers[offerIndex] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.saveFcmToken = async (req, res) => {
    try {
        const { token, platform } = req.body;
        
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        
        const jwtToken = authHeader.split(' ')[1];
        if (!jwtToken || jwtToken === 'undefined' || jwtToken === 'null') {
            return res.status(401).json({ success: false, message: 'Invalid or missing token string' });
        }
        
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET || 'secret123');
        const userId = decoded.id;
        
        if (!token || !platform) {
            return res.status(400).json({ success: false, message: 'token and platform are required' });
        }

        const allowedPlatforms = ['web', 'app', 'ios', 'android'];
        const currentPlatform = platform.toLowerCase();

        if (!allowedPlatforms.includes(currentPlatform)) {
            return res.status(400).json({ success: false, message: 'Invalid platform. Allowed values: web, app, ios, android' });
        }

        const salon = await Salon.findById(userId);
        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }

        const isWeb = platform.toLowerCase() === 'web';
        
        if (isWeb) {
            salon.fcmtokenweb = token;
        } else {
            salon.fcmtoken = token;
        }
        
        await salon.save();
        
        console.log(`[Salon] FCM Token saved successfully for platform: ${platform} | Salon ID: ${userId}`);
        
        return res.status(200).json({ success: true, message: 'FCM Token saved successfully' });
    } catch (error) {
        console.error('saveFcmToken error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
