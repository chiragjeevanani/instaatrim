const mongoose = require('mongoose');

const heroBannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    desc: { type: String },
    ctaText: { type: String },
    tag: { type: String },
    image: { type: String, required: true },
    salonId: { type: String },
    serviceId: { type: String },
    link: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('HeroBanner', heroBannerSchema);
