const mongoose = require('mongoose');
const Station = require('../models/Station');
const Salon = require('../models/Salon');

const STAFF_FIELDS = 'name role rating reviewCount serviceCategories';

const cleanStaff = (staffId) =>
    staffId && staffId !== '' && staffId !== 'null' && staffId !== 'undefined' ? staffId : null;

// Keep salon.totalChairs equal to the real number of stations
const syncChairCount = async (salonId) => {
    try {
        const count = await Station.countDocuments({ salonId });
        await Salon.findByIdAndUpdate(salonId, { totalChairs: count, stationsInitialized: true });
    } catch (e) {
        console.error('[Station] chair count sync failed:', e.message);
    }
};

// Salon partner may only touch its own stations (admin may touch any)
const assertOwner = (req, salonId) => !req.salon || String(req.salon._id) === String(salonId);

exports.getStationsBySalon = async (req, res) => {
    try {
        const salonId = req.params.salonId;
        if (!mongoose.Types.ObjectId.isValid(salonId)) {
            return res.status(400).json({ success: false, message: 'Invalid salon ID' });
        }
        let stations = await Station.find({ salonId }).populate('staffId', STAFF_FIELDS).sort({ createdAt: 1 });

        const salon = await Salon.findById(salonId).select('totalChairs stationsInitialized');
        if (!salon) {
            return res.status(404).json({ success: false, message: 'Salon not found' });
        }

        if (stations.length > 0 && !salon.stationsInitialized) {
            salon.stationsInitialized = true;
            await salon.save();
        }

        // One-time migration only: older salons had just totalChairs (from onboarding).
        // Create real Station docs ONCE. If the salon later deletes all chairs, keep it empty.
        if (stations.length === 0 && !salon.stationsInitialized) {
            const chairCount = Math.max(0, Number(salon.totalChairs) || 0);
            if (chairCount > 0) {
                stations = await Station.insertMany(
                    Array.from({ length: chairCount }, (_, index) => ({ salonId, name: `Chair ${index + 1}` }))
                );
            }
            salon.stationsInitialized = true;
            await salon.save();
        }

        res.status(200).json({ success: true, data: stations });
    } catch (error) {
        console.error('getStationsBySalon error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.createStation = async (req, res) => {
    try {
        const salonId = req.salon ? req.salon._id : req.body.salonId;
        const name = String(req.body.name || '').trim();
        if (!salonId || !name) {
            return res.status(400).json({ success: false, message: 'SalonId and Name are required' });
        }
        const newStation = new Station({ salonId, name, staffId: cleanStaff(req.body.staffId) });
        await newStation.save();
        if (newStation.staffId) {
            await newStation.populate('staffId', STAFF_FIELDS);
        }
        await syncChairCount(salonId);
        res.status(201).json({ success: true, data: newStation });
    } catch (error) {
        console.error('createStation error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

exports.updateStation = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid station ID' });
        }
        const existing = await Station.findById(req.params.id).select('salonId');
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Station not found' });
        }
        if (!assertOwner(req, existing.salonId)) {
            return res.status(403).json({ success: false, message: 'You can only edit your own salon chairs.' });
        }

        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.id;
        delete updateData.salonId; // a chair can't be moved to another salon
        if ('staffId' in updateData) updateData.staffId = cleanStaff(updateData.staffId);

        const updated = await Station.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('staffId', STAFF_FIELDS);
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('updateStation error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
};

exports.deleteStation = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid station ID' });
        }
        const existing = await Station.findById(req.params.id).select('salonId');
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Station not found' });
        }
        if (!assertOwner(req, existing.salonId)) {
            return res.status(403).json({ success: false, message: 'You can only delete your own salon chairs.' });
        }
        await Station.findByIdAndDelete(req.params.id);
        await syncChairCount(existing.salonId);
        res.status(200).json({ success: true, message: 'Station deleted' });
    } catch (error) {
        console.error('deleteStation error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
