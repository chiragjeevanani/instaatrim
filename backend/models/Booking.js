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
  // Booking rewards (from Platform Settings at booking time)
  instantDiscount: { type: Number, default: 0 },
  walletRedeemed: { type: Number, default: 0 },
  walletCashback: { type: Number, default: 0 },
  // Cashback is credited only once the service is Completed; wallet used is refunded on Cancel / No-Show
  cashbackPending: { type: Boolean, default: false }, // true = waiting for Completed (old bookings got it at booking time)
  cashbackCredited: { type: Boolean, default: false },
  walletRefunded: { type: Boolean, default: false },
  finalPaid: { type: Number, required: true },
  couponApplied: { type: String },
  preferredProduct: { type: String },
  paymentMethod: { type: String }, // e.g. "Pay Online", "Pay at Salon (COD)"
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Successful'], default: 'Pending' },
  transactionId: { type: String },
  staffId: { type: String },
  staffName: { type: String }, // stylist the customer picked at checkout
  stationId: { type: String },
  status: { type: String, enum: ['Confirmed', 'Active', 'Completed', 'Cancelled', 'No-Show'], default: 'Confirmed' },
  cancelReason: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
