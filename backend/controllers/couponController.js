const Coupon = require('../models/Coupon');

exports.createCoupon = async (req, res) => {
    try {
        const newCoupon = new Coupon(req.body);
        const savedCoupon = await newCoupon.save();
        
        const responseData = savedCoupon.toObject();
        responseData.id = savedCoupon._id.toString();

        res.status(201).json({ success: true, data: responseData });
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        const data = coupons.map(c => {
            const doc = c.toObject();
            doc.id = c._id.toString();
            return doc;
        });
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );

        if (!updatedCoupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        const responseData = updatedCoupon.toObject();
        responseData.id = updatedCoupon._id.toString();

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!deletedCoupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
