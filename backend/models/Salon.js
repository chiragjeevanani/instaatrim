const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // bcrypt hashed
    category: { type: String },
    city: { type: String },
    area: { type: String },
    address: { type: String },
    openTime: { type: String },
    closeTime: { type: String },
    totalChairs: { type: Number, default: 4 },
    amenities: [{ type: String }],
    coverImage: { type: String },
    gstin: { type: String },
    shopActLicense: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, default: 'Pending' },
    commissionRate: { type: String, default: 'Pending Admin Approval' },
    isStoreOpen: { type: Boolean, default: true },
    hasInstantBooking: { type: Boolean, default: true },
    rating: { type: Number, default: 0.0 },
    isBoosted: { type: Boolean, default: false },
    isSponsored: { type: Boolean, default: false },
    boostRank: { type: Number },
    sponsorBadge: { type: String },
    boostReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Salon', salonSchema);
