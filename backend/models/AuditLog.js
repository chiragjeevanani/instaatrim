const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g., 'SALON_LOGIN', 'PAYOUT_TRIGGERED', 'GDPR_DATA_EXPORT'
    performedBy: { type: String, required: true }, // userId, salonId, or 'SYSTEM'
    role: { type: String, default: 'USER' }, // 'CUSTOMER', 'SALON', 'ADMIN', 'SYSTEM'
    ipAddress: { type: String },
    userAgent: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
    requestId: { type: String },
    timestamp: { type: Date, default: Date.now }
}, {
    // Immutable collection configuration
    timestamps: false,
    versionKey: false
});

// Enforce append-only / immutable constraint on schema hooks
auditLogSchema.pre('findOneAndUpdate', function() {
    throw new Error('Audit logs are immutable and cannot be updated.');
});
auditLogSchema.pre('updateOne', function() {
    throw new Error('Audit logs are immutable and cannot be updated.');
});
auditLogSchema.pre('deleteOne', function() {
    throw new Error('Audit logs are immutable and cannot be deleted.');
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
