const Booking = require('../models/Booking');

exports.createBooking = async (req, res) => {
    try {
        const bookingData = req.body;

        // Custom ID generation for "IT-XXXXXX"
        const count = await Booking.countDocuments();
        const customId = `IT-${220000 + count + 1}`; // Start from 220001
        
        const booking = new Booking({
            ...bookingData,
            _id: customId // Optional: Use this as _id or keep standard ObjectId and add a custom id field
        });

        const savedBooking = await booking.save();

        res.status(201).json({ success: true, data: savedBooking });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCustomerBookings = async (req, res) => {
    try {
        const { customerId } = req.params;
        const bookings = await Booking.find({ customerId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSalonBookings = async (req, res) => {
    try {
        const { salonId } = req.params;
        const bookings = await Booking.find({ salonId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, cancelReason } = req.body;
        
        const updateData = { status };
        if (cancelReason) updateData.cancelReason = cancelReason;

        const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.status(200).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
