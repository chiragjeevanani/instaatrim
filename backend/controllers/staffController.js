const Staff = require('../models/Staff');
const { identify } = require('../middlewares/accessControl');

// Salon partner may only touch its own staff (admin: any)
const ownsStaff = async (req, staffId) => {
    const a = identify(req);
    if (a.admin) return true;
    const st = await Staff.findById(staffId).select('salonId').lean().catch(() => null);
    return !!st && String(st.salonId) === a.salonId;
};

exports.createStaff = async (req, res) => {
    try {
        const { rating, reviewCount, ...safeBody } = req.body; // rating comes only from real reviews
        const staff = new Staff({ ...safeBody, salonId: req.params.salonId });
        await staff.save();

        const staffData = staff.toObject();
        staffData.id = staff._id.toString();

        res.status(201).json({ success: true, data: staffData });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getStaffBySalon = async (req, res) => {
    try {
        const salonId = req.params.salonId;
        const staffList = await Staff.find({ salonId });
        const mappedList = staffList.map(st => {
            const data = st.toObject();
            data.id = st._id.toString();
            return data;
        });
        res.status(200).json({ success: true, data: mappedList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllStaff = async (req, res) => {
    try {
        const staffList = await Staff.find({});
        const mappedList = staffList.map(st => {
            const data = st.toObject();
            data.id = st._id.toString();
            return data;
        });
        res.status(200).json({ success: true, data: mappedList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        if (!(await ownsStaff(req, req.params.id))) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        const { rating, reviewCount, salonId, ...safeBody } = req.body; // rating comes only from real reviews
        const staff = await Staff.findByIdAndUpdate(req.params.id, safeBody, { new: true, runValidators: true });
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        const staffData = staff.toObject();
        staffData.id = staff._id.toString();
        res.status(200).json({ success: true, data: staffData });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const Station = require('../models/Station');

exports.deleteStaff = async (req, res) => {
    try {
        const staffId = req.params.id;
        if (!(await ownsStaff(req, staffId))) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        const staff = await Staff.findByIdAndDelete(staffId);

        // Also unassign any station chair referencing this deleted staff
        await Station.updateMany({ staffId }, { $set: { staffId: null } });

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error('deleteStaff error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
