const mongoose = require('mongoose');

// Admin-managed copy for the public marketing landing page. Stored as one
// document holding the whole section tree; the frontend merges it over its
// built-in defaults, so new sections render even before an admin saves them.
const landingContentSchema = new mongoose.Schema({
    key: { type: String, default: 'main', unique: true },
    content: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true, minimize: false });

module.exports = mongoose.model('LandingContent', landingContentSchema);
