const mongoose = require('mongoose');

const ritualSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    category: { type: String },
    tag: { type: String },
    price: { type: Number },
    originalPrice: { type: Number },
    startingPrice: { type: Number },
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' },
    image: { type: String },
    rating: { type: Number, default: 4.9 },
    isActive: { type: Boolean, default: true },
    type: { type: String, enum: ['skincare', 'trend'], default: 'skincare' }
}, { timestamps: true });

module.exports = mongoose.model('Ritual', ritualSchema);
