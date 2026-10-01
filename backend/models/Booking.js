const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  _id: { type: String }, // Custom ID like IT-220001
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String },
  salonId: { type: String, required: true },
  salonName: { type: String, required: true },
  address: { type: String },
  bookingMode: { type: String, enum: ['Scheduled', 'Instant'], default: 'Scheduled' },
  dateKey: { type: String }, // e.g. "2026-10-02"
  time: { type: String }, // e.g. "11:00 AM" or "Within 15 mins"
  services: [
    {
      id: { type: String },
      name: { type: String },
      price: { type: Number },
      quantity: { type: Number, default: 1 },
      duration: { type: String }
    }
  ],
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  finalPaid: { type: Number, required: true },
  couponApplied: { type: String },
  preferredProduct: { type: String },
  paymentMethod: { type: String }, // e.g. "Pay Online", "Pay at Salon (COD)"
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Successful'], default: 'Pending' },
  transactionId: { type: String },
  staffId: { type: String },
  stationId: { type: String },
  status: { type: String, enum: ['Confirmed', 'Active', 'Completed', 'Cancelled', 'No-Show'], default: 'Confirmed' },
  cancelReason: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
