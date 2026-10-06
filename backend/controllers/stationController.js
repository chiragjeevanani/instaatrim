const Station = require('../models/Station');
const Salon = require('../models/Salon');

exports.getStationsBySalon = async (req, res) => {
    try {
        const salonId = req.params.salonId;
        let stations = await Station.find({ salonId }).sort({ createdAt: 1 });

        // Older salons only have totalChairs on their salon record. Create
        // real Station documents on first load so their chairs can be edited
        // and deleted using MongoDB IDs instead of temporary UI IDs.
        if (stations.length === 0) {
            const salon = await Salon.findById(salonId).select('totalChairs');
            if (!salon) {
                return res.status(404).json({ success: false, message: 'Salon not found' });
            }

            const chairCount = Math.max(0, Number(salon.totalChairs) || 4);
            if (chairCount > 0) {
                stations = await Station.insertMany(
                    Array.from({ length: chairCount }, (_, index) => ({
                        salonId,
                        name: `Chair ${index + 1}`,
                    }))
                );
            }
        }

        res.status(200).json({ success: true, data: stations });
    } catch (error) {
        console.error('getStationsBySalon error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.createStation = async (req, res) => {
    try {
        const { salonId, name, staffId } = req.body;
        if (!salonId || !name) {
            return res.status(400).json({ success: false, message: 'SalonId and Name are required' });
        }
        const newStation = new Station({ salonId, name, staffId });
        await newStation.save();
        res.status(201).json({ success: true, data: newStation });
    } catch (error) {
        console.error('createStation error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateStation = async (req, res) => {
    try {
        const updated = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteStation = async (req, res) => {
    try {
        const deletedStation = await Station.findByIdAndDelete(req.params.id);
        if (!deletedStation) {
            return res.status(404).json({ success: false, message: 'Station not found' });
        }
        res.status(200).json({ success: true, message: 'Station deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
