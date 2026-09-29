const Ritual = require('../models/Ritual');

exports.createRitual = async (req, res) => {
    try {
        const {
            title, subtitle, description, category, tag,
            price, originalPrice, startingPrice, salonId,
            rating, isActive, type
        } = req.body;

        let image = '';
        if (req.file) {
            // Build the URL based on the request host
            const protocol = req.protocol;
            const host = req.get('host');
            image = `${protocol}://${host}/uploads/${req.file.filename}`;
        } else if (req.body.image) {
            image = req.body.image;
        }

        const newRitual = new Ritual({
            title, subtitle, description, category, tag,
            price, originalPrice, startingPrice, salonId,
            image, rating, isActive, type
        });

        const savedRitual = await newRitual.save();
        
        const responseData = savedRitual.toObject();
        responseData.id = savedRitual._id.toString();

        res.status(201).json({ success: true, data: responseData });
    } catch (error) {
        console.error('Error creating ritual:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAllRituals = async (req, res) => {
    try {
        const rituals = await Ritual.find().sort({ createdAt: -1 });
        const data = rituals.map(r => {
            const doc = r.toObject();
            doc.id = r._id.toString();
            return doc;
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching rituals:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateRitual = async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        if (req.file) {
            const protocol = req.protocol;
            const host = req.get('host');
            updateData.image = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        const updatedRitual = await Ritual.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );

        if (!updatedRitual) {
            return res.status(404).json({ success: false, message: 'Ritual not found' });
        }

        const responseData = updatedRitual.toObject();
        responseData.id = updatedRitual._id.toString();

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        console.error('Error updating ritual:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteRitual = async (req, res) => {
    try {
        const deletedRitual = await Ritual.findByIdAndDelete(req.params.id);
        if (!deletedRitual) {
            return res.status(404).json({ success: false, message: 'Ritual not found' });
        }
        res.status(200).json({ success: true, message: 'Ritual deleted successfully' });
    } catch (error) {
        console.error('Error deleting ritual:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
