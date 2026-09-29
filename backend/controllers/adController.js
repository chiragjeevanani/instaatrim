const AdCampaign = require('../models/AdCampaign');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/ads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { files: 4 } // maximum 4 banners at once
});

exports.uploadAdsMiddleware = upload.array('images', 4);

// POST /api/ads
exports.createAd = async (req, res) => {
    try {
        const { 
            brand, sponsorBadge, title, subtitle, description, 
            discountBadge, couponCode, ctaText, salonId, 
            category, validTill, isActive, campaignType 
        } = req.body;
        
        let imageUrls = [];
        
        if (req.files && req.files.length > 0) {
            // "local se uploa dkru oth ocal ke url ke ssath db me store hoan chiay an me live se uplao dkaru oth live url ke ssath db me store hona chaiye"
            const baseUrl = req.protocol + '://' + req.get('host');
            imageUrls = req.files.map(file => `${baseUrl}/uploads/ads/${file.filename}`);
        } else {
             // Fallback for direct URL input from UI if file is not selected
             if (req.body.image) {
                 imageUrls = Array.isArray(req.body.image) ? req.body.image : [req.body.image];
             }
        }
        
        if (imageUrls.length === 0) {
            return res.status(400).json({ success: false, message: 'Please upload at least 1 image (max 4)' });
        }
        
        const ad = new AdCampaign({
            brand,
            sponsorBadge,
            title,
            subtitle,
            description,
            discountBadge,
            couponCode,
            ctaText,
            images: imageUrls,
            salonId: salonId || undefined,
            category,
            validTill,
            isActive: isActive === 'true' || isActive === true,
            campaignType: campaignType || 'top_carousel'
        });
        
        await ad.save();
        
        res.status(201).json({ success: true, data: ad });
    } catch (error) {
        console.error('Error creating ad:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// PUT /api/ads/:id
exports.updateAd = async (req, res) => {
    try {
        const { 
            brand, sponsorBadge, title, subtitle, description, 
            discountBadge, couponCode, ctaText, salonId, 
            category, validTill, isActive, campaignType 
        } = req.body;
        
        let imageUrls = [];
        
        if (req.files && req.files.length > 0) {
            const baseUrl = req.protocol + '://' + req.get('host');
            imageUrls = req.files.map(file => `${baseUrl}/uploads/ads/${file.filename}`);
        } else {
             if (req.body.image) {
                 imageUrls = Array.isArray(req.body.image) ? req.body.image : [req.body.image];
             }
        }
        
        const updateData = {
            brand, sponsorBadge, title, subtitle, description, 
            discountBadge, couponCode, ctaText, salonId: salonId || undefined, 
            category, validTill, campaignType
        };

        if (isActive !== undefined) {
            updateData.isActive = isActive === 'true' || isActive === true;
        }

        if (imageUrls.length > 0) {
            updateData.images = imageUrls;
        }
        
        const ad = await AdCampaign.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        if (!ad) {
            return res.status(404).json({ success: false, message: 'Ad not found' });
        }
        
        res.status(200).json({ success: true, data: ad });
    } catch (error) {
        console.error('Error updating ad:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// GET /api/ads
exports.getAds = async (req, res) => {
    try {
        const ads = await AdCampaign.find();
        res.status(200).json({ success: true, data: ads });
    } catch (error) {
        console.error('Error fetching ads:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// DELETE /api/ads/:id
exports.deleteAd = async (req, res) => {
    try {
        const ad = await AdCampaign.findByIdAndDelete(req.params.id);
        if (!ad) {
            return res.status(404).json({ success: false, message: 'Ad not found' });
        }
        // Ideally, delete the files from the filesystem too
        ad.images.forEach(imageUrl => {
            try {
                if (imageUrl.includes('/uploads/ads/')) {
                    const filename = imageUrl.split('/uploads/ads/')[1];
                    const filepath = path.join(__dirname, '../uploads/ads', filename);
                    if (fs.existsSync(filepath)) {
                        fs.unlinkSync(filepath);
                    }
                }
            } catch (e) {
                console.error('Error deleting file:', e);
            }
        });
        res.status(200).json({ success: true, message: 'Ad deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
