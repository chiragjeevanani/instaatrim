const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // bcrypt hashed
    category: { type: mongoose.Schema.Types.Mixed }, // Can be ObjectId ref or plain string
    subcategories: [{ type: String }],
    city: { type: String },
    area: { type: String },
    pincode: { type: String, default: '' },
    address: { type: String },
    openTime: { type: String },
    closeTime: { type: String },
    totalChairs: { type: Number, default: 4 },
    // True once real Station documents were created for this salon. After that,
    // chairs are managed only by the salon (deleting all must NOT auto-recreate them).
    stationsInitialized: { type: Boolean, default: false },
    amenities: [{ type: String }],
    coverImage: { type: String },
    gstin: { type: String },
    shopActLicense: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    payoutCycle: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationStatus: { type: String, default: 'Pending' },
    commissionRate: { type: String, default: 'Pending Admin Approval' },
    isStoreOpen: { type: Boolean, default: true },
    hasInstantBooking: { type: Boolean, default: true },
    rating: { type: Number, default: 0.0 }, // average of real customer reviews (auto-calculated)
    reviewsCount: { type: Number, default: 0 },
    isBoosted: { type: Boolean, default: false },
    isSponsored: { type: Boolean, default: false },
    boostRank: { type: Number },
    sponsorBadge: { type: String },
    boostReason: { type: String },
    fcmtoken: { type: String },
    fcmtokenweb: { type: String },
    offers: [{ type: mongoose.Schema.Types.Mixed }],
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date, default: null },
    refreshToken: { type: String, default: null },
    // Franchise / Multi-Branch Chain Support (Looks, Apple, Enrich, etc.)
    organizationType: { type: String, enum: ['Independent Salon', 'Franchise Branch', 'Chain Outlet'], default: 'Independent Salon' },
    parentBrandName: { type: String, default: '' },
    branchName: { type: String, default: '' },
    // Real coordinates from GPS / place search only — no hardcoded default city.
    // Left unset when unknown (2dsphere index skips docs without it).
    location: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number], default: undefined } // [longitude, latitude]
    }
}, { timestamps: true });

salonSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Salon', salonSchema);
