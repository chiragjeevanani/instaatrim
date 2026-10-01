const Staff = require('../models/Staff');

exports.createStaff = async (req, res) => {
    try {
        const staff = new Staff({ ...req.body, salonId: req.params.salonId });
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
        const staffList = await Staff.find({ salonId: req.params.salonId });
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
        const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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

exports.deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
