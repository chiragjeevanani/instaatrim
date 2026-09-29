const Salon = require('../models/Salon');
const bcrypt = require('bcryptjs');

exports.registerSalon = async (req, res) => {
    try {
        const {
            name, ownerName, mobile, email, password, category,
            city, area, address, openTime, closeTime, totalChairs,
            amenities, coverImage, gstin, shopActLicense, bankName,
            accountNumber, ifscCode
        } = req.body;

        // Check if salon already exists
        let salon = await Salon.findOne({ $or: [{ mobile }, { email }] });
        if (salon) {
            return res.status(400).json({ success: false, message: 'Salon with this mobile or email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
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
            accountNumber, ifscCode
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
        const { loginId, password } = req.body;
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

        const isMatch = await bcrypt.compare(password, salon.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign({ id: salon._id, role: 'salon' }, process.env.JWT_SECRET || 'secret123', {
            expiresIn: '7d'
        });

        const salonData = salon.toObject();
        salonData.id = salon._id.toString();

        res.status(200).json({
            success: true,
            token,
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
        const salons = await Salon.find({});
        const mappedSalons = salons.map(salon => {
            const salonData = salon.toObject();
            salonData.id = salon._id.toString();
            return salonData;
        });
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
