const mongoose = require('mongoose');
const Service = require('../models/Service');

exports.getServices = async (req, res) => {
    try {
        const filter = req.query.salonId ? { salonId: req.query.salonId } : {};
        const services = await Service.find(filter).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: services.length, data: services });
    } catch (error) {
        console.error('getServices error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.createService = async (req, res) => {
    try {
        const { name, category, subcategory, description, duration, price, originalPrice, isInstantEligible, image, isActive } = req.body;

        // Salon partners can only add services to their OWN salon, and only after admin approval.
        // Admin may pass salonId explicitly.
        let salonId = req.body.salonId;
        if (req.salon) {
            salonId = req.salon._id;
            if (!req.salon.isVerified || req.salon.verificationStatus !== 'Live') {
                return res.status(403).json({ success: false, message: 'Your salon is pending admin approval. You can list services only after approval.' });
            }
        }

        if (!category || !String(category).trim()) {
            return res.status(400).json({ success: false, message: 'Category is required' });
        }

        if (!salonId || !name || !price) {
            return res.status(400).json({ success: false, message: 'SalonId, name, and price are required' });
        }

        // Parse duration string into number (e.g. "1 hr 30 mins" -> 90, "45" -> 45)
        let parsedDuration = 30;
        if (typeof duration === 'number') {
            parsedDuration = duration;
        } else if (typeof duration === 'string') {
            const hrMatch = duration.match(/(\d+)\s*hr/);
            const minMatch = duration.match(/(\d+)\s*min/);
            let totalMins = 0;
            if (hrMatch) totalMins += parseInt(hrMatch[1], 10) * 60;
            if (minMatch) totalMins += parseInt(minMatch[1], 10);
            if (totalMins > 0) {
                parsedDuration = totalMins;
            } else {
                const numMatch = duration.match(/\d+/);
                if (numMatch) parsedDuration = parseInt(numMatch[0], 10);
            }
        }

        // Handle Base64 Image Upload
        let finalImage = image;
        if (image && image.startsWith('data:image')) {
            const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const fs = require('fs');
                const path = require('path');
                const extension = matches[1].split('/')[1] || 'jpg';
                const filename = `service-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
                const uploadDir = path.join(__dirname, '..', 'uploads');

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                fs.writeFileSync(path.join(uploadDir, filename), matches[2], 'base64');

                const protocol = req.protocol;
                const host = req.get('host');
                finalImage = `${protocol}://${host}/uploads/${filename}`;
            }
        }

        const newService = new Service({
            salonId,
            title: name,
            category: String(category).trim(),
            subcategory: subcategory ? String(subcategory).trim() : '',
            description,
            duration: parsedDuration,
            price,
            originalPrice,
            isInstantEligible: isInstantEligible !== undefined ? isInstantEligible : true,
            isActive: isActive !== undefined ? isActive : true,
            image: finalImage
        });

        await newService.save();

        res.status(201).json({ success: true, data: newService });
    } catch (error) {
        console.error('createService error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({ success: false, message: 'Valid service ID is required' });
        }

        const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id: id };

        let updateData = { ...req.body };

        if (req.salon) {
            const existing = await Service.findOne(query).select('salonId');
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Service not found' });
            }
            if (String(existing.salonId) !== String(req.salon._id)) {
                return res.status(403).json({ success: false, message: 'You can only edit your own salon services.' });
            }
            // Salons cannot move a service to another salon or grant themselves paid boosts
            ['salonId', 'isBoosted', 'isSponsored', 'boostRank', 'sponsorBadge', 'boostReason'].forEach((k) => delete updateData[k]);
        }
        
        // Never allow updating immutable MongoDB _id / id
        delete updateData._id;
        delete updateData.id;

        // Map name back to title for schema compatibility if present
        if (updateData.name) {
            updateData.title = updateData.name;
            delete updateData.name;
        }

        // Handle duration string parsing if it exists
        if (updateData.duration !== undefined) {
            if (typeof updateData.duration === 'string') {
                const hrMatch = updateData.duration.match(/(\d+)\s*hr/);
                const minMatch = updateData.duration.match(/(\d+)\s*min/);
                let totalMins = 0;
                if (hrMatch) totalMins += parseInt(hrMatch[1], 10) * 60;
                if (minMatch) totalMins += parseInt(minMatch[1], 10);
                if (totalMins > 0) {
                    updateData.duration = totalMins;
                } else {
                    const numMatch = updateData.duration.match(/\d+/);
                    updateData.duration = numMatch ? parseInt(numMatch[0], 10) : 30;
                }
            }
        }

        // Handle Base64 Image Upload for Update
        if (updateData.image && updateData.image.startsWith('data:image')) {
            const matches = updateData.image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const fs = require('fs');
                const path = require('path');
                const extension = matches[1].split('/')[1] || 'jpg';
                const filename = `service-${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
                const uploadDir = path.join(__dirname, '..', 'uploads');

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                fs.writeFileSync(path.join(uploadDir, filename), matches[2], 'base64');

                const protocol = req.protocol;
                const host = req.get('host');
                updateData.image = `${protocol}://${host}/uploads/${filename}`;
            }
        }

        const updatedService = await Service.findOneAndUpdate(query, updateData, { new: true });
        
        if (!updatedService) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.status(200).json({ success: true, data: updatedService });
    } catch (error) {
        console.error('updateService error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({ success: false, message: 'Valid service ID is required' });
        }

        const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id: id };

        if (req.salon) {
            const existing = await Service.findOne(query).select('salonId');
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Service not found' });
            }
            if (String(existing.salonId) !== String(req.salon._id)) {
                return res.status(403).json({ success: false, message: 'You can only delete your own salon services.' });
            }
        }

        const deletedService = await Service.findOneAndDelete(query);
        
        if (!deletedService) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.status(200).json({ success: true, message: 'Service deleted' });
    } catch (error) {
        console.error('deleteService error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};
